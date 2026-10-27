import crypto from 'node:crypto';

const SALT_BYTES = 16;
const KEY_BYTES = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_BYTES, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `scrypt:${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith('scrypt:')) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;
  const [, salt, hexKey] = parts;
  const expected = Buffer.from(hexKey, 'hex');
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function hashInviteCode(rawCode: string): string {
  const normalized = normalizeInviteCode(rawCode);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function normalizeInviteCode(rawCode: string): string {
  return String(rawCode || '').trim().toUpperCase();
}

export function generateInviteCodeString(prefix = 'ATECH'): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (len: number) => {
    const bytes = crypto.randomBytes(len);
    let out = '';
    for (let i = 0; i < len; i++) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  };
  return `${prefix}-${seg(4)}-${seg(4)}`;
}
