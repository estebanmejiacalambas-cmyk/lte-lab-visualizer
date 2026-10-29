import type { NodeId, Route, SimulationDefinition, SimulationEvent } from '../types/simulation';

export const componentNames: Record<NodeId, string> = {
  ue: 'UE', enb: 'eNodeB A', target: 'eNodeB B', mme: 'MME',
  hss: 'HSS', db: 'MongoDB', sgw: 'SGW', pgw: 'PGW / UPF',
};

// Each record is a route from the teaching script, NOT a decoded network frame.
export interface TeachingMessage {
  id: string;
  sequence: number;
  eventIndex: number;
  event: SimulationEvent;
  route: Route;
}

export function completedMessages(definition: SimulationDefinition, completedIndex: number): TeachingMessage[] {
  const rows: TeachingMessage[] = [];
  definition.events.slice(0, Math.max(0, completedIndex + 1)).forEach((event, eventIndex) => {
    event.routes.forEach((route, routeIndex) => {
      rows.push({ id: `${definition.id}:${event.id}:${routeIndex}`, sequence: rows.length + 1, eventIndex, event, route });
    });
  });
  return rows;
}

export function filterMessages(rows: TeachingMessage[], protocol: string, component: string, query: string) {
  const search = query.trim().toLocaleLowerCase('pt-BR');
  return rows.filter(row =>
    (!protocol || row.event.protocol === protocol)
    && (!component || row.route.from === component || row.route.to === component)
    && (!search || `${row.route.label} ${row.event.title}`.toLocaleLowerCase('pt-BR').includes(search)),
  );
}
