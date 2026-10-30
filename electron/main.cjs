const { app, BrowserWindow, session } = require('electron');
const path = require('node:path');
if (!app) {
  console.error('Este arquivo precisa do runtime Electron. Execute node main.cjs na raiz do projeto, npm start ou F5 no VS Code.');
  process.exit(1);
}
function createWindow() {
  const win = new BrowserWindow({ width: 1520, height: 960, minWidth: 1120, minHeight: 700,
    title: 'LTE Lab Visualizer', backgroundColor: '#11161d', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']}, (_details, callback) => callback({cancel:true}));
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
