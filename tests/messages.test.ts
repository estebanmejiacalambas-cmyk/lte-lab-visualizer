import { test } from 'node:test';
import assert from 'node:assert/strict';
import { completedMessages, filterMessages } from '../src/simulations/messages';
import { attach } from '../src/simulations/attach';
import { handover } from '../src/simulations/handover';
import { MockSimulationBackend } from '../src/backend/MockSimulationBackend';
import { SimulationController } from '../src/controller/SimulationController';

test('lista contém somente rotas de etapas concluídas, nunca comandos como pacotes', () => {
  assert.deepEqual(completedMessages(attach, -1), []);
  assert.deepEqual(completedMessages(handover, 5), []);
  const first = completedMessages(handover, 6);
  assert.equal(first.length, 1);
  assert.equal(first[0].event.id, 'ho-required');
  assert.equal(first[0].route.from, 'enb');
  assert.equal(first[0].route.to, 'mme');
});
test('etapas com várias rotas conservam direção, identidade estável e contexto do roteiro', () => {
  const index = attach.events.findIndex(event => event.id === 'attach-request');
  const rows = completedMessages(attach, index);
  const request = rows.filter(row => row.event.id === 'attach-request');
  assert.deepEqual(request.map(row => [row.route.from, row.route.to]), [['ue', 'enb'], ['enb', 'mme']]);
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
  assert.deepEqual(completedMessages(attach, index + 1).slice(0, rows.length).map(row => row.id), rows.map(row => row.id));
  assert.equal(request[0].event.protocol, 'NAS via RRC / S1AP');
});
test('filtros combinam contexto, participante em qualquer direção e nome sem alterar dados', () => {
  const rows = completedMessages(handover, 14);
  const matches = filterMessages(rows, 'S1AP', 'target', ' request ');
  assert.deepEqual(matches.map(row => row.event.id), ['ho-request', 'ho-ack']);
  assert.equal(filterMessages(rows, 'RRC', 'target', '').length, 0);
  assert.equal(filterMessages(rows, '', '', 'inexistente').length, 0);
  assert.equal(rows.length, handover.events.reduce((sum, event) => sum + event.routes.length, 0));
});
test('revisão de mensagem preserva estado atual; retorno e reset retiram registros futuros', async () => {
  const controller = new SimulationController(new MockSimulationBackend(0));
  controller.select('handover');
  for (let index = 0; index <= 12; index++) await controller.next();
  const before = controller.getSnapshot().network;
  const request = completedMessages(handover, 12).find(row => row.event.id === 'ho-request')!;
  controller.review(request.eventIndex);
  assert.equal(controller.getSnapshot().reviewIndex, request.eventIndex);
  assert.equal(controller.getSnapshot().network, before);
  controller.previous();
  assert.ok(!completedMessages(handover, controller.getSnapshot().index).some(row => row.event.id === 'ho-notify'));
  controller.reset();
  assert.deepEqual(completedMessages(handover, controller.getSnapshot().index), []);
  controller.dispose();
});
