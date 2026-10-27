import { execFile } from 'node:child_process';
import { access, readFile, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export const LTE_SERVICES = ['mmed', 'hssd', 'sgwcd', 'sgwud', 'smfd', 'upfd', 'pcrfd'].map(name => `open5gs-${name}`);

export function runProbe(file, args) {
  return new Promise(resolve => {
    execFile(file, args, { timeout: 5000, maxBuffer: 65536, shell: false, env: { ...process.env, LC_ALL: 'C' } }, (error, stdout) => {
      resolve({ ok: !error, output: stdout.trim(), reason: error ? (error.code === 'ENOENT' ? 'comando ausente' : error.killed ? 'tempo limite excedido' : 'consulta indisponível ou sem permissão') : '' });
    });
  });
}

export function resolveLabPath(value, home) {
  return value.startsWith('~/') ? join(home, value.slice(2)) : value;
}

export async function inspectPath(path, kind) {
  try {
    const info = await stat(path);
    if (kind === 'directory' ? !info.isDirectory() : !info.isFile()) return { ok: false, detail: 'tipo de arquivo incompatível' };
    await access(path, constants.R_OK | (kind === 'binary' || kind === 'directory' ? constants.X_OK : 0));
    return { ok: true, detail: 'presente e acessível ao usuário atual' };
  } catch { return { ok: false, detail: 'ausente ou sem acesso pelo usuário atual' }; }
}

export async function collectDiagnostics(config, options = {}) {
  const platform = options.platform ?? process.platform;
  const arch = options.arch ?? process.arch;
  // Guard before any Linux probe, including when called outside the CLI.
  if (platform !== 'linux' || arch !== 'x64') throw new Error('Execute o diagnóstico somente no notebook Ubuntu x86_64. Nenhuma consulta ao laboratório foi executada.');
  const probe = options.probe ?? runProbe;
  const inspect = options.inspect ?? inspectPath;
  const read = options.read ?? (path => readFile(path, 'utf8'));
  const home = options.home ?? homedir();
  const version = options.nodeVersion ?? process.versions.node;
  const rows = [];
  const add = (id, ok, detail) => rows.push({ id, status: ok ? 'OK' : 'PENDENTE', detail });
  const [major, minor] = version.split('.').map(Number);
  add('node', major > 22 || (major === 22 && minor >= 12), `Node ${version}; requisito do projeto >=22.12`);
  try {
    const release = await read('/etc/os-release');
    const field = key => release.match(new RegExp(`^${key}=["']?([^"'\\n]+)`, 'm'))?.[1];
    add('sistema', field('ID') === 'ubuntu' && field('VERSION_ID') === '24.04', 'Esperado Ubuntu 24.04 x86_64');
  } catch { add('sistema', false, 'não foi possível ler /etc/os-release'); }

  for (const [file, args] of [
    ['npm', ['--version']], ['git', ['--version']], ['docker', ['--version']],
    ['tshark', ['--version']], ['tcpdump', ['--version']], ['pkg-config', ['--modversion', 'libzmq']],
  ]) {
    const result = await probe(file, args);
    add(file, result.ok, result.ok ? result.output.split('\n')[0].replace(/[\x00-\x1f\x7f]/g, '').slice(0, 180) : result.reason);
  }
  for (const [key, value] of Object.entries(config.paths)) {
    if (key === 'sessionDirectory') continue;
    const kind = key.endsWith('Directory') ? 'directory' : key.endsWith('Binary') ? 'binary' : 'file';
    const result = await inspect(resolveLabPath(value, home), kind);
    add(`arquivo:${key}`, result.ok, result.detail);
  }
  for (const file of ['sib.conf', 'rr.conf', 'rb.conf']) {
    const result = await inspect(join(dirname(resolveLabPath(config.paths.enbConfig, home)), file), 'file');
    add(`auxiliar:${file}`, result.ok, result.detail);
  }
  rows.push({ id: 'sessões', status: 'INFO', detail: 'Diretório reservado; não criado nem testado para escrita nesta consulta.' });
  for (const service of LTE_SERVICES) {
    const state = await probe('systemctl', ['is-active', service]);
    add(service, state.ok && state.output === 'active', state.ok && state.output === 'active' ? 'ativo; saúde funcional ainda não comprovada' : 'inativo ou consulta indisponível; nenhum serviço foi iniciado');
    const pkg = await probe('dpkg-query', ['-W', '-f=${Status}\t${Version}', service.replace(/d$/, '')]);
    add(`pacote:${service}`, pkg.ok && pkg.output === `install ok installed\t${config.expectedVersions.open5gsPackages}`, `Esperado instalado: ${config.expectedVersions.open5gsPackages}; ${pkg.ok ? 'consulta realizada' : pkg.reason}`);
  }
  for (const [id, directory, expected] of [
    ['srsran', config.paths.srsranDirectory, `release_${config.expectedVersions.srsran.replaceAll('.', '_')}`],
    ['open5gs-tests', config.paths.open5gsTestDirectory, `v${config.expectedVersions.open5gsTests}`],
  ]) {
    const result = await probe('git', ['-C', resolveLabPath(directory, home), 'describe', '--tags', '--exact-match', 'HEAD']);
    add(`revisão:${id}`, result.ok && result.output === expected, `Tag esperada: ${expected}; revisão diferente requer conferência, sem checkout automático`);
  }
  const docker = await probe('docker', ['inspect', '--type', 'container', '--format', '{{.State.Status}}', config.mongodb.container]);
  add('mongodb-container', docker.ok && docker.output === 'running', docker.ok && docker.output === 'running' ? 'container em execução; resposta do banco será verificada na integração' : 'container parado, ausente ou Docker sem acesso');
  const network = await probe('ip', ['link', 'show', 'dev', config.capture.interface]);
  add('interface-captura', network.ok, network.ok ? 'interface presente; captura não iniciada' : network.reason);
  rows.push({ id: 'privilégios', status: 'INFO', detail: 'Não foi usado sudo. Autorização para controlar serviços/capturar tráfego e escrita de sessões ainda precisam de validação específica.' });
  rows.push({ id: 'limites', status: 'INFO', detail: 'Não lê chaves, conteúdo de configurações, logs LTE ou pacotes. Não comprova Attach/Handover nem acesso gráfico do Electron.' });
  return { schemaVersion: 1, target: 'ubuntu-24.04-x64', pending: rows.filter(row => row.status === 'PENDENTE').length, checks: rows };
}
