import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SimulationController } from '../src/controller/SimulationController';
import { MockSimulationBackend } from '../src/backend/MockSimulationBackend';
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
test('Attach completo preserva registro e IP quando rádio fica Idle',async()=>{
 const c=new SimulationController(new MockSimulationBackend(0));
 const events=c.getSnapshot().definition.events;
 for(const e of events){await c.next();const s=c.getSnapshot();if(e.id==='rrc-connected'){assert.equal(s.network.registered,false);assert.equal(s.network.radio,'RRC CONNECTED');}if(e.id==='authentication')assert.equal(s.network.authenticated,true);}
 const n=c.getSnapshot().network;assert.equal(n.completed,true);assert.equal(n.radio,'RRC IDLE');assert.equal(n.registered,true);assert.equal(n.ip,'10.45.0.2');
 c.previous();assert.equal(c.getSnapshot().network.completed,false);c.reset();assert.equal(c.getSnapshot().network.registered,false);assert.equal(c.getSnapshot().terminal.length,0);c.dispose();
});
test('handover transfere UE, conserva IP e libera apenas contexto antigo',async()=>{
 const c=new SimulationController(new MockSimulationBackend(0));c.select('handover');
 while(!c.getSnapshot().network.completed)await c.next();
 const n=c.getSnapshot().network;assert.equal(n.serving,'target');assert.equal(n.links['ue-enb'],'off');assert.equal(n.links['ue-target'],'success');assert.equal(n.registered,true);assert.equal(n.radio,'RRC CONNECTED');assert.equal(n.ip,'10.45.0.2');c.dispose();
});
test('reset cancela resposta pendente e não deixa estado antigo reaparecer',async()=>{
 const c=new SimulationController(new MockSimulationBackend(20));const pending=c.next();c.reset();await pending;await sleep(30);assert.equal(c.getSnapshot().index,-1);assert.equal(c.getSnapshot().terminal.length,0);assert.equal(c.getSnapshot().busy,false);c.dispose();
});
test('trocar simulação durante uma resposta não contamina novo cenário',async()=>{
 const c=new SimulationController(new MockSimulationBackend(20));const pending=c.next();c.select('handover');await pending;assert.equal(c.getSnapshot().definition.id,'handover');assert.equal(c.getSnapshot().index,-1);c.dispose();
});
test('etapas futuras bloqueadas; clique repetido não duplica evento',async()=>{
 const c=new SimulationController(new MockSimulationBackend(10));c.runGroup('ue');assert.equal(c.getSnapshot().index,-1);await Promise.all([c.next(),c.next()]);assert.equal(c.getSnapshot().index,0);assert.equal(c.getSnapshot().terminal.filter(t=>t.kind==='output').length,1);c.dispose();
});
test('pause termina evento em voo e impede o seguinte; resume continua',async()=>{
 const c=new SimulationController(new MockSimulationBackend(5));c.setSpeed(2);c.auto();c.pause();await sleep(25);assert.equal(c.getSnapshot().index,0);assert.equal(c.getSnapshot().running,false);await sleep(700);assert.equal(c.getSnapshot().index,0);c.auto();await sleep(25);assert.equal(c.getSnapshot().index,1);c.reset();await sleep(700);assert.equal(c.getSnapshot().index,-1);c.dispose();
});
test('revisão mantém estado atual; previous reconstrói estado; limpar mantém rede',async()=>{
 const c=new SimulationController(new MockSimulationBackend(0));await c.next();await c.next();const before=c.getSnapshot().network;c.review(0);assert.deepEqual(c.getSnapshot().network,before);c.live();c.clearTerminal();assert.deepEqual(c.getSnapshot().network,before);c.previous();assert.equal(c.getSnapshot().index,0);assert.equal(c.getSnapshot().network.nodes.db.status,'ONLINE');c.dispose();
});
test('mocks conceituais são identificáveis nos dados',()=>{
 const backend=new MockSimulationBackend(0);const auth=backend.getSimulation('attach').events.find(e=>e.id==='authentication')!;assert.equal(auth.educationalMock,true);assert.equal(auth.type,'educational-mock');
 for(const id of ['attach','handover'] as const){const events=backend.getSimulation(id).events;assert.equal(new Set(events.map(e=>e.id)).size,events.length);for(const e of events)assert.equal(e.educationalMock,e.type==='educational-mock');}
});
test('botão de etapa executa seu grupo e para na fronteira seguinte',async()=>{
 const c=new SimulationController(new MockSimulationBackend(0));c.setSpeed(2);
 for(let i=0;i<6;i++)await c.next();
 c.runGroup('ue');
 const deadline=Date.now()+4000;
 while(c.getSnapshot().running&&Date.now()<deadline)await sleep(20);
 assert.equal(c.getSnapshot().index,8);assert.equal(c.getSnapshot().definition.events[c.getSnapshot().index].id,'found-plmn');assert.equal(c.getSnapshot().running,false);c.dispose();
});
