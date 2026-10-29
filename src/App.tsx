import { useEffect, useState, useSyncExternalStore } from 'react';
import { MockSimulationBackend } from './backend/MockSimulationBackend';
import { SimulationController } from './controller/SimulationController';
import { NetworkTopology } from './components/NetworkTopology';
import { SimulationControls, PlaybackControls } from './components/SimulationControls';
import { SimulationTimeline } from './components/SimulationTimeline';
import { TerminalPanel } from './components/TerminalPanel';
import { MessageInspector } from './components/MessageInspector';
import { completedMessages } from './simulations/messages';
import { ExplanationPanel, SimulationSummary } from './components/ExplanationPanel';
import { Modal, ConceptsPanel, TestCases, NodeDetails, SimulationSelector } from './components/SupportingPanels';
import type { NodeId, SimulationId } from './types/simulation';
const controller = new SimulationController(new MockSimulationBackend());
export default function App(){
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot);
 const [started,setStarted]=useState(false),[presentation,setPresentation]=useState(false),[modal,setModal]=useState<'concepts'|'tests'|'node'|null>(null),[selectedNode,setSelectedNode]=useState<NodeId|null>(null);
 const [selectedMessageId,setSelectedMessageId]=useState<string|null>(null);
 const messages=completedMessages(state.definition,state.index);
 const selectedMessage=messages.find(row=>row.id===selectedMessageId && row.eventIndex===state.reviewIndex);
 const currentEvent=state.definition.events[state.reviewIndex??state.index];
 const event=selectedMessage?{...currentEvent,routes:[selectedMessage.route]}:currentEvent;
 useEffect(()=>{setSelectedMessageId(null);},[state.definition,state.index]);
 useEffect(()=>{if(state.reviewIndex===null)setSelectedMessageId(null);},[state.reviewIndex]);
 function select(id:SimulationId){controller.select(id);setStarted(true);setModal(null);setSelectedNode(null);}
 return <div className={`application ${presentation?'presentation':''}`}>
  <header className="app-header"><button className="app-brand" onClick={()=>{controller.pause();setStarted(false);setPresentation(false);}} title="Voltar à seleção de simulação"><span className="brand-icon">▥</span><span>LTE Lab Visualizer<small>srsRAN / Open5GS Educational Simulator</small></span></button><div className="header-right"><span className="environment-badge"><span className="status-dot waiting"/> MOCK ENVIRONMENT</span><button onClick={()=>setModal('concepts')}>⊞ Conceitos</button><span className="version">v1.0</span></div></header>
  {!started?<SimulationSelector onSelect={select}/>:<>
   <div className="simulation-heading"><div className="simulation-tabs" aria-label="Simulação selecionada"><button className={state.definition.id==='attach'?'active':''} onClick={()=>select('attach')}>01 <b>Attach Procedure</b></button><button className={state.definition.id==='handover'?'active':''} onClick={()=>select('handover')}>02 <b>S1 Handover</b></button><button className={state.definition.id==='tau'?'active':''} onClick={()=>select('tau')}>03 <b>Tracking Area Update</b></button><button className={state.definition.id==='paging'?'active':''} onClick={()=>select('paging')}>04 <b>Paging</b></button></div><p>{state.definition.question}</p></div>
   <PlaybackControls state={state} controller={controller} presentation={presentation} onPresentation={()=>setPresentation(!presentation)}/>
   <div className="lab-grid">
    <SimulationControls state={state} controller={controller}/>
    <section className="topology panel"><div className="section-heading"><div><span>TOPOLOGIA DA REDE</span><small className="panel-subtitle">{state.definition.id==='attach'?'Acesso → registro → conectividade':state.definition.id==='tau'?'OPEN5GS idle-test · NAS · PLMN 999/70':state.definition.id==='paging'?'srsEPC · Idle → Paging → serviço':'SOURCE → TARGET · MME COORDINATOR'}</small></div><div className="legend"><span><i className="off"/>Offline</span><span><i className="active"/>Ativo</span><span><i className="success"/>Sucesso</span><span><i className="waiting"/>Aguardando</span><span><i className="error"/>Erro</span></div></div><NetworkTopology network={state.network} mode={state.definition.id} event={event} selected={selectedNode} onSelect={id=>{setSelectedNode(id);setModal('node');}}/><div className="topology-footer"><span>{state.network.capture?<b className="text-warning">● CAPTURE ACTIVE · tcpdump (mock)</b>:state.definition.id==='attach'?'PLMN 00101 · TAC 7 · ZeroMQ':state.definition.id==='tau'?'Suíte Open5GS 2.8.0 · captura lo (mock)':state.definition.id==='paging'?'srsRAN 4G 23.11 · ZeroMQ · TUN em ue1':'Reconstituição didática de teste S1 · sem rede real'}</span>{state.definition.id==='handover'?<button onClick={()=>setModal('tests')}>Test Cases ↗</button>:<span>{state.definition.id==='tau'?'PLMN 999/70 · NAS lógico':'IMSI 001010123456780'}</span>}</div></section>
    <ExplanationPanel mode={state.definition.id} event={event} reviewing={state.reviewIndex!==null} onLive={controller.live} network={state.network}/>
    <SimulationTimeline state={state} controller={controller}/>
    <TerminalPanel entries={state.terminal} busy={state.busy} onClear={controller.clearTerminal}/>
   </div>
   <MessageInspector key={state.definition.id} mode={state.definition.id} rows={messages} selected={selectedMessage} reviewIndex={state.reviewIndex} busy={state.busy} onSelect={row=>{setSelectedMessageId(row.id);controller.review(row.eventIndex);}} onLive={()=>{setSelectedMessageId(null);controller.live();}}/>
   {state.error&&<div className="error-banner" role="alert">{state.error} · tente novamente ou reinicie a simulação.</div>}
   {state.network.completed&&<SimulationSummary mode={state.definition.id}/>}
   <div className="app-status"><span><span className={`status-dot ${state.busy?'waiting':state.running?'active':'success'}`}/>{state.busy?'Resposta simulada pendente':state.running?'Demonstração automática':'Pronto · modo passo a passo'}{state.reviewIndex!==null?' · revisão da explicação; estado atual preservado':''}</span><span>Backend: MockSimulationBackend · tempo de demonstração ≠ tempo LTE</span></div>
  </>}
  {modal==='concepts'&&<Modal title="Conceitos do laboratório" onClose={()=>setModal(null)}><ConceptsPanel/></Modal>}
  {modal==='tests'&&<Modal title="Test Cases · S1 Handover" onClose={()=>setModal(null)}><TestCases available={state.index>=2}/></Modal>}
  {modal==='node'&&selectedNode&&<Modal title={`Componente · ${state.definition.id==='paging'&&selectedNode==='pgw'?'Host':state.definition.id==='paging'&&selectedNode==='mme'?'srsEPC':selectedNode==='target'?'eNodeB B':selectedNode.toUpperCase()}`} onClose={()=>setModal(null)}><NodeDetails id={selectedNode} network={state.network} mode={state.definition.id}/></Modal>}
 </div>;
}
