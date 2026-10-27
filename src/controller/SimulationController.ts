import type { SimulationBackend } from '../backend/SimulationBackend';
import type { NetworkState, SimulationDefinition, SimulationId, TerminalEntry } from '../types/simulation';
import { initialNetwork, applyPatch } from '../simulations/helpers';
export interface Snapshot {
  definition: SimulationDefinition; index: number; reviewIndex: number | null; network: NetworkState;
  terminal: TerminalEntry[]; busy: boolean; running: boolean; speed: number; error: string | null;
}
export class SimulationController {
  private listeners = new Set<() => void>();
  private abort?: AbortController;
  private timer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  private boundary = Infinity;
  private state: Snapshot;
  constructor(private backend: SimulationBackend) {
    this.state = this.fresh('attach', 1);
  }
  private fresh(id: SimulationId, speed: number): Snapshot {
    return {definition:this.backend.getSimulation(id),index:-1,reviewIndex:null,network:initialNetwork(),terminal:[],busy:false,running:false,speed,error:null};
  }
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => this.listeners.delete(fn); };
  private set(patch: Partial<Snapshot>) { this.state = {...this.state,...patch}; this.listeners.forEach(fn=>fn()); }
  private cancel() { this.generation++; this.abort?.abort(); clearTimeout(this.timer); }
  select = (id: SimulationId) => { this.cancel(); this.state = this.fresh(id,this.state.speed); this.listeners.forEach(fn=>fn()); };
  reset = () => this.select(this.state.definition.id);
  clearTerminal = () => this.set({terminal:[]});
  review = (index: number) => { if(index>=0 && index<=this.state.index) { this.pause(); this.set({reviewIndex:index}); } };
  live = () => this.set({reviewIndex:null});
  setSpeed = (speed: number) => { if([.5,1,2].includes(speed)) this.set({speed}); };
  pause = () => { clearTimeout(this.timer); this.set({running:false}); };
  auto = () => {
    if(this.state.index >= this.state.definition.events.length-1) return;
    this.boundary = this.state.definition.events.length-1;
    this.set({running:true,reviewIndex:null});
    if(!this.state.busy) void this.next();
  };
  runGroup = (group: string) => {
    const events=this.state.definition.events, next=events[this.state.index+1];
    if(this.state.busy || this.state.running || !next || next.group!==group) return;
    this.boundary=events.findLastIndex(e=>e.group===group);
    this.set({running:true,reviewIndex:null}); void this.next();
  };
  previous = () => {
    this.cancel();
    const index=Math.max(-1,this.state.index-1), events=this.state.definition.events.slice(0,index+1);
    let network=initialNetwork();const terminal:TerminalEntry[]=[];
    for(const e of events){network=applyPatch(network,e.patch);if(e.command)terminal.push({id:e.id+'-cmd',kind:'command',text:e.command});terminal.push({id:e.id,kind:'output',text:e.output,educationalMock:e.educationalMock});}
    this.set({index,network,terminal,busy:false,running:false,reviewIndex:null,error:null});
  };
  next = async () => {
    const event=this.state.definition.events[this.state.index+1];
    if(this.state.busy || !event) return;
    clearTimeout(this.timer);
    const generation=this.generation, nextIndex=this.state.index+1;
    this.abort=new AbortController();
    const entry:TerminalEntry={id:event.id+'-start',kind:event.command?'command':'info',text:event.command??`[evento simulado] ${event.title}`};
    this.set({busy:true,reviewIndex:null,error:null,terminal:[...this.state.terminal,entry]});
    try {
      const result=await this.backend.execute(event,this.abort.signal);
      if(generation!==this.generation)return;
      const end=nextIndex===this.state.definition.events.length-1 || nextIndex>=this.boundary;
      this.set({index:nextIndex,busy:false,network:applyPatch(this.state.network,event.patch),terminal:[...this.state.terminal,{id:event.id,kind:'output',text:result.output,educationalMock:event.educationalMock}],running:this.state.running&&!end});
      if(this.state.running) this.timer=setTimeout(()=>void this.next(),1300/this.state.speed);
    } catch(error) {
      if(generation!==this.generation)return;
      const message=error instanceof Error?error.message:'Falha no backend';
      this.set({busy:false,running:false,error:message,terminal:[...this.state.terminal,{id:'error-'+nextIndex,kind:'error',text:message}]});
    }
  };
  dispose = () => {this.cancel();this.listeners.clear();};
}
