const ACCESS_CODE_RANDOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ACCESS_CODE_MAX_BASE_LENGTH = 24;
const ACCESS_CODE_SUFFIX_LENGTH = 4;
const ACCESS_CODE_MAX_ATTEMPTS = 8;

export type BuildUniqueAccessCodeArgs = {
  prefix: string;
  sourceText: string;
  isCodeAvailable: (code: string) => Promise<boolean>;
};

export async function buildUniqueAccessCode({
  prefix,
  sourceText,
  isCodeAvailable,
}: BuildUniqueAccessCodeArgs) {
  const base = toAccessCodeBase(sourceText);

  for (let attempt = 0; attempt < ACCESS_CODE_MAX_ATTEMPTS; attempt += 1) {
    const code = `${prefix}-${base}-${randomCodeSuffix()}`;
    if (await isCodeAvailable(code)) {
      return code;
    }
  }

  return `${prefix}-${base}-${randomCodeSuffix()}${randomCodeSuffix()}`;
}

function toAccessCodeBase(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, ACCESS_CODE_MAX_BASE_LENGTH)
    .replace(/-+$/g, '');

  return slug || 'CODE';
}

function randomCodeSuffix() {
  return Array.from({ length: ACCESS_CODE_SUFFIX_LENGTH }, () => randomCodeCharacter()).join('');
}

function randomCodeCharacter() {
  const values = new Uint32Array(1);
  globalThis.crypto?.getRandomValues(values);
  const randomValue = values[0] || Math.floor(Math.random() * ACCESS_CODE_RANDOM_CHARS.length);

  return ACCESS_CODE_RANDOM_CHARS[randomValue % ACCESS_CODE_RANDOM_CHARS.length];
}
