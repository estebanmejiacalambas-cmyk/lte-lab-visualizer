import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { tau } from '../src/simulations/tau';
import { MockSimulationBackend } from '../src/backend/MockSimulationBackend';
import { SimulationController } from '../src/controller/SimulationController';
import { completedMessages } from '../src/simulations/messages';
import { NetworkTopology } from '../src/components/NetworkTopology';
import { NodeDetails, SimulationSelector } from '../src/components/SupportingPanels';
import { ExplanationPanel, SimulationSummary } from '../src/components/ExplanationPanel';

test('TAU captura antes da execução e completa somente após ambas as camadas', async () => {
  const c = new SimulationController(new MockSimulationBackend(0));
  c.select('tau');
  for (const e of tau.events) {
    await c.next();
    const n = c.getSnapshot().network;
    if (e.id === 'tau-execution') {
      assert.equal(n.capture, true);
      assert.equal(n.tauExecution, undefined);
      assert.equal(n.completed, false);
    }
    if (e.id === 'tau-capture-stop') {
      assert.equal(n.capture, false);
      assert.equal(n.tauExecution, true);
      assert.equal(n.tauRequest, undefined);
      assert.equal(n.tauAccept, undefined);
    }
    if (e.id === 'tau-request') {
      assert.equal(n.tauRequest, true);
      assert.equal(n.tauAccept, undefined);
    }
    if (e.id !== 'tau-validated') assert.equal(n.completed, false);
    if (n.completed) assert.ok(n.tauExecution && n.tauRequest && n.tauAccept);
    assert.equal(n.ip, '—');
    assert.equal(n.serving, 'none');
  }
  assert.equal(c.getSnapshot().network.completed, true);
  c.dispose();
});

test('identidade do cenário e evidências NAS são consistentes', () => {
  const rows = completedMessages(tau, tau.events.length - 1);
  assert.deepEqual(rows.map(r => [r.event.id, r.route.from, r.route.to]), [
    ['tau-request', 'ue', 'mme'], ['tau-accept', 'mme', 'ue'],
  ]);
  assert.match(rows[0].event.output, /0x48[\s\S]*TA updating \(0\)[\s\S]*999[\s\S]*70/);
  assert.match(rows[1].event.output, /0x49[\s\S]*TA updated \(0\)/);
  assert.ok(tau.events.some(e => e.output.includes('157f611')));
  assert.ok(tau.events.some(e => e.command?.includes('build/tests/attach/attach') && e.command.includes('idle-test')));
  assert.equal(new Set(tau.events.map(e => e.id)).size, tau.events.length);
  for (const e of tau.events) {
    assert.ok(e.teaching);
    assert.equal(e.educationalMock, e.type === 'educational-mock');
    assert.ok(tau.groups.some(g => g.id === e.group));
    assert.doesNotMatch(e.command ?? '', /srsue|srsenb/i);
  }
});

test('revisão, Previous, Reset e troca de cenário não deixam evidência TAU antiga', async () => {
  const c = new SimulationController(new MockSimulationBackend(0));
  c.select('tau');
  for (const e of tau.events) await c.next();
  const state = c.getSnapshot().network;
  c.review(tau.events.findIndex(e => e.id === 'tau-request'));
  assert.equal(c.getSnapshot().network, state);
  c.previous();
  assert.equal(c.getSnapshot().network.completed, false);
  while (c.getSnapshot().definition.events[c.getSnapshot().index]?.id !== 'tau-request') c.previous();
  assert.equal(c.getSnapshot().network.tauAccept, undefined);
  c.reset();
  assert.deepEqual(completedMessages(tau, c.getSnapshot().index), []);
  assert.equal(c.getSnapshot().network.tauExecution, undefined);
  c.select('attach');
  assert.equal(c.getSnapshot().definition.id, 'attach');
  assert.equal(c.getSnapshot().network.tauRequest, undefined);
  c.dispose();
});

test('trocar para TAU descarta resposta pendente do Attach', async () => {
  const c = new SimulationController(new MockSimulationBackend(15));
  const pending = c.next();
  c.select('tau');
  await pending;
  assert.equal(c.getSnapshot().index, -1);
  assert.equal(c.getSnapshot().terminal.length, 0);
  assert.equal(c.getSnapshot().definition.id, 'tau');
  c.dispose();
});

test('HTML estático TAU não apresenta srsUE, IMSI ou IP do Attach como seus estados', async () => {
  const c = new SimulationController(new MockSimulationBackend(0));
  c.select('tau');
  for (const e of tau.events) await c.next();
  const network = c.getSnapshot().network;
  const topology = renderToStaticMarkup(createElement(NetworkTopology, { network, mode: 'tau', selected: null, onSelect: () => {}, event: tau.events.find(e => e.id === 'tau-request') }));
  assert.match(topology, /999\/70/);
  assert.doesNotMatch(topology, /srsUE|srsENB|ZeroMQ|00101|10\.45\.0\.2/);
  const detail = renderToStaticMarkup(createElement(NodeDetails, { network, id: 'ue', mode: 'tau' }));
  assert.doesNotMatch(detail, /001010123456780|10\.45\.0\.2/);
  const panel = renderToStaticMarkup(createElement(ExplanationPanel, { network, mode: 'tau', reviewing: false, onLive: () => {} }));
  assert.match(panel, /Camada A/);
  assert.match(panel, /Request 0x48/);
  assert.doesNotMatch(panel, /NOT REGISTERED|Endereço IP/);
  assert.match(renderToStaticMarkup(createElement(SimulationSummary, { mode: 'tau' })), /TAU VALIDADO/);
  assert.match(renderToStaticMarkup(createElement(SimulationSelector, { onSelect: () => {} })), /Tracking Area Update/);
  c.dispose();
});
