import { readFile } from 'node:fs/promises';

// Data only: this module never starts processes or expands shell expressions.
const literal = expected => value => value === expected;
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(value);
const version = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9.+_~-]{0,63}$/.test(value);
const linuxPath = value => typeof value === 'string'
  && value.length <= 4096
  && (value.startsWith('/') || value.startsWith('~/'))
  && !/[\x00-\x1f\x7f$`\\]/.test(value)
  && !value.split('/').includes('..')
  && value !== '/' && value !== '~/';

const schema = {
  schemaVersion: literal(1),
  target: { platform: literal('linux'), architecture: literal('x64'), ubuntuVersion: literal('24.04') },
  paths: Object.fromEntries([
    'labDirectory', 'srsranDirectory', 'srsenbBinary', 'srsueBinary',
    'enbConfig', 'ueConfig', 'open5gsConfigDirectory', 'open5gsLogDirectory',
    'open5gsTestDirectory', 'handoverBinary', 'handoverConfig', 'sessionDirectory',
  ].map(key => [key, linuxPath])),
  mongodb: { container: identifier, database: identifier },
  handover: {
    database: identifier,
    testCase: literal('epc-s1-test'),
    timeoutSeconds: value => Number.isInteger(value) && value >= 1 && value <= 600,
  },
  capture: { interface: value => identifier(value) && value.length <= 15 },
  expectedVersions: { srsran: version, open5gsPackages: version, open5gsTests: version },
};

export function validateLabConfig(config) {
  const errors = [];
  function walk(value, rule, field) {
    if (typeof rule === 'function') {
      if (!rule(value)) errors.push(`${field}: valor ausente ou inválido.`);
      return;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${field}: esperado um objeto.`);
      return;
    }
    // Do not echo unknown keys or values: they could contain credentials.
    if (Object.keys(value).some(key => !Object.hasOwn(rule, key))) {
      errors.push(`${field}: campo não permitido; use somente os campos do exemplo.`);
    }
    for (const [key, childRule] of Object.entries(rule)) {
      walk(Object.hasOwn(value, key) ? value[key] : undefined, childRule, `${field}.${key}`);
    }
  }
  walk(config, schema, 'config');
  if (errors.length) throw new Error(errors.join('\n'));
  return config;
}

export async function loadLabConfig(filePath) {
  let raw;
  try { raw = await readFile(filePath, 'utf8'); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error('Arquivo ausente. Copie config/lab.example.json para config/lab.local.json no notebook e ajuste os caminhos.');
    throw new Error('Não foi possível ler a configuração. Confira o caminho e a permissão de leitura.');
  }
  let config;
  try { config = JSON.parse(raw); }
  catch { throw new Error('JSON inválido. Confira aspas, vírgulas e chaves; o arquivo não aceita comentários.'); }
  return validateLabConfig(config);
}
