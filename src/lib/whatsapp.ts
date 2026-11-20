/**
 * WhatsApp Automated Message Generator & Formatter for Sri Lanka
 */

export interface WhatsAppOrderDetails {
  customerName: string;
  customerPhone?: string | null;
  orderNumber: string;
  productTitle: string;
  vlessUri?: string | null;
  keyPayload?: string | null;
  quotaLabel?: string;
  validityDays?: number;
  totalLKR: number;
}

/**
 * Normalizes Sri Lankan mobile numbers into WhatsApp E.164 without plus:
 * e.g. "0771234567" -> "94771234567", "+94 77 123 4567" -> "94771234567"
 */
export function formatSriLankanWhatsAppNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('94')) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `94${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `94${digits}`;
  }
  return digits;
}

/**
 * Builds the official WhatsApp order dispatch text
 */
export function buildWhatsAppDispatchMessage(details: WhatsAppOrderDetails): string {
  const {
    customerName,
    orderNumber,
    productTitle,
    vlessUri,
    keyPayload,
    quotaLabel = 'Unlimited',
    validityDays = 30,
    totalLKR,
  } = details;

  const configText = vlessUri || keyPayload || 'Generating your configuration...';
  const subLink = vlessUri && vlessUri.includes('@')
    ? `https://fibez.store/v2ray/sub?key=${encodeURIComponent(vlessUri.split('@')[0].replace('vless://', ''))}`
    : 'https://fibez.store/v2ray/dashboard';

  return `⚡ *FIBEZ STORE — ORDER DISPATCHED* ⚡

Hello *${customerName}*, your payment has been verified and your order is active!

📋 *Order Details:*
• *Order #:* ${orderNumber}
• *Product:* ${productTitle}
• *Data Plan:* ${quotaLabel} (${validityDays} Days)
• *Amount Paid:* Rs. ${totalLKR.toLocaleString()}

🔑 *Your Access Credentials / VLESS Link:*
\`\`\`
${configText}
\`\`\`

📲 *1-Tap Import into NetMod / V2Box:*
${subLink}

⏳ *Validity:* ${validityDays} Days (Renewable on same UUID)
🔄 *Renew Later:* https://fibez.store/v2ray?renew=${orderNumber}

Need help setting up? Reply to this message or visit https://fibez.store/tickets
*Thank you for trusting Fibez!*`;
}

/**
 * Generates the full click-to-chat WhatsApp link
 */
export function getWhatsAppDispatchUrl(details: WhatsAppOrderDetails): string {
  const phone = formatSriLankanWhatsAppNumber(details.customerPhone);
  const message = buildWhatsAppDispatchMessage(details);
  const encoded = encodeURIComponent(message);

  if (phone) {
    return `https://wa.me/${phone}?text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}
