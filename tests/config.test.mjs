import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadLabConfig, validateLabConfig } from '../scripts/lib/lab-config.mjs';

const example = JSON.parse(await readFile(new URL('../config/lab.example.json', import.meta.url), 'utf8'));
test('perfil do manual é validado sem depender dos arquivos do Ubuntu', () => {
  assert.equal(validateLabConfig(structuredClone(example)).capture.interface, 'lo');
});
test('campos ausentes e plataforma incompatível produzem diagnóstico', () => {
  const profile = structuredClone(example);
  delete profile.paths.ueConfig;
  profile.target.platform = 'darwin';
  assert.throws(() => validateLabConfig(profile), /target.platform[\s\S]*paths.ueConfig/);
});
test('não aceita comandos ou credenciais adicionais e não os expõe no erro', () => {
  const profile = structuredClone(example);
  profile.mongodb.password = 'segredo-de-teste';
  profile.command = 'sudo systemctl start qualquer-coisa';
  assert.throws(() => validateLabConfig(profile), error => {
    assert.match(error.message, /campo não permitido/);
    assert.doesNotMatch(error.message, /segredo-de-teste|sudo/);
    return true;
  });
});
test('caminhos são dados absolutos ou relativos ao home, sem expansão de shell', () => {
  for (const path of ['relative/path', '$HOME/lab', '~/../lab', '/tmp/$(id)', '/tmp/a\n']) {
    const profile = structuredClone(example);
    profile.paths.labDirectory = path;
    assert.throws(() => validateLabConfig(profile), /paths.labDirectory/);
  }
  const profile = structuredClone(example);
  profile.paths.labDirectory = '/home/aluno/Laboratório LTE';
  assert.doesNotThrow(() => validateLabConfig(profile));
});
test('rejeita interface, caso de teste e timeout inválidos', () => {
  for (const [group, key, value] of [
    ['capture', 'interface', '-i lo'], ['handover', 'testCase', 'outro-teste'],
    ['handover', 'timeoutSeconds', 0], ['handover', 'timeoutSeconds', 601],
    ['handover', 'timeoutSeconds', '180'],
  ]) {
    const profile = structuredClone(example);
    profile[group][key] = value;
    assert.throws(() => validateLabConfig(profile));
  }
});
test('leitor trata arquivo ausente e JSON inválido sem revelar seu conteúdo', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lte-config-'));
  try {
    const path = join(directory, 'lab.json');
    await assert.rejects(loadLabConfig(path), /Arquivo ausente/);
    await writeFile(path, '{"password": "segredo-de-teste",}');
    await assert.rejects(loadLabConfig(path), error => {
      assert.match(error.message, /JSON inválido/);
      assert.doesNotMatch(error.message, /segredo-de-teste/);
      return true;
    });
    await writeFile(path, JSON.stringify(example));
    assert.deepEqual(await loadLabConfig(path), example);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
