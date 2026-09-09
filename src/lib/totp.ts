import crypto from "crypto";
import QRCode from "qrcode";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const keyMaterial =
    process.env.ADMIN_SECRET || "fallback-key-change-in-production";
  return crypto.createHash("sha256").update(keyMaterial).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptSecret(encryptedData: string): string {
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function generateBase32Secret(length: number = 20): string {
  const buffer = crypto.randomBytes(length);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  for (let i = 0; i < buffer.length; i++) {
    result += alphabet[buffer[i] % 32];
  }
  return result;
}

function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = encoded.replace(/[=\s]/g, "").toUpperCase();

  let bits = "";
  for (const char of cleaned) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

export function generateTOTP(
  secretBase32: string,
  time?: number
): string {
  const now = time ?? Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / 30);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter & 0xffffffff, 4);

  const secretBytes = base32Decode(secretBase32);
  const hmac = crypto.createHmac("sha1", secretBytes);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

export function validateTOTP(
  secretBase32: string,
  token: string,
  windowSize: number = 1
): number | null {
  const now = Math.floor(Date.now() / 1000);

  for (let i = -windowSize; i <= windowSize; i++) {
    const checkTime = now + i * 30;
    const expected = generateTOTP(secretBase32, checkTime);

    if (timingSafeEqual(expected, token)) {
      return i;
    }
  }

  return null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

export function generateOTPAuthURI(
  email: string,
  secretBase32: string
): string {
  const issuer = "Nilay Naha Portfolio";
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export async function generateQRCodeDataURL(
  email: string,
  secretBase32: string
): Promise<string> {
  const uri = generateOTPAuthURI(email, secretBase32);
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}