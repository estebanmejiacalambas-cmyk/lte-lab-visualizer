import type { SimulationEvent, NetworkState, NetworkPatch, NodeState } from '../types/simulation';
export const online = (detail?: string): NodeState => ({ status: 'ONLINE', tone: 'active', detail });
export const success = (status: string, detail?: string): NodeState => ({ status, tone: 'success', detail });
export const waiting = (status: string, detail?: string): NodeState => ({ status, tone: 'waiting', detail });
export const event = (e: Omit<SimulationEvent, 'type' | 'educationalMock' | 'routes' | 'patch' | 'protocol'> & Partial<Pick<SimulationEvent, 'type' | 'educationalMock' | 'routes' | 'patch' | 'protocol'>>): SimulationEvent => ({
  type: 'observed', educationalMock: false, routes: [], patch: {}, protocol: 'LAB', ...e,
});
export function initialNetwork(): NetworkState {
  return { nodes: Object.fromEntries(['ue','enb','target','mme','hss','db','sgw','pgw'].map(id => [id,{status:'OFFLINE',tone:'off'}])) as NetworkState['nodes'],
    links: {}, serving:'none', radio:'OFFLINE', registered:false, authenticated:false, ip:'—', capture:false, completed:false };
}
export function applyPatch(state: NetworkState, patch: NetworkPatch): NetworkState {
  return {...state,...patch,nodes:{...state.nodes,...patch.nodes},links:{...state.links,...patch.links}};
}
