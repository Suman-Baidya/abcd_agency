// Universal Session Token Signing & Verification using Web Crypto API (SubtleCrypto)
// Fully compatible with Next.js Edge Runtime (middleware) and Node.js Runtime.

export interface SessionTokenPayload {
  uid: string;
  role: string;
  exp: number; // Unix timestamp in seconds
}

const DEFAULT_SECRET = "abcd-agency-secure-signing-secret-fallback-key-2026";

function getSecretKey(): string {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Signs a session payload into a compact token: <payload_b64>.<sig_b64>
 */
export async function signSessionToken(
  payload: Omit<SessionTokenPayload, "exp">,
  expiresInSeconds: number
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: SessionTokenPayload = { ...payload, exp };

  const encoder = new TextEncoder();
  const payloadJson = JSON.stringify(fullPayload);
  const payloadB64 = base64UrlEncode(encoder.encode(payloadJson));

  const key = await getCryptoKey(getSecretKey());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );

  const sigB64 = base64UrlEncode(signature);
  return `${payloadB64}.${sigB64}`;
}

/**
 * Verifies a session token, returning the payload if valid and unexpired, or null otherwise.
 */
export async function verifySessionToken(
  token: string | null | undefined
): Promise<SessionTokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  try {
    const encoder = new TextEncoder();
    const key = await getCryptoKey(getSecretKey());
    const signatureBytes = base64UrlDecode(sigB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as any,
      encoder.encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const decoder = new TextDecoder();
    const payload: SessionTokenPayload = JSON.parse(decoder.decode(payloadBytes));

    const currentEpoch = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < currentEpoch) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export interface ResetTokenPayload {
  uid: string;
  email: string;
  type: "pwd_reset";
  exp: number;
}

/**
 * Generates a signed password reset token valid for 1 hour.
 */
export async function signPasswordResetToken(
  userId: string,
  email: string,
  expiresInSeconds = 3600
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: ResetTokenPayload = { uid: userId, email, type: "pwd_reset", exp };

  const encoder = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(encoder.encode(payloadJson));

  const key = await getCryptoKey(getSecretKey());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );

  const sigB64 = base64UrlEncode(signature);
  return `${payloadB64}.${sigB64}`;
}

/**
 * Validates a password reset token.
 */
export async function verifyPasswordResetToken(
  token: string | null | undefined
): Promise<ResetTokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  try {
    const encoder = new TextEncoder();
    const key = await getCryptoKey(getSecretKey());
    const signatureBytes = base64UrlDecode(sigB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as any,
      encoder.encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const decoder = new TextDecoder();
    const payload: ResetTokenPayload = JSON.parse(decoder.decode(payloadBytes));

    const currentEpoch = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < currentEpoch || payload.type !== "pwd_reset") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
