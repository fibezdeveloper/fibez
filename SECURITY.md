# SECURITY ARCHITECTURE & THREAT MODEL SPECIFICATION
## System: Fibez — Automated Digital Goods & Subscription Marketplace
**Classification:** Restricted / High-Integrity E-Commerce  
**Primary Assets Protected:** Digital Vault Inventory, Customer Secret Credentials, Bank Payment Receipts, Financial Transactions.

---

## 1. Threat Model & Asset Inventory

| Asset | Sensitivity | Threat Vector | Mitigation Strategy |
|---|---|---|---|
| **Inventory Stock (Keys, Accounts, V2Ray Configs)** | **CRITICAL** | Database compromise, insider threat, unauthorized disclosure | Envelope AES-256-GCM encryption at rest; secrets never stored in plaintext |
| **Inventory Allocation** | **CRITICAL** | Double-spend race conditions, concurrent checkout abuse | PostgreSQL row-level locks (`SELECT ... FOR UPDATE SKIP LOCKED`) inside atomic transactions |
| **Payment Webhooks** | **HIGH** | Webhook spoofing, replay attacks, parameter tampering | HMAC-SHA256 signature verification, monotonic timestamp checks, idempotency ledger |
| **Bank Transfer Receipts** | **HIGH** | Malicious file upload (RCE/XSS), customer PII leaks, forged receipts | Magic-byte file validation, EXIF stripping, private cloud storage with signed time-limited URLs |
| **Customer Vault Access** | **HIGH** | Account takeover, credential stuffing, session hijacking | Argon2id password hashing, HTTP-Only SameSite=Strict cookies, OAuth 2.0 PKCE, rate-limited auth |
| **Admin Operations** | **CRITICAL** | Unauthorized privilege escalation, fake order approvals | Role-Based Access Control (RBAC) enforced at DB/Server Action layer; tamper-evident audit logging |

---

## 2. Key Vault Cryptographic Architecture

### 2.1 Encryption at Rest (AES-256-GCM)
Digital goods (serial keys, account passwords, V2Ray URI configs) are encrypted **before insertion into the database** and decrypted **only at the exact moment of authorized retrieval**.

```
Plaintext Payload 
       │
       ▼
[ AES-256-GCM Engine ] ◄── Master Encryption Key (VAULT_MASTER_KEY, 32 bytes)
       │
       ├─► Ciphertext (Base64)
       ├─► Initialization Vector (IV, 12 bytes / 96-bit unique per row)
       └─► Authentication Tag (16 bytes / 128-bit integrity tag)
```

- **Key Management**: `VAULT_MASTER_KEY` is loaded strictly via environment variables (e.g. AWS Secrets Manager, Doppler, or Vercel Environment Secrets) and never committed to source control or logged.
- **Integrity Verification**: AES-GCM provides authenticated encryption. Any tampering with the ciphertext in the database will trigger an authentication tag mismatch and fail closed.
- **Zero-Logging Policy**: Unmasked keys, credentials, and connection strings are strictly scrubbed from application stdout logs, error trackers (Sentry), and monitoring traces.

---

## 3. Concurrency Control & Double-Spend Defense

In a high-speed digital goods store, concurrent checkout requests can target the final remaining unit of stock simultaneously. 

### 3.1 Atomic Inventory Allocation Query
```sql
-- Atomically reserve or dispense the oldest available stock item
WITH selected_stock AS (
    SELECT id 
    FROM inventory_items 
    WHERE product_variant_id = $1 
      AND status = 'AVAILABLE' 
    ORDER BY created_at ASC 
    LIMIT 1 
    FOR UPDATE SKIP LOCKED
)
UPDATE inventory_items 
SET status = 'DISPENSED',
    order_id = $2,
    dispensed_at = NOW()
FROM selected_stock 
WHERE inventory_items.id = selected_stock.id
RETURNING inventory_items.id;
```
- `FOR UPDATE SKIP LOCKED`: Prevents multiple concurrent checkout workers from attempting to lock or dispense the same stock item. Subsequent threads skip locked rows and claim the next available item without deadlock.
- If the CTE returns 0 rows, the transaction automatically rolls back and surfaces an immediate `OUT_OF_STOCK` error to the payment engine before charging the customer.

---

## 4. Payment Verification & Webhook Security

### 4.1 Automated Gateway Webhooks
1. **Cryptographic Signature Verification**:
   - Every incoming webhook must carry a verifiable signature in the HTTP header (e.g., `X-Signature` or `Stripe-Signature`).
   - Signatures are verified using constant-time string comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
2. **Replay Attack Mitigation**:
   - Webhook payloads include a monotonic timestamp. Requests older than 300 seconds are rejected outright.
   - An `idempotency_keys` table records each processed webhook event ID. If a duplicate webhook event ID is received, an immediate `200 OK` is returned without re-executing stock dispensing.

### 4.2 Manual Bank Transfer Slip Upload Hardening
Manual bank slip verification exposes the system to untrusted user file uploads:
1. **Magic-Byte Inspection**: File headers are validated against binary magic bytes (e.g., `89 50 4E 47` for PNG, `FF D8 FF` for JPEG, `25 50 44 46` for PDF). File extensions and client `Content-Type` headers are disregarded.
2. **Metadata & EXIF Stripping**: Uploaded image buffers are parsed through an image processor (such as Sharp) to strip GPS coordinates, camera metadata, and hidden embedded payloads.
3. **Storage Isolation**: Receipts are never written to the web server's local filesystem or public web roots. Files are streamed directly to a private cloud bucket (S3 / R2).
4. **Time-Limited Signed Access**: Admin previews in the Command Center utilize pre-signed URLs valid for a maximum of 15 minutes.

---

## 5. Authentication & Session Security

### 5.1 Password Hashing Specification
- Algorithm: **Argon2id** (memory cost: 65,536 KB, iterations: 3, parallelism: 4) or **Bcrypt** (cost factor: 12).
- Resistant to GPU/ASIC brute-force cracking.

### 5.2 Session Integrity
- Cookies are issued with:
  - `HttpOnly = true` (Inaccessible to client-side JavaScript / XSS defense).
  - `Secure = true` (Transmitted only over HTTPS).
  - `SameSite = Strict` (Mitigates Cross-Site Request Forgery / CSRF).
- OAuth 2.0 flows (Google, Discord) strictly implement **PKCE (Proof Key for Code Exchange)** and cryptographic state parameters to prevent authorization code interception.

---

## 6. Access Control & Audit Trails

### 6.1 Role-Based Access Matrix
| Resource / Action | Customer | Support Agent | Admin |
|---|---|---|---|
| View Public Storefront & Stock Counts | Allowed | Allowed | Allowed |
| Place Order & Initiate Checkout | Allowed | Allowed | Allowed |
| View Own Key Vault & Reveal Purchased Keys | Allowed (Own Only) | Forbidden | Allowed |
| Ingest Bulk Inventory Stock | Forbidden | Forbidden | Allowed |
| View Uploaded Bank Transfer Receipts | Forbidden | Allowed | Allowed |
| Approve / Reject Bank Slip Orders | Forbidden | Forbidden | Allowed |
| Configure Products & Pricing | Forbidden | Forbidden | Allowed |
| View Financial Analytics & Webhook Logs | Forbidden | Forbidden | Allowed |

### 6.2 Immutable Audit Ledger
All sensitive mutations are recorded in an `audit_logs` table:
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- e.g. "INVENTORY_BULK_UPLOAD", "RECEIPT_APPROVED", "KEY_REVEALED"
    target_entity VARCHAR(50),    -- "order", "inventory_item", "product"
    target_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Rate Limiting & Anti-Abuse Defenses

1. **Authentication Gate**: Max 5 failed login attempts per IP/Email per 15 minutes before temporary lock.
2. **Checkout Throttle**: Max 3 checkout initializations per user per minute to thwart stock-hoarding bots.
3. **Promo Code Protection**: Max 5 invalid promo code attempts per hour to prevent dictionary enumeration attacks.
4. **Stock Obfuscation**: Unauthenticated public endpoints receive fuzzy stock indicators (`In Stock` / `Few Left` / `Out of Stock`) rather than exact integers to prevent competitive inventory scraping.
