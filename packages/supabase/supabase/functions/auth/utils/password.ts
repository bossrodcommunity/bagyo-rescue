import { BadRequestError } from '../../_shared/utils/errors.ts';

const algorithm = 'PBKDF2';
const digest = 'SHA-256';
const iterations = 210_000;
const keyLengthBits = 256;
const saltLengthBytes = 16;
const textEncoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const byteArray = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';

  for (const byte of byteArray) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
}

async function derivePasswordKey(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    algorithm,
    false,
    ['deriveBits']
  );

  return await crypto.subtle.deriveBits(
    {
      name: algorithm,
      hash: digest,
      salt,
      iterations,
    },
    keyMaterial,
    keyLengthBits
  );
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(saltLengthBytes));
  const hash = await derivePasswordKey(password, salt);

  return `pbkdf2_sha256$${iterations}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [scheme, iterationsPart, saltPart, hashPart] = passwordHash.split('$');

  if (
    scheme !== 'pbkdf2_sha256' ||
    iterationsPart !== String(iterations) ||
    !saltPart ||
    !hashPart
  ) {
    throw new BadRequestError('Unsupported password hash.');
  }

  const salt = fromBase64Url(saltPart);
  const expectedHash = fromBase64Url(hashPart);
  const actualHash = new Uint8Array(await derivePasswordKey(password, salt));

  return timingSafeEqual(actualHash, expectedHash);
}
