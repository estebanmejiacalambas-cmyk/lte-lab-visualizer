import type { SimulationBackend } from './SimulationBackend';
import type { SimulationEvent, SimulationId } from '../types/simulation';
import { attach } from '../simulations/attach';
import { handover } from '../simulations/handover';
import { tau } from '../simulations/tau';
import { paging } from '../simulations/paging';
export class MockSimulationBackend implements SimulationBackend {
  readonly mode = 'mock' as const;
  constructor(private delayMs = 500) {}
  getSimulation(id: SimulationId) { return { attach, handover, tau, paging }[id]; }
  execute(event: SimulationEvent, signal: AbortSignal): Promise<{output: string}> {
    return new Promise((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(new DOMException('Operação cancelada', 'AbortError')); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve({output: event.output}); }, this.delayMs);
      if (signal.aborted) abort(); else signal.addEventListener('abort', abort, {once:true});
    });
  }
}
