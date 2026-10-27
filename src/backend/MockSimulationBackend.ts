import type { SimulationBackend } from './SimulationBackend';
import type { SimulationEvent, SimulationId } from '../types/simulation';
import { attach } from '../simulations/attach';
import { handover } from '../simulations/handover';
export class MockSimulationBackend implements SimulationBackend {
  readonly mode = 'mock' as const;
  constructor(private delayMs = 500) {}
  getSimulation(id: SimulationId) { return id === 'attach' ? attach : handover; }
  // Commands are display-only strings. No process or network API is used here.
  execute(event: SimulationEvent, signal: AbortSignal): Promise<{output: string}> {
    return new Promise((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(new DOMException('Operação cancelada', 'AbortError')); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve({output: event.output}); }, this.delayMs);
      if (signal.aborted) abort(); else signal.addEventListener('abort', abort, {once:true});
    });
  }
}
