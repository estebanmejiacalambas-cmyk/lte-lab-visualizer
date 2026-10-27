// Entrada visível do projeto: execute `node main.cjs` ou use F5 no VS Code.
// O npm start compila a interface e inicia o runtime Electron.
const { spawn } = require('node:child_process');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['start'], {
  cwd: __dirname,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
child.on('error', error => {
  console.error(`Não foi possível iniciar o LTE Lab: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', code => { process.exitCode = code ?? 1; });
