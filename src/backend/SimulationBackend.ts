import type { SimulationDefinition, SimulationEvent, SimulationId } from '../types/simulation';
export interface SimulationBackend {
  readonly mode: 'mock';
  getSimulation(id: SimulationId): SimulationDefinition;
  execute(event: SimulationEvent, signal: AbortSignal): Promise<{output: string}>;
}
