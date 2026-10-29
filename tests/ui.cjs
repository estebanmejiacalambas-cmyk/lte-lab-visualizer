const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const os=require('node:os');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:768},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.LTE_LAB_URL||'http://127.0.0.1:5178/');
 await page.getByRole('button',{name:'Start Simulation'}).first().click();
 await page.screenshot({path:path.join(os.tmpdir(),'lte-1366-initial.png')});
 assert.ok(await page.getByRole('button',{name:/07 Iniciar UE/}).isDisabled());
 const next=()=>page.getByRole('button',{name:'Next Step →',exact:true});
 for(let i=0;i<20;i++){
  await next().click();await page.waitForFunction(()=>!document.querySelector('.playback .primary').disabled||!!document.querySelector('.simulation-summary'));
  if(i===11){assert.match(await page.locator('.ue-state').innerText(),/NOT REGISTERED/);await page.screenshot({path:path.join(os.tmpdir(),'lte-rrc.png')});}
 }
 assert.match(await page.locator('.simulation-summary').innerText(),/SIMULATION COMPLETED/);
 assert.match(await page.locator('.ue-state').innerText(),/RRC IDLE/);
 assert.match(await page.locator('.terminal-body').innerText(),/Network attach successful/);
 await page.locator('.timeline-track').getByRole('button',{name:'RRC Connected'}).click();
 assert.match(await page.locator('.explanation').innerText(),/ainda não significa/);
 assert.match(await page.locator('.ue-state').innerText(),/RRC IDLE/);
 await page.getByRole('button',{name:'Copiar',exact:true}).click();
 assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Attach complete/);
 await page.getByRole('button',{name:'Expandir',exact:true}).click();assert.ok(await page.locator('.terminal.expanded').isVisible());await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Limpar',exact:true}).click();assert.ok(!(await page.locator('.terminal-body').innerText()).includes('Attach complete'));
 await page.getByRole('button',{name:/Conceitos/}).click();await page.getByRole('button',{name:'Fechar painel'}).click();
 await page.getByRole('button',{name:'Reset Simulation',exact:false}).click();
 assert.match(await page.locator('.ue-state').innerText(),/NOT REGISTERED/);
 await page.getByRole('button',{name:/02 S1 Handover/}).click();
 await page.getByRole('button',{name:'Presentation Mode',exact:false}).click();
 await page.getByLabel('Velocidade da demonstração').selectOption('2');
 await page.getByRole('button',{name:/Auto Run/}).click();await page.waitForTimeout(200);
 await page.getByRole('button',{name:/Pause/}).click();await page.waitForTimeout(600);
 const paused=await page.locator('.timeline .section-heading').innerText();await page.waitForTimeout(900);assert.equal(await page.locator('.timeline .section-heading').innerText(),paused);
 await page.getByRole('button',{name:/Resume/}).click();
 await page.waitForFunction(()=>document.querySelector('.explanation h2')?.textContent==='UE moves to target',{},{timeout:25000});
 await page.waitForTimeout(150);await page.getByRole('button',{name:/Pause/}).click();await page.waitForTimeout(600);
 await page.screenshot({path:path.join(os.tmpdir(),'lte-handover.png')});
 assert.ok((await page.locator('.network-node').first().getAttribute('style')).includes('280'));
 await page.getByRole('button',{name:/Resume/}).click();await page.locator('.simulation-summary').waitFor({timeout:12000});
 // Message inspection is historical: highlighting a route must not rewind the UE.
 const inspector=page.locator('.message-inspector');
 await inspector.locator(':scope > summary').click();
 await inspector.getByLabel('Contexto protocolar').selectOption('S1AP');
 await inspector.getByLabel('Participante').selectOption('target');
 await inspector.getByLabel('Mensagem ou etapa').fill('HandoverRequest');
 assert.equal(await inspector.locator('tbody tr').count(),1);
 await inspector.getByRole('button',{name:/HandoverRequest/}).click();
 assert.match(await page.locator('.route-strip').innerText(),/MME → eNodeB B/);
 assert.equal(await page.locator('.message-route').count(),1);
 assert.match(await page.locator('.ue-state').innerText(),/10.45.0.2/);
 assert.ok((await page.locator('.network-node').first().getAttribute('style')).includes('280'));
 await inspector.getByLabel('Mensagem ou etapa').fill('nenhum-registro');
 assert.equal(await inspector.locator('tbody tr').count(),0);
 assert.match(await inspector.locator('.message-detail').innerText(),/fora dos filtros/);
 await inspector.getByRole('button',{name:'Voltar ao evento atual',exact:true}).click();
 await inspector.getByRole('button',{name:'Limpar filtros',exact:true}).click();
 await page.getByRole('button',{name:/Test Cases/}).click();assert.match(await page.locator('dialog').innerText(),/All tests passed/);await page.keyboard.press('Escape');
 await page.getByRole('button',{name:/Reset Simulation/}).click();await next().click();await page.getByRole('button',{name:/Reset Simulation/}).click();await page.waitForTimeout(650);assert.match(await page.locator('.timeline .section-heading').innerText(),/0 \/ 15/);
 assert.equal(await inspector.locator('tbody tr').count(),0);
 await page.getByRole('button',{name:/Exit Presentation/}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.getByRole('button',{name:/01 Attach Procedure/}).click();
 await page.getByRole('button',{name:/Auto Run/}).click();await page.locator('.simulation-summary').waitFor({timeout:35000});
 assert.match(await page.locator('.ue-state').innerText(),/10.45.0.2/);
 await page.getByRole('button',{name:/03 Tracking Area Update/}).click();
 assert.match(await page.locator('.topology-footer').innerText(),/999\/70/);
 assert.equal(await page.locator('.network-node').count(),3);
 for(let i=0;i<13;i++) {
  await next().click();
  await page.waitForFunction(()=>!document.querySelector('.playback .primary').disabled||!!document.querySelector('.simulation-summary'));
  if(i===7) {
   assert.match(await page.locator('.tau-evidence').innerText(),/APROVADA/);
   assert.equal(await page.locator('.simulation-summary').count(),0);
  }
 }
 assert.match(await page.locator('.simulation-summary').innerText(),/TAU VALIDADO/);
 assert.doesNotMatch(await page.locator('.tau-evidence').innerText(),/PENDENTE/);
 await page.locator('.timeline-track').getByRole('button',{name:/TAU Request/}).click();
 assert.match(await page.locator('.route-strip').innerText(),/UE → MME/);
 await page.getByRole('button',{name:/Reset Simulation/}).click();
 assert.equal(await page.locator('.simulation-summary').count(),0);
 assert.match(await page.locator('.tau-evidence').innerText(),/PENDENTE/);
 await page.getByRole('button',{name:/04 Paging/}).click();
 assert.equal(await page.locator('.network-node').count(),4);
 assert.match(await page.locator('.topology').innerText(),/srsEPC/);
 for(let i=0;i<19;i++) {
  await next().click();
  await page.waitForFunction(()=>!document.querySelector('.playback .primary').disabled||!!document.querySelector('.simulation-summary'));
  if(i===9) {
   assert.match(await page.locator('.ue-state').innerText(),/RRC IDLE/);
   assert.match(await page.locator('.ue-state').innerText(),/172.16.0.2/);
   assert.equal(await page.locator('.simulation-summary').count(),0);
  }
 }
 assert.match(await page.locator('.simulation-summary').innerText(),/PAGING VALIDADO/);
 await page.getByRole('button',{name:/Reset Simulation/}).click();
 assert.equal(await page.locator('.simulation-summary').count(),0);
 assert.match(await page.locator('.ue-state').innerText(),/NOT REGISTERED/);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS UI: Attach, Handover, mensagens, TAU, Paging, revisão e reset.');
})().catch(e=>{console.error(e);process.exit(1)});
