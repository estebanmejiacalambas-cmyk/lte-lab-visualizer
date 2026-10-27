import type { NetworkState, NodeId, NodeState, Route, SimulationEvent, SimulationId, StateColor } from '../types/simulation';
type Position = {x:number;y:number};
const labels: Record<NodeId,[string,string]> = {ue:['UE','srsUE'],enb:['eNodeB A','srsENB · SOURCE'],target:['eNodeB B','TARGET'],mme:['MME','Controle / mobilidade'],hss:['HSS','Autenticação'],db:['MongoDB','Banco de assinantes'],sgw:['SGW','Serving gateway'],pgw:['PGW / UPF','Conectividade PDN']};
const basePositions:Record<NodeId,Position>={ue:{x:100,y:185},enb:{x:310,y:185},target:{x:310,y:280},mme:{x:550,y:110},hss:{x:790,y:110},db:{x:910,y:250},sgw:{x:550,y:280},pgw:{x:760,y:280}};
const links:{from:NodeId;to:NodeId;label:string}[]=[{from:'ue',to:'enb',label:'Rádio / ZMQ'},{from:'enb',to:'mme',label:'S1-MME'},{from:'mme',to:'hss',label:'S6a'},{from:'hss',to:'db',label:'DB'},{from:'mme',to:'sgw',label:'S11'},{from:'enb',to:'sgw',label:'S1-U'},{from:'sgw',to:'pgw',label:'S5/S8'}];
function lineGeometry(a:Position,b:Position){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),offset=Math.min(82,d*.3);return {x1:a.x+dx/d*offset,y1:a.y+dy/d*offset,x2:b.x-dx/d*offset,y2:b.y-dy/d*offset};}
export function NetworkLink({a,b,tone,label,hidden=false}:{a:Position;b:Position;tone:StateColor;label:string;hidden?:boolean}){
  const p=lineGeometry(a,b);
  return <g className={`network-link ${tone} ${hidden?'removed':''}`}><line {...p}/><text x={(a.x+b.x)/2} y={(a.y+b.y)/2-9}>{label}</text></g>;
}
function NodeIcon({id}:{id:NodeId}){
  if(id==='ue')return <g><rect x="-8" y="-13" width="16" height="26" rx="3"/><path d="M-3 9h6"/></g>;
  if(id==='enb'||id==='target')return <g><path d="M0-7v20m-7 0L0-5l7 18M-10-8q-8 7 0 14m20-14q8 7 0 14M-5-4q-4 3 0 6m10-6q4 3 0 6"/><circle cy="-9" r="2"/></g>;
  if(id==='db')return <g><ellipse cy="-9" rx="12" ry="5"/><path d="M-12-9V9c0 7 24 7 24 0V-9M-12 0c0 7 24 7 24 0"/></g>;
  return <g><rect x="-13" y="-11" width="26" height="22" rx="3"/><path d="M-8-4h16M-8 3h10"/><circle cx="8" cy="6" r="1"/></g>;
}
export function NetworkNode({id,position,state,selected,onSelect,mode}:{id:NodeId;position:Position;state:NodeState;selected:boolean;onSelect:(id:NodeId)=>void;mode:SimulationId}){
  const title=id==='enb'&&mode==='attach'?'eNodeB':labels[id][0];
  return <g role="button" tabIndex={0} aria-label={`${title}: ${state.status}`} onClick={()=>onSelect(id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(id);}}} className={`network-node ${state.tone} ${selected?'selected':''}`} style={{transform:`translate(${position.x}px,${position.y}px)`}}>
    <rect x="-72" y="-48" width="144" height="96" rx="6"/><g className="node-icon" transform="translate(-47,-15)"><NodeIcon id={id}/></g>
    <text className="node-name" x="-22" y="-17">{title}</text><text className="node-role" x="-22" y="0">{id==='enb'&&mode==='attach'?'srsENB':labels[id][1]}</text>
    <circle className="node-dot" cx="-57" cy="27" r="3"/><text className="node-status" x="-47" y="31">{state.status}</text>
  </g>;
}
export function NetworkTopology({network,mode,event,onSelect,selected}:{network:NetworkState;mode:SimulationId;event?:SimulationEvent;onSelect:(id:NodeId)=>void;selected:NodeId|null}) {
  const positions={...basePositions};
  if(mode==='handover'){positions.enb={x:310,y:110};positions.ue={x:100,y:network.serving==='target'?280:110};}
  const edges=mode==='handover'?[...links.filter(l=>!(l.from==='enb'&&l.to==='sgw')),{from:'ue' as const,to:'target' as const,label:'Rádio / alvo'},{from:'target' as const,to:'mme' as const,label:'S1-MME'}]:links;
  const routes=event?.routes??[];
  const activeNodes=new Set(routes.flatMap(r=>[r.from,r.to]));
  return <div className="topology-canvas">
    <svg viewBox="0 0 1010 360" role="group" aria-label="Topologia LTE interativa">
      <defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#28313d"/></pattern><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#72b5f7"/></marker></defs>
      <rect width="1010" height="360" fill="url(#grid)"/>
      <rect className="core-envelope" x="445" y="30" width="550" height="320" rx="8"/>
      <text className="zone-label" x="32" y="26">USER EQUIPMENT</text><text className="zone-label" x="237" y="26">RADIO ACCESS NETWORK</text><text className="zone-label" x="468" y="49">EPC · OPEN5GS</text>
      {edges.map(l=><NetworkLink key={l.from+'-'+l.to} a={positions[l.from]} b={positions[l.to]} label={l.label} tone={network.links[l.from+'-'+l.to]??'off'} hidden={mode==='handover'&&l.from==='ue'&&l.to==='enb'&&network.links['ue-enb']==='off'}/>)}
      {routes.map((r:Route,i)=>{const p=lineGeometry(positions[r.from],positions[r.to]);return <g key={event?.id+'-'+i} className="message-route" style={{animationDelay:`${i*.2}s`}}><line {...p} markerEnd="url(#arrow)"/><circle r="3"><animate attributeName="cx" values={`${p.x1};${p.x2}`} dur="1.6s" repeatCount="indefinite"/><animate attributeName="cy" values={`${p.y1};${p.y2}`} dur="1.6s" repeatCount="indefinite"/></circle></g>;})}
      {(Object.keys(positions) as NodeId[]).filter(id=>mode==='handover'||id!=='target').map(id=><NetworkNode key={id} id={id} position={positions[id]} state={network.nodes[id]} mode={mode} selected={activeNodes.has(id)||selected===id} onSelect={onSelect}/>)}
    </svg>
    <div className="route-strip" aria-live="polite"><span className="route-label">MENSAGEM</span>{routes.length?<><b>{event?.title}</b><span className="route-path">{routes.map(r=>`${labels[r.from][0]} → ${labels[r.to][0]} · ${r.label}`).join('  /  ')}</span></>:<span>{network.completed?'Procedimento concluído. Selecione um evento para revisar.':'Avance uma etapa para acompanhar a sinalização.'}</span>}</div>
  </div>;
}
