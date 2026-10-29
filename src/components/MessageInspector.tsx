import { useEffect, useState } from 'react';
import { componentNames, filterMessages, type TeachingMessage } from '../simulations/messages';
import type { SimulationId } from '../types/simulation';

interface Props {
  rows: TeachingMessage[];
  selected?: TeachingMessage;
  reviewIndex: number | null;
  busy: boolean;
  mode: SimulationId;
  onSelect: (row: TeachingMessage) => void;
  onLive: () => void;
}

export function MessageInspector({ rows, selected, reviewIndex, busy, mode, onSelect, onLive }: Props) {
  const [protocol, setProtocol] = useState('');
  const [component, setComponent] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => { if (!rows.length) { setProtocol(''); setComponent(''); setQuery(''); } }, [rows.length]);
  const protocols = [...new Set(rows.map(row => row.event.protocol))];
  const components = [...new Set(rows.flatMap(row => [row.route.from, row.route.to]))];
  // A rewind can remove every occurrence of a previously chosen filter.
  const activeProtocol = protocols.includes(protocol) ? protocol : '';
  const activeComponent = components.some(id => id === component) ? component : '';
  const filtered = filterMessages(rows, activeProtocol, activeComponent, query);
  const name = (id: keyof typeof componentNames) => mode === 'paging' && id === 'pgw' ? 'Host' : mode === 'paging' && id === 'mme' ? 'srsEPC' : mode === 'paging' && id === 'enb' ? 'eNodeB' : mode === 'tau' && id === 'ue' ? 'UE da suíte' : id === 'enb' && mode === 'attach' ? 'eNodeB' : componentNames[id];
  const clear = () => { setProtocol(''); setComponent(''); setQuery(''); };
  const selectionHidden = selected && !filtered.some(row => row.id === selected.id);
  return <details className="message-inspector panel">
    <summary>Explorar mensagens <span className="mock-chip">SIMULADAS</span><span className="message-count">{rows.length} registros didáticos</span></summary>
    <div className="message-intro">
      <p>Inspecione as comunicações representadas nas etapas concluídas. Selecionar uma linha destaca sua direção na topologia e revisa a explicação, preservando o estado atual da rede.</p>
      <p>Uma linha é uma representação do roteiro, não necessariamente um pacote. Não há captura, bytes, número de frame ou horário medido.</p>
    </div>
    <div className="message-filters">
      <label>Contexto protocolar<select value={activeProtocol} onChange={e => setProtocol(e.target.value)}><option value="">Todos</option>{protocols.map(p => <option key={p}>{p}</option>)}</select></label>
      <label>Participante<select value={activeComponent} onChange={e => setComponent(e.target.value)}><option value="">Todos</option>{components.map(id => <option value={id} key={id}>{name(id)}</option>)}</select></label>
      <label>Mensagem ou etapa<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: HandoverRequest"/></label>
      <button onClick={clear}>Limpar filtros</button>
      <span role="status">{filtered.length} de {rows.length}</span>
    </div>
    <div className="message-layout">
      <div className="message-table-scroll" tabIndex={0} role="region" aria-label="Lista de mensagens simuladas">
        <table className="message-table">
          <caption>Ordem didática · comunicações e estados do roteiro</caption>
          <thead><tr><th scope="col">Ordem</th><th scope="col">Origem</th><th scope="col">Destino</th><th scope="col">Contexto</th><th scope="col">Mensagem / representação</th></tr></thead>
          <tbody>{filtered.map(row => <tr key={row.id} className={selected?.id === row.id ? 'message-selected' : ''}>
            <td>{row.sequence}</td><td>{name(row.route.from)}</td><td>{name(row.route.to)}</td><td>{row.event.protocol}</td>
            <td><button disabled={busy} aria-pressed={selected?.id === row.id} onClick={() => onSelect(row)}>{row.route.label}<small>Etapa {row.eventIndex + 1} · {row.event.title}</small></button></td>
          </tr>)}</tbody>
        </table>
        {!rows.length && <p className="message-empty">Avance até uma etapa com comunicação na topologia para explorar seus registros.</p>}
        {!!rows.length && !filtered.length && <p className="message-empty">Nenhum registro corresponde aos filtros. Isso não comprova ausência de uma mensagem na rede.</p>}
      </div>
      <aside className="message-detail" aria-label="Detalhes da mensagem simulada">
        {selected ? <>
          <span className="mock-chip">REPRESENTAÇÃO SIMULADA</span>
          <h2>{selected.route.label}</h2>
          <p className="message-direction">{name(selected.route.from)} → {name(selected.route.to)}</p>
          {selectionHidden && <p className="message-notice">A seleção atual está fora dos filtros; seus detalhes permanecem visíveis.</p>}
          <p>{selected.event.explanation}</p>
          <details key={selected.id}><summary>Pergunta para discussão</summary><p>{selected.event.teaching?.question ?? selected.event.takeaway}</p><p>{selected.event.teaching?.answer}</p></details>
          <p className="message-notice">Origem: {selected.event.educationalMock ? 'sequência conceitual acrescentada para ensino.' : 'roteiro reproduzido pelo mock; não é uma captura verificada.'} Contexto protocolar descreve a etapa e pode abranger mais de um trecho.</p>
          <button onClick={onLive}>Voltar ao evento atual</button>
        </> : <p>{reviewIndex !== null ? 'Etapa em revisão. Selecione uma linha para inspecionar uma direção específica.' : 'Selecione uma mensagem para relacionar origem, destino e finalidade.'}</p>}
      </aside>
    </div>
  </details>;
}
