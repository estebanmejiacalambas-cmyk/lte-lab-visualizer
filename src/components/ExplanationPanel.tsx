import { useEffect, useRef } from 'react';
import type { SimulationEvent, NetworkState, SimulationId } from '../types/simulation';

const introductions = {
  paging: {
    title: 'Chamar um UE ocioso e retomar o serviço.',
    explanation: 'O cenário usa srsEPC, srsENB e srsUE com ZeroMQ. Após Attach e RRC Idle, o tráfego downlink provoca Paging. A TUN em ue1 e a rota pelo EPC impedem confundir uma resposta local com tráfego LTE.',
    observe: 'Observe Idle antes do tráfego, S-TMSI match, mt-Access e a retomada RRC seguida de Service Request successful.',
    takeaway: 'Ping sozinho não comprova Paging. Todas as evidências são reproduzidas pelo mock.',
  },
  tau: {
    title: 'Atualizar localização sem confundir com handover.',
    explanation: 'O TAU atualiza o contexto de mobilidade no MME. Esta tela reproduz o idle-test do Open5GS 2.8.0, com PLMN 999/70. Os papéis são emulados pela suíte, sem srsUE ou srsENB.',
    observe: 'Primeiro prepare a captura; depois diferencie a execução da suíte e as mensagens Request/Accept do mesmo caso.',
    takeaway: 'Execução aprovada E evidência NAS correspondente. Todos os resultados desta tela são simulados.',
  },
  attach: {
    title: 'Do acesso rádio ao registro na rede.',
    explanation: 'Um UE não entra na rede em uma única ação. Primeiro, preparamos os serviços do laboratório. Depois, ele encontra uma célula, estabelece sinalização, identifica-se, autentica-se e conclui o registro. A conectividade de dados é apresentada como outro resultado importante desse processo.',
    observe: 'Em cada clique, compare três representações: quem se comunica na topologia, qual evidência aparece no terminal e qual estado muda no painel abaixo.',
    takeaway: 'Mantenha três perguntas em mente: há conexão rádio? O UE está registrado? Ele recebeu um IP?',
  },
  handover: {
    title: 'Mudar de célula mantendo o contexto.',
    explanation: 'Aqui partimos de um UE já conectado. A origem solicita a transferência, o Core coordena a preparação do alvo e o UE recebe a instrução de mudança. Depois da chegada, a rede libera o contexto antigo. A animação reconstrói esses papéis a partir de um cenário de teste.',
    observe: 'Acompanhe quem solicita, quem prepara, quem comanda e quem confirma a chegada. Uma confirmação de preparação ainda não significa que o UE chegou ao alvo.',
    takeaway: 'Compare o antes e o depois: a célula servidora muda; o registro e o IP são mantidos neste cenário.',
  },
};

export function ExplanationPanel({event,reviewing,onLive,network,mode}:{event?:SimulationEvent;reviewing:boolean;onLive:()=>void;network:NetworkState;mode:SimulationId}) {
  const content = useRef<HTMLDivElement>(null);
  const intro = introductions[mode];
  // A revisão de outro evento começa no início do texto, sem herdar sua rolagem.
  useEffect(() => { content.current?.scrollTo({top:0}); }, [event?.id, mode]);
  return <aside className="explanation panel">
    <div className="section-heading"><span>O QUE ESTÁ ACONTECENDO?</span><span className="small-icon">i</span></div>
    {reviewing && <button className="review-banner" onClick={onLive}>Revisando explicação · voltar ao atual ↗</button>}
    <div className="explanation-content" ref={content} tabIndex={0} aria-label="Explicação do evento; role para ler mais">
      <span className="protocol-tag">{event?.protocol ?? 'VISÃO GERAL'}</span>
      <h2>{event?.title ?? intro.title}</h2>
      <p>{event?.explanation ?? intro.explanation}</p>
      <div className="observe-block"><h3>Observe na tela</h3><p>{event?.teaching?.observe ?? intro.observe}</p></div>
      <div className="takeaway">{event?.takeaway ?? intro.takeaway}</div>
      {event?.teaching && <details className="teaching-details" key={mode + event.id}>
        <summary>Aprofundar · contexto e pergunta para a turma</summary>
        <div className="teaching-body">
          <h3>Por que isso importa?</h3><p>{event.teaching.why}</p>
          <h3>Pergunta para a turma</h3><p className="class-question">{event.teaching.question}</p>
          <h3>Resposta comentada</h3><p>{event.teaching.answer}</p>
        </div>
      </details>}
      {!event && <p className="provenance">Cinza: desligado · azul: ativo · verde: sucesso · amarelo: aguardando · vermelho: erro. As cores indicam o estado do componente ou etapa, não uma medição da rede.</p>}
      {event && <p className="provenance">{event.educationalMock ? 'Sequência conceitual para ensino; não extraída de um log real.' : 'Saída fornecida no roteiro e reproduzida como simulação; não é uma medição ao vivo.'}{event.commandSource==='illustrative' && <><br/>Comando equivalente ilustrativo; depende da instalação.</>}</p>}
    </div>
    {mode==='tau'?<dl className="ue-state tau-evidence"><div><dt>Camada A · execução</dt><dd>{network.tauExecution?'APROVADA (mock)':'PENDENTE'}</dd></div><div><dt>Request 0x48 · tipo 0</dt><dd>{network.tauRequest?'PRESENTE (mock)':'PENDENTE'}</dd></div><div><dt>Accept 0x49 · resultado 0</dt><dd>{network.tauAccept?'PRESENTE (mock)':'PENDENTE'}</dd></div></dl>:<dl className="ue-state"><div><dt>Registro no Core</dt><dd className={network.registered?'text-success':''}>{network.registered?'REGISTERED':'NOT REGISTERED'}</dd></div><div><dt>Conexão rádio</dt><dd>{network.radio}</dd></div><div><dt>Endereço IP</dt><dd>{network.ip}</dd></div></dl>}
  </aside>;
}
export function SimulationSummary({mode}:{mode:SimulationId}){
  return <div className="simulation-summary" role="status"><div><span className="summary-check">✓</span><strong>{mode==='attach'?'SIMULATION COMPLETED':mode==='paging'?'PAGING VALIDADO · SIMULADO':mode==='tau'?'TAU VALIDADO · SIMULADO':'HANDOVER SUCCESSFUL'}</strong></div><p>{mode==='attach'?'RRC ✓ · Authentication ✓ · Attach ✓ · PDN ✓ · IP 10.45.0.2':mode==='paging'?'Idle ✓ · TUN ue1 ✓ · rota EPC ✓ · S-TMSI ✓ · mt-Access ✓ · serviço retomado ✓':mode==='tau'?'idle-test ✓ · exit=0 ✓ · Request 0x48 / tipo 0 ✓ · Accept 0x49 / resultado 0 ✓':'eNodeB A → eNodeB B · contexto de origem liberado · IP 10.45.0.2'}</p><small>Resultados simulados · duração da apresentação não representa latência LTE.</small></div>;
}
