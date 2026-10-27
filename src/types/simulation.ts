export type SimulationId = 'attach' | 'handover';
export type NodeId = 'ue' | 'enb' | 'target' | 'mme' | 'hss' | 'db' | 'sgw' | 'pgw';
export type StateColor = 'off' | 'active' | 'success' | 'waiting' | 'error';
export interface NodeState { status: string; tone: StateColor; detail?: string }
export interface Route { from: NodeId; to: NodeId; label: string }
export interface NetworkState {
  nodes: Record<NodeId, NodeState>;
  links: Record<string, StateColor>;
  serving: 'none' | 'source' | 'target';
  radio: string;
  registered: boolean;
  authenticated: boolean;
  ip: string;
  capture: boolean;
  completed: boolean;
}
export interface NetworkPatch extends Partial<Omit<NetworkState, 'nodes' | 'links'>> {
  nodes?: Partial<Record<NodeId, NodeState>>;
  links?: Record<string, StateColor>;
}
export interface SimulationEvent {
  id: string; title: string; group: string;
  type: 'observed' | 'educational-mock';
  educationalMock: boolean;
  command?: string;
  commandSource?: 'provided' | 'illustrative';
  output: string;
  explanation: string;
  teaching?: { observe: string; why: string; question: string; answer: string };
  takeaway: string;
  protocol: string;
  routes: Route[];
  patch: NetworkPatch;
  timeline?: boolean;
}
export interface SimulationDefinition {
  id: SimulationId; name: string; question: string;
  groups: { id: string; title: string }[];
  events: SimulationEvent[];
}
export interface TerminalEntry { id: string; text: string; kind: 'command' | 'output' | 'info' | 'error'; educationalMock?: boolean }
