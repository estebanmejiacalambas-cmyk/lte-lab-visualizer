import { fileURLToPath } from 'node:url';
import { loadLabConfig } from './lib/lab-config.mjs';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--example')) {
  console.error('Uso: npm run config:check [-- --example]');
  process.exitCode = 1;
} else {
  const example = args[0] === '--example';
  const path = fileURLToPath(new URL(`../config/lab.${example ? 'example' : 'local'}.json`, import.meta.url));
  try {
    await loadLabConfig(path);
    console.log(`Configuração ${example ? 'de exemplo' : 'local'} válida estruturalmente.`);
    console.log('Nenhum serviço iniciado. Caminhos, versões instaladas e permissões do notebook ainda não foram verificados.');
    console.log('Este perfil prepara a integração futura; o aplicativo continua usando o mock.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
