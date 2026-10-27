import { fileURLToPath } from 'node:url';
import { loadLabConfig } from './lib/lab-config.mjs';
import { collectDiagnostics } from './lib/diagnostics.mjs';

try {
  if (process.platform !== 'linux' || process.arch !== 'x64') throw new Error('Execute este diagnóstico no notebook Ubuntu x86_64. Nenhum aplicativo ou serviço será iniciado.');
  if (process.getuid?.() === 0) throw new Error('Execute como usuário normal, sem sudo, para verificar as permissões reais desse usuário.');
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--json')) throw new Error('Uso: npm run diagnose [-- --json]');
  const config = await loadLabConfig(fileURLToPath(new URL('../config/lab.local.json', import.meta.url)));
  const report = await collectDiagnostics(config);
  if (args[0] === '--json') console.log(JSON.stringify(report, null, 2));
  else {
    console.log('LTE Lab — diagnóstico de leitura (sem inicialização de serviços)');
    for (const row of report.checks) console.log(`[${row.status}] ${row.id}: ${row.detail}`);
    console.log(`Pendências: ${report.pending}. Este relatório não certifica execução LTE ou abertura do aplicativo.`);
  }
  process.exitCode = report.pending ? 2 : 0;
} catch (error) { console.error(error.message); process.exitCode = 1; }
