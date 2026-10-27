import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectDiagnostics, inspectPath, resolveLabPath, runProbe } from '../scripts/lib/diagnostics.mjs';

const config = JSON.parse(await readFile(new URL('../config/lab.example.json', import.meta.url), 'utf8'));
function fixture(overrides = {}) {
  return {
    platform: 'linux', arch: 'x64', nodeVersion: '24.21.0', home: '/home/aluno',
    read: async () => 'ID=ubuntu\nVERSION_ID="24.04"\n',
    inspect: async () => ({ ok: true, detail: 'acessível' }),
    probe: async (file, args) => {
      let output = 'versão de teste';
      if (file === 'systemctl') output = 'active';
      if (file === 'dpkg-query') output = 'install ok installed\t2.8.0~noble5';
      if (file === 'docker' && args[0] === 'inspect') output = 'running';
      if (file === 'git' && args[0] === '-C') output = args[1].includes('srsRAN') ? 'release_23_11' : 'v2.8.0';
      return { ok: true, output, reason: '' };
    },
    ...overrides,
  };
}
test('recusa Mac e arquitetura incompatível antes de qualquer consulta', async () => {
  for (const override of [{ platform: 'darwin' }, { arch: 'arm64' }]) {
    let calls = 0;
    await assert.rejects(collectDiagnostics(config, fixture({ ...override, probe: async () => { calls++; }, read: async () => { calls++; } })), /somente no notebook/);
    assert.equal(calls, 0);
  }
});
test('cenário compatível consulta somente comandos previstos e não afirma saúde LTE', async () => {
  const base = fixture();
  const calls = [];
  const report = await collectDiagnostics(config, fixture({ probe: async (file, args) => { calls.push([file, args]); return base.probe(file, args); } }));
  assert.equal(report.pending, 0);
  assert.ok(report.checks.some(row => row.id === 'limites' && row.detail.includes('Não comprova')));
  for (const [file, args] of calls) {
    assert.ok(['npm', 'git', 'docker', 'tshark', 'tcpdump', 'pkg-config', 'systemctl', 'dpkg-query', 'ip'].includes(file));
    if (file === 'systemctl') assert.equal(args[0], 'is-active');
    if (file === 'docker') assert.ok(['--version', 'inspect'].includes(args[0]));
    if (['tshark', 'tcpdump'].includes(file)) assert.deepEqual(args, ['--version']);
    assert.ok(!args.some(arg => ['start', 'stop', 'restart', 'exec', 'capture'].includes(arg)));
  }
});
test('falhas de comandos e arquivos continuam coletando todas as pendências', async () => {
  const report = await collectDiagnostics(config, fixture({
    probe: async () => ({ ok: false, output: '', reason: 'consulta indisponível ou sem permissão' }),
    inspect: async () => ({ ok: false, detail: 'ausente ou sem acesso' }),
    read: async () => { throw new Error('denied'); },
  }));
  assert.ok(report.pending > 20);
  assert.ok(report.checks.some(row => row.id === 'interface-captura'));
});
test('versão diferente e estado inativo não são tratados como sucesso', async () => {
  const base = fixture();
  const report = await collectDiagnostics(config, fixture({ nodeVersion: '22.11.0', probe: async (file, args) => {
    if (file === 'dpkg-query') return { ok: true, output: 'install ok installed\t2.7.0' };
    if (file === 'systemctl') return { ok: false, output: 'inactive' };
    return base.probe(file, args);
  } }));
  assert.equal(report.checks.find(row => row.id === 'node').status, 'PENDENTE');
  assert.equal(report.checks.find(row => row.id === 'pacote:open5gs-mmed').status, 'PENDENTE');
  assert.equal(report.checks.find(row => row.id === 'open5gs-mmed').status, 'PENDENTE');
});
test('caminhos usam home explícito e arquivos auxiliares seguem a configuração do eNB', async () => {
  assert.equal(resolveLabPath('~/lte lab', '/home/aluno'), '/home/aluno/lte lab');
  assert.equal(resolveLabPath('/etc/open5gs', '/home/aluno'), '/etc/open5gs');
  const altered = structuredClone(config);
  altered.paths.enbConfig = '/custom/config/enb.conf';
  const paths = [];
  await collectDiagnostics(altered, fixture({ inspect: async (path) => { paths.push(path); return { ok: true, detail: 'ok' }; } }));
  assert.ok(paths.includes('/custom/config/sib.conf'));
  assert.ok(!paths.some(path => path.includes('visualizer-sessions')));
});
test('checagem de arquivos distingue diretório, arquivo e ausência', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'lte-diagnose-'));
  try {
    const file = join(dir, 'config.conf');
    await writeFile(file, 'fixture');
    assert.equal((await inspectPath(dir, 'directory')).ok, true);
    assert.equal((await inspectPath(file, 'file')).ok, true);
    assert.equal((await inspectPath(file, 'directory')).ok, false);
    assert.equal((await inspectPath(join(dir, 'missing'), 'file')).ok, false);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('executor trata programa ausente sem expor saída ou detalhes internos', async () => {
  const result = await runProbe('/nonexistent/lte-probe-fixture', []);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'comando ausente');
});
