import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { paging } from '../src/simulations/paging';
import { MockSimulationBackend } from '../src/backend/MockSimulationBackend';
import { SimulationController } from '../src/controller/SimulationController';
import { NetworkTopology } from '../src/components/NetworkTopology';
import { NodeDetails, SimulationSelector } from '../src/components/SupportingPanels';
import { ExplanationPanel, SimulationSummary } from '../src/components/ExplanationPanel';
import { MessageInspector } from '../src/components/MessageInspector';
import { completedMessages } from '../src/simulations/messages';

test('Paging exige Idle, TUN e rota antes do tráfego; sucesso somente após retomada', async () => {
  const c = new SimulationController(new MockSimulationBackend(0));
  c.select('paging');
  for (const event of paging.events) {
    if (event.id === 'paging-downlink') {
      const n = c.getSnapshot().network;
      assert.equal(n.registered, true);
      assert.equal(n.radio, 'RRC IDLE');
      assert.equal(n.ip, '172.16.0.2');
      assert.ok(n.pagingIdle && n.pagingNamespace && n.pagingRoute);
      assert.equal(n.pagingMatch, undefined);
    }
    if (event.id === 'paging-service') assert.ok(c.getSnapshot().network.pagingMatch);
    if (event.id === 'paging-access') assert.ok(c.getSnapshot().network.pagingServiceRequest);
    if (event.id === 'paging-service-success') assert.equal(c.getSnapshot().network.radio, 'RRC CONNECTED');
    if (event.id === 'paging-complete') assert.ok(c.getSnapshot().network.pagingResumed);
    await c.next();
    assert.equal(c.getSnapshot().network.completed, event.id === 'paging-complete');
  }
  assert.equal(c.getSnapshot().network.ip, '172.16.0.2');
  c.dispose();
});

test('revisão preserva estado; retorno e reset removem evidências futuras de Paging', async () => {
  const c = new SimulationController(new MockSimulationBackend(0));
  c.select('paging');
  for (const event of paging.events) await c.next();
  const network = c.getSnapshot().network;
  c.review(paging.events.findIndex(e => e.id === 'paging-idle'));
  assert.equal(c.getSnapshot().network, network);
  c.previous();
  assert.equal(c.getSnapshot().network.completed, false);
  while (c.getSnapshot().definition.events[c.getSnapshot().index]?.id !== 'paging-downlink') c.previous();
  assert.equal(c.getSnapshot().network.pagingMatch, undefined);
  assert.equal(c.getSnapshot().network.pagingResumed, undefined);
  assert.equal(c.getSnapshot().network.radio, 'RRC IDLE');
  c.reset();
  assert.equal(c.getSnapshot().network.pagingRoute, undefined);
  assert.deepEqual(completedMessages(paging, c.getSnapshot().index), []);
  c.select('tau');
  assert.equal(c.getSnapshot().network.pagingIdle, undefined);
  c.dispose();
});

test('troca de cenário descarta resposta Paging pendente', async () => {
  const c = new SimulationController(new MockSimulationBackend(15));
  c.select('paging');
  const pending = c.next();
  c.select('attach');
  await pending;
  assert.equal(c.getSnapshot().index, -1);
  assert.equal(c.getSnapshot().terminal.length, 0);
  assert.equal(c.getSnapshot().definition.id, 'attach');
  c.dispose();
});

test('Paging renderiza srsEPC e Host sem herdar Core ou IP do Attach', async () => {
  const c = new SimulationController(new MockSimulationBackend(0));
  c.select('paging');
  for (const event of paging.events) await c.next();
  const network = c.getSnapshot().network;
  for (const event of paging.events) {
    const html = renderToStaticMarkup(createElement(NetworkTopology, {network, mode:'paging', selected:null, onSelect:()=>{}, event}));
    assert.match(html, /Host/);
    assert.match(html, /srsEPC/);
    assert.match(html, /ue1/);
    assert.doesNotMatch(html, /OPEN5GS|MongoDB|HSS|PGW|10\.45\.0\.2|NaN/);
  }
  for (const id of ['pgw','mme','enb','ue'] as const) {
    const html = renderToStaticMarkup(createElement(NodeDetails, {network, mode:'paging', id}));
    assert.doesNotMatch(html, /Open5GS|MongoDB|10\.45\.0\.2/);
  }
  const messages = renderToStaticMarkup(createElement(MessageInspector, {mode:'paging', rows:completedMessages(paging,18), reviewIndex:null, busy:false, onSelect:()=>{}, onLive:()=>{}}));
  assert.match(messages, /Host/);
  assert.match(messages, /srsEPC/);
  assert.doesNotMatch(messages, /PGW|eNodeB A/);
  assert.match(renderToStaticMarkup(createElement(ExplanationPanel, {network, mode:'paging', reviewing:false, onLive:()=>{}})), /172.16.0.2/);
  assert.match(renderToStaticMarkup(createElement(SimulationSummary, {mode:'paging'})), /PAGING VALIDADO/);
  assert.match(renderToStaticMarkup(createElement(SimulationSelector, {onSelect:()=>{}})), /Paging/);
  c.dispose();
});

test('roteiro distingue ping local de evidência e preserva procedência didática', () => {
  assert.match(paging.events.find(e=>e.id==='paging-route')!.explanation, /local 172\.16\.0\.2 dev lo/);
  assert.match(paging.events.find(e=>e.id==='paging-evidence')!.explanation, /não invalida automaticamente/);
  assert.match(paging.events.find(e=>e.id==='paging-service-success')!.output, /Service Request successful/);
  for (const event of paging.events) {
    assert.ok(event.teaching?.question && event.teaching.answer);
    if (event.command) assert.ok(event.commandSource);
    if (event.output.includes('Representação didática') || event.id==='paging-complete') assert.equal(event.educationalMock,true);
  }
});
