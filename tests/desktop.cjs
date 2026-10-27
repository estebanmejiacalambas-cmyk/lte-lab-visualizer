const { _electron:electron }=require('playwright');
const assert=require('node:assert/strict');
const os=require('node:os');
const path=require('node:path');
(async()=>{
 const app=await electron.launch({args:['.']});
 try {
  const page=await app.firstWindow();await page.waitForLoadState('domcontentloaded');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Start Simulation'}).first().click();
  await page.getByRole('button',{name:'Next Step →',exact:true}).click();
  await page.getByRole('button',{name:'Next Step →',exact:true}).waitFor();
  await page.waitForFunction(()=>document.querySelector('.terminal-body')?.textContent.includes('open5gs_mongo')&&!document.querySelector('.terminal-pending'));
  assert.match(await page.locator('.terminal-body').innerText(),/docker start open5gs_mongo/);
  const security=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences());
  assert.equal(security.contextIsolation,true);assert.equal(security.nodeIntegration,false);assert.equal(security.sandbox,true);
  assert.equal(await page.evaluate(()=>typeof window.require),'undefined');
  await page.screenshot({path:path.join(os.tmpdir(),'lte-desktop-native.png')});assert.deepEqual(errors,[]);
  console.log('PASS desktop: janela Electron, build local, execução mock e isolamento do renderer.');
 } finally { await app.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
