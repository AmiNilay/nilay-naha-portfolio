import { TOTP, Secret } from "otpauth";
import crypto from "crypto";
import QRCode from "qrcode";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const keyMaterial = process.env.ADMIN_SECRET || "fallback-key-change-in-production";
  return crypto.createHash("sha256").update(keyMaterial).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns format: iv(hex):authTag(hex):ciphertext(hex)
 */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Expects format: iv(hex):authTag(hex):ciphertext(hex)
 */
export function decryptSecret(encryptedData: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedData.split(":");

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Creates a TOTP instance.
 * If existingSecretBase32 is provided, uses it. Otherwise generates a new secret.
 */
export function createTOTP(
  email: string,
  existingSecretBase32?: string
): { totp: TOTP; secretBase32: string } {
  const secret = existingSecretBase32
    ? Secret.fromBase32(existingSecretBase32)
    : new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: "NilayNaha",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  return { totp, secretBase32: secret.base32 };
}

/**
 * Generates a QR code data URL from a TOTP instance.
 */
export async function generateQRCodeDataURL(totp: TOTP): Promise<string> {
  return QRCode.toDataURL(totp.toString(), {
    width: 256,
    margin: 2,
  });
}