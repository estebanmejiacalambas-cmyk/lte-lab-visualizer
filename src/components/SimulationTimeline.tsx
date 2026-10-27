import type { Snapshot, SimulationController } from '../controller/SimulationController';
export function SimulationTimeline({state,controller}:{state:Snapshot;controller:SimulationController}){
  return <section className="timeline panel"><div className="section-heading"><span>LINHA DO TEMPO</span><small>{state.index+1} / {state.definition.events.length} eventos</small></div><div className="timeline-track">{state.definition.events.map((e,i)=>e.timeline&&<button key={e.id} disabled={i>state.index} className={`${i<=state.index?'reached':''} ${(state.reviewIndex??state.index)===i?'current':''}`} onClick={()=>controller.review(i)}><span>{i<=state.index?'✓':'○'}</span>{e.title}</button>)}</div></section>;
}
