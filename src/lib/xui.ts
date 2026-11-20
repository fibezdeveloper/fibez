import https from 'https';
import crypto from 'crypto';

interface XuiAuthSession {
  cookie: string;
  csrfToken: string;
  authenticatedAt: number;
}

export interface XuiClientData {
  id?: number;
  email: string;
  uuid: string;
  subId: string;
  totalGB: number;
  expiryTime: number;
  limitIp: number;
  enable: boolean;
  comment?: string;
  inboundIds: number[];
  usedTraffic?: number;
  up?: number;
  down?: number;
}

export interface XuiInboundSummary {
  id: number;
  port: number;
  protocol: string;
  remark: string;
  up: number;
  down: number;
  total: number;
  enable: boolean;
  clientCount: number;
  clientStats?: any[];
}

class XuiClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private publicHost: string;
  private session: XuiAuthSession | null = null;
  private agent: https.Agent;

  constructor() {
    this.baseUrl = (process.env.XUI_BASE_URL || 'https://rv2ray.fibez.store:6767').replace(/\/$/, '');
    this.username = process.env.XUI_USERNAME || 'akain';
    this.password = process.env.XUI_PASSWORD || 'kariwesi';
    this.publicHost = process.env.XUI_PUBLIC_HOST || 'rv2ray.fibez.store';
    this.agent = new https.Agent({
      keepAlive: true,
      rejectUnauthorized: false,
    });
  }

  public getPublicHost(): string {
    return this.publicHost;
  }

  public updateConfig(config: { baseUrl?: string; username?: string; password?: string; publicHost?: string }) {
    if (config.baseUrl) this.baseUrl = config.baseUrl.replace(/\/$/, '');
    if (config.username) this.username = config.username;
    if (config.password) this.password = config.password;
    if (config.publicHost) this.publicHost = config.publicHost;
    this.session = null;
  }

  public getConfig(): { baseUrl: string; username: string; publicHost: string } {
    return {
      baseUrl: this.baseUrl,
      username: this.username,
      publicHost: this.publicHost,
    };
  }

  public async testConnection(): Promise<{ success: boolean; latencyMs: number; inboundsCount: number; error?: string }> {
    const start = Date.now();
    try {
      await this.authenticate(true);
      const inbounds = await this.listInbounds();
      return {
        success: true,
        latencyMs: Date.now() - start,
        inboundsCount: inbounds.length,
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        inboundsCount: 0,
        error: err?.message || 'Connection failed',
      };
    }
  }

  private rawRequest(
    path: string,
    options: https.RequestOptions,
    postData?: string
  ): Promise<{ status: number; headers: Record<string, string | string[] | undefined>; body: string }> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const req = https.request(
        url,
        {
          ...options,
          agent: this.agent,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () =>
            resolve({
              status: res.statusCode || 500,
              headers: res.headers,
              body: data,
            })
          );
        }
      );

      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * Authenticates against the 3x-ui panel with CSRF token negotiation
   */
  public async authenticate(force = false): Promise<XuiAuthSession> {
    const now = Date.now();
    // Cache session for up to 30 minutes unless forced
    if (!force && this.session && now - this.session.authenticatedAt < 30 * 60 * 1000) {
      return this.session;
    }

    // Step 1: GET / to acquire initial session cookie
    const rootRes = await this.rawRequest('/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Fibez-Panel-Client/2.0',
      },
    });

    let cookie = rootRes.headers['set-cookie']
      ? (Array.isArray(rootRes.headers['set-cookie'])
          ? rootRes.headers['set-cookie'][0]
          : rootRes.headers['set-cookie']
        ).split(';')[0]
      : '';

    // Step 2: GET /csrf-token with cookie and XMLHttpRequest header
    const csrfRes = await this.rawRequest('/csrf-token', {
      method: 'GET',
      headers: {
        Cookie: cookie,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Fibez-Panel-Client/2.0',
      },
    });

    let csrfToken = '';
    try {
      const csrfJson = JSON.parse(csrfRes.body);
      csrfToken = csrfJson.obj || '';
    } catch {
      csrfToken = '';
    }

    if (csrfRes.headers['set-cookie']) {
      const newCookie = Array.isArray(csrfRes.headers['set-cookie'])
        ? csrfRes.headers['set-cookie'][0]
        : csrfRes.headers['set-cookie'];
      cookie = newCookie.split(';')[0];
    }

    // Step 3: POST /login with form-urlencoded credentials and X-CSRF-Token
    const formPayload = new URLSearchParams({
      username: this.username,
      password: this.password,
    }).toString();

    const loginRes = await this.rawRequest(
      '/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Content-Length': Buffer.byteLength(formPayload).toString(),
          Cookie: cookie,
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken,
          'User-Agent': 'Fibez-Panel-Client/2.0',
        },
      },
      formPayload
    );

    if (loginRes.headers['set-cookie']) {
      const authCookie = Array.isArray(loginRes.headers['set-cookie'])
        ? loginRes.headers['set-cookie'][0]
        : loginRes.headers['set-cookie'];
      cookie = authCookie.split(';')[0];
    }

    let loginSuccess = false;
    try {
      const json = JSON.parse(loginRes.body);
      loginSuccess = !!json.success;
    } catch {
      loginSuccess = loginRes.status === 200;
    }

    if (!loginSuccess) {
      throw new Error(`3x-ui Authentication Failed: Status ${loginRes.status} - ${loginRes.body}`);
    }

    this.session = {
      cookie,
      csrfToken,
      authenticatedAt: now,
    };

    return this.session;
  }

  /**
   * Performs an authenticated API call with automatic re-login retry on 401/403
   */
  private async apiRequest<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    data?: any,
    isRetry = false
  ): Promise<T> {
    const session = await this.authenticate(isRetry);
    const headers: Record<string, string> = {
      Cookie: session.cookie,
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Fibez-Panel-Client/2.0',
    };

    let postData: string | undefined = undefined;
    if (data !== undefined && method !== 'GET') {
      postData = typeof data === 'string' ? data : JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
      if (session.csrfToken) {
        headers['X-CSRF-Token'] = session.csrfToken;
      }
    }

    const res = await this.rawRequest(path, { method, headers }, postData);

    if ((res.status === 401 || res.status === 403) && !isRetry) {
      // Re-authenticate and retry once
      return this.apiRequest<T>(path, method, data, true);
    }

    if (res.status >= 400) {
      throw new Error(`3x-ui API Error [${method} ${path}]: Status ${res.status} - ${res.body}`);
    }

    try {
      return JSON.parse(res.body) as T;
    } catch {
      return res.body as unknown as T;
    }
  }

  /**
   * Lists all inbounds currently registered in 3x-ui
   */
  public async listInbounds(): Promise<XuiInboundSummary[]> {
    const resp = await this.apiRequest<{ success: boolean; msg: string; obj: any[] }>('/panel/api/inbounds/list', 'GET');
    if (!resp?.success || !Array.isArray(resp.obj)) {
      return [];
    }

    return resp.obj.map((inb) => ({
      id: inb.id,
      port: inb.port,
      protocol: inb.protocol,
      remark: inb.remark || `Inbound ${inb.id}`,
      up: inb.up || 0,
      down: inb.down || 0,
      total: inb.total || 0,
      enable: inb.enable !== false,
      clientCount: Array.isArray(inb.clientStats) ? inb.clientStats.length : 0,
      clientStats: inb.clientStats || [],
    }));
  }

  /**
   * Fetches an existing client profile by email/identifier
   */
  public async getClient(email: string): Promise<XuiClientData | null> {
    try {
      const resp = await this.apiRequest<{
        success: boolean;
        msg: string;
        obj: { client: any; inboundIds?: number[]; usedTraffic?: number };
      }>(`/panel/api/clients/get/${encodeURIComponent(email)}`, 'GET');

      if (!resp?.success || !resp.obj?.client) {
        return null;
      }

      const c = resp.obj.client;
      return {
        id: c.id,
        email: c.email,
        uuid: c.uuid || c.id,
        subId: c.subId || '',
        totalGB: c.totalGB || 0,
        expiryTime: c.expiryTime || 0,
        limitIp: c.limitIp || 0,
        enable: c.enable !== false,
        comment: c.comment || '',
        inboundIds: resp.obj.inboundIds || [3],
        usedTraffic: resp.obj.usedTraffic || 0,
        up: c.traffic?.up || 0,
        down: c.traffic?.down || 0,
      };
    } catch (err: any) {
      if (err.message && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Creates or registers a new client attached to the target Inbound (1, 2, or 3)
   */
  public async createClient({
    email,
    uuid,
    subId,
    inboundId = 3,
    totalGB = 107374182400, // 100 GB default (in bytes)
    expiryDays = 30,
    limitIp = 2,
    comment = 'Fibez Customer Connection',
  }: {
    email: string;
    uuid?: string;
    subId?: string;
    inboundId?: number;
    totalGB?: number;
    expiryDays?: number;
    limitIp?: number;
    comment?: string;
  }): Promise<XuiClientData> {
    const clientUuid = uuid || crypto.randomUUID();
    const clientSubId = subId || crypto.randomBytes(8).toString('hex');
    const expiryTime = expiryDays > 0 ? Date.now() + expiryDays * 24 * 60 * 60 * 1000 : 0;

    const payload = {
      client: {
        email,
        uuid: clientUuid,
        subId: clientSubId,
        totalGB,
        expiryTime,
        limitIp,
        enable: true,
        comment,
      },
      inboundIds: [inboundId],
    };

    const resp = await this.apiRequest<{ success: boolean; msg: string; obj: any }>(
      '/panel/api/clients/add',
      'POST',
      payload
    );

    if (!resp?.success) {
      throw new Error(`Failed to create client in 3x-ui: ${resp?.msg || 'Unknown error'}`);
    }

    return {
      email,
      uuid: clientUuid,
      subId: clientSubId,
      totalGB,
      expiryTime,
      limitIp,
      enable: true,
      comment,
      inboundIds: [inboundId],
      usedTraffic: 0,
      up: 0,
      down: 0,
    };
  }

  /**
   * Deletes a client from 3x-ui
   */
  public async deleteClient(email: string): Promise<boolean> {
    try {
      const resp = await this.apiRequest<{ success: boolean; msg: string }>(
        `/panel/api/clients/del/${encodeURIComponent(email)}`,
        'POST'
      );
      return !!resp?.success;
    } catch {
      return false;
    }
  }

  /**
   * Resets consumed traffic for a specific client
   */
  public async resetClientTraffic(email: string): Promise<boolean> {
    try {
      const resp = await this.apiRequest<{ success: boolean; msg: string }>(
        `/panel/api/clients/resetTraffic/${encodeURIComponent(email)}`,
        'POST'
      );
      return !!resp?.success;
    } catch {
      return false;
    }
  }
}

export const xui = new XuiClient();
export default xui;
