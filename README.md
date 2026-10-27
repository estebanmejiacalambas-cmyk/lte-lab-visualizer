# LTE Lab Visualizer

Protótipo desktop educacional de **Attach** e **S1 Handover**, com topologia, terminal, linha do tempo e explicações sincronizados. Feito para apresentar uma proposta de laboratório visual antes de integrar srsRAN/Open5GS reais.

**Todas as respostas são simuladas. Nenhum comando exibido é executado.** Não há shell remoto/local de laboratório, SSH, acesso a Docker, captura de pacotes ou banco de dados real. Os comandos de instalação abaixo iniciam somente a aplicação e suas ferramentas de desenvolvimento.

## Acompanhar o desenvolvimento

Neste projeto, o Mac atual é usado para desenvolvimento e preparação dos arquivos. A execução do aplicativo e do laboratório será no notebook Ubuntu 24.04 LTS, onde o usuário já instalou o ambiente LTE. As próximas etapas aproveitarão essa instalação existente.

- [Quadro Kanban](docs/KANBAN.md): cartões, pendências e entregas concluídas.
- [Mapa da arquitetura](docs/ARQUITETURA.md): entradas, responsabilidades atuais e separação prevista para a integração.
- [Ambiente do laboratório](docs/AMBIENTE-LABORATORIO.md): dados do notebook Ubuntu e informações ainda necessárias.
- [Configuração local](docs/CONFIGURACAO.md): perfil do notebook e validação estrutural, sem iniciar serviços.
- [Instalação e diagnóstico no Ubuntu](docs/INSTALACAO-UBUNTU.md): preparar Node/npm, verificar o laboratório existente e abrir o mock no notebook.

## Inicialização

**Entrada principal visível: `main.cjs`, na raiz da pasta.** Execute `node main.cjs` ou pressione **F5** no VS Code e selecione **Abrir LTE Lab**. Essa entrada chama `npm start`, que compila a interface e abre o Electron.

Mapa das entradas do projeto:

- `main.cjs`: inicializador para executar pelo Node ou VS Code.
- `electron/main.cjs`: processo principal do Electron; requer o runtime Electron, não o Node comum.
- `src/main.tsx`: inicialização do React.
- `src/App.tsx`: composição da interface.

Se aparecer um erro ao ler `app.whenReady`, o arquivo interno do Electron foi iniciado pelo Node comum. Use a entrada da raiz acima.

Requisito: Node.js **22.12 ou superior** e npm. Nesta máquina, as dependências e o build acompanham o projeto.

Na pasta `lte-lab-visualizer`:

```sh
npm ci
npm start
```

- `npm ci`: instala versões fixadas no `package-lock.json` e baixa o runtime Electron. Precisa de internet na primeira instalação. O `postinstall` cuida do download do Electron.
- `npm start`: verifica TypeScript, compila e abre a janela desktop.
- `npm run desktop`: abre o último build já compilado, sem recompilar.
- No macOS, também é possível abrir **Abrir LTE Lab.command**. Ele usa as dependências instaladas e chama `npm start`.
- Depois da instalação, o aplicativo funciona offline. Ao copiar para outro sistema/arquitetura, reinstale com `npm ci`; não reutilize `node_modules` do Mac.
- Não abra `index.html` diretamente no navegador: este é um projeto React que precisa de Vite/build.

Se o npm da sua máquina bloquear scripts de instalação, permita os scripts dos pacotes revisados `electron`/`esbuild`, ou execute `node node_modules/electron/install.js` e então `npm start`. Em algumas distribuições Linux, o Electron também exige as bibliotecas gráficas do sistema. O projeto não gera um instalador assinado nesta versão.

## Desenvolvimento / versão no navegador

```sh
npm run dev
```

Abra o endereço local informado pelo Vite (padrão `http://127.0.0.1:5178`). Para servir o build, use `npm run build` e `npm run preview` (porta 4178). Esses servidores escutam apenas em loopback. A versão desktop carrega `dist/index.html` diretamente e não precisa manter um servidor ligado.

## Como apresentar

1. Escolha **Attach Procedure**.
2. Use **Next Step** para avançar um evento por clique. Os botões da lateral executam os eventos da etapa atual; etapas futuras permanecem bloqueadas.
3. Pare em **RRC Connected**: a conexão rádio está estabelecida, mas o UE ainda não está registrado no Core.
4. Observe **Attach Request**, **Identity** e **Authentication**. O painel diferencia saídas do roteiro de sequências conceituais.
5. Avance até **IP: 10.45.0.2** e **RRC Idle**. O registro e a sessão PDN permanecem apesar da liberação da conexão rádio.
6. Troque para **S1 Handover**. O novo cenário começa limpo.
7. Acompanhe origem → MME → alvo, a reconfiguração RRC, o deslocamento do UE e a liberação do contexto antigo.
8. Abra **Test Cases** para explicar os cenários negativos intencionais.

### Controles

- **Next Step**: um evento, com resposta simulada após aproximadamente 500 ms.
- **Auto Run / Resume**: avança automaticamente. **Pause** deixa terminar a resposta em andamento e impede a próxima.
- **0.5× / 1× / 2×**: altera o intervalo de leitura entre eventos; não é velocidade física da rede.
- **Previous**: reconstrói topologia e terminal até o evento anterior. Também cancela um evento pendente.
- **Reset Simulation**: cancela respostas e agendamentos, limpa terminal/timeline e restaura os estados iniciais.
- **Timeline / etapas já concluídas**: revisa a explicação e as rotas do evento sem modificar o estado atual da rede. Um aviso identifica a revisão; clique nele para voltar ao evento atual. A revisão pausa a reprodução automática.
- **Presentation Mode**: esconde a lista lateral, amplia topologia/timeline e mantém explicação, terminal e controles.
- **Clique em um nó**: abre sua função e estado atual.
- **Terminal**: limpar afeta apenas a saída visível; expandir/recolher e copiar funcionam. Escape recolhe o terminal expandido e fecha diálogos.
- **Conceitos**: glossário de UE, eNodeB, Core, IMSI, RRC, S1, S1AP, PLMN, TAC, PDN, PCAP e ZeroMQ.

Foco desktop: 1920×1080 e 1366×768. Em telas menores, a página permite rolagem para preservar a legibilidade da topologia. Não foi projetada como interface mobile. Animações respeitam a preferência do sistema por movimento reduzido.

## Tecnologias e arquitetura

Electron + React + TypeScript + Vite, conforme a preferência do briefing. SVG nativo para a topologia: não há dependência de bibliotecas de grafos, fontes externas ou imagens remotas. Electron somente hospeda o build local. Playwright é usado nos testes.

```text
src/
  App.tsx                         Composição da interface e navegação
  components/
    NetworkTopology.tsx           Nós, links, rotas e movimento entre células
    SimulationControls.tsx        Etapas e reprodução/apresentação
    SimulationTimeline.tsx        Progresso e revisão
    TerminalPanel.tsx             Saída, copiar, limpar e expandir
    ExplanationPanel.tsx          Conceitos do evento e resumo
    SupportingPanels.tsx          Seleção inicial, glossário e test cases
  controller/
    SimulationController.ts       Máquina de reprodução e estado observável
  backend/
    SimulationBackend.ts          Contrato do provedor
    MockSimulationBackend.ts      Implementação local, sem execução
  simulations/
    attach.ts                     Eventos e estados do Attach
    handover.ts                   Eventos e estados do Handover
    helpers.ts                    Estado inicial e aplicação de patches
  types/simulation.ts             Tipos de eventos, rede e terminal
  styles/app.css                  Layout e estados visuais
 electron/main.cjs                Janela desktop isolada
 tests/                          Testes de estado, navegador e Electron
```

Fluxo: **UI → SimulationController → SimulationBackend → MockSimulationBackend**.

A UI consome snapshots via `useSyncExternalStore`, sem importar as saídas de simulação. Cada evento contém ID, grupo, título, protocolo, comando opcional, resposta, explicação, rotas e alteração do estado da rede. O backend devolve as definições e resultados. A arquitetura mantém a interface independente dos dados mockados.

O controlador usa `AbortController` e uma geração de execução para descartar respostas obsoletas após reset, troca de simulação ou retorno. Impede execução concorrente e etapas fora de sequência. O estado anterior é reconstruído aplicando os patches de eventos concluídos.

## Origem dos dados e limites conceituais

- `type: "observed"`: texto fornecido no roteiro do solicitante e reproduzido pelo mock. **Não significa captura feita, autenticada ou verificada pelo aplicativo.**
- `type: "educational-mock"` e `educationalMock: true`: representação acrescentada para ensino. Authentication é marcada assim; também a explicitação de PDN, movimento do UE e reconfiguração de rádio no cenário reconstruído.
- `commandSource: "provided"`: comando fornecido no briefing.
- `commandSource: "illustrative"`: comando equivalente usado para contextualização; caminhos, configurações e serviços dependem da instalação. Não é uma receita validada para o ambiente do usuário.
- Eventos de protocolo sem comando mostram `[evento simulado]`; não inventamos um comando de terminal para cada mensagem LTE.
- Os 414 KB e o nome do PCAP são valores mockados. **Nenhum PCAP é criado.**
- O handover representa papéis de uma suíte de testes. A animação não demonstra que `epc-s1-test` move fisicamente um srsUE conectado.
- Captura real deve começar **antes** da execução do teste. Para preservar a sequência de botões solicitada, a etapa posterior de captura representa material de outra execução preparada, explicado na tela.
- `tshark ... -Y s1ap` filtra S1AP. “Filter: Handover” é uma seleção didática, não a sintaxe de um filtro real.
- O estabelecimento de sessão/bearer padrão é integrado ao Attach real; a interface separa esses conceitos para ensino. Não é um diagrama 3GPP exaustivo, nem inclui todas as mensagens de segurança, túnel, caminho de dados ou liberação.
- HSS é distinto do MongoDB. S1-MME é distinto de S1-U. PGW/UPF agrupa visualmente funções de gateway implementadas por serviços Open5GS; não transforma este cenário em 5G SA.
- A UI separa registro, conexão rádio e IP. **RRC Idle não significa desregistro**. A velocidade da demonstração não representa latência LTE.
- Os casos negativos aparecem como exemplos esperados da suíte, não como falha do fluxo de sucesso em curso.

## Adicionar uma simulação

1. Crie uma definição em `src/simulations/`, seguindo `SimulationDefinition`.
2. Dê IDs únicos aos eventos e agrupe-os em etapas. Use `routes` para direção e mensagem, `patch` para estados persistentes e `timeline: true` para marcos revisáveis.
3. Identifique explicitamente a procedência da saída e de qualquer comando.
4. Registre o ID em `SimulationId`, no backend e no seletor. Para novos componentes de rede, acrescente nós/links em `NetworkTopology` e seus tipos.
5. Adicione testes para os estados intermediários e finais.

## Integração real futura — não implementada

Criar um `LinuxSimulationBackend` com operações tipadas e assinaturas de eventos; nunca substituir o mock por uma função genérica de executar strings. O futuro contrato poderá incluir modos/streaming, estado observado, timeouts, erros e reconciliação. O atual discriminador `mode` é propositalmente restrito a `mock`.

Antes de integrar serviços reais:

- Lista permitida de operações, com parâmetros validados.
- Não concatenar comandos com entrada do usuário; não aceitar comandos arbitrários.
- Privilégios mínimos e fronteira de IPC validada, sem acesso direto do renderer ao sistema.
- Processos gerenciados, cancelamento, limpeza e logs estruturados.
- Configuração explícita de interfaces, caminhos e versões do laboratório.
- Captura iniciada antes do teste, armazenamento real de PCAP e parsing de mensagens.
- Validar as sequências com o responsável pelo laboratório e com capturas da versão usada.

Hoje a janela Electron usa `contextIsolation: true`, `nodeIntegration: false` e `sandbox: true`. Não existe preload nem IPC privilegiado. Navegação, novas janelas, permissões e requisições HTTP(S) da versão desktop são bloqueadas. Dependências continuam precisando de atualização e revisão antes de qualquer distribuição de produção.

## Verificação

```sh
npm run build
npm test
npm run test:desktop
```

Testes de UI precisam do servidor local (`npm run dev`) em outro terminal e Chrome instalado:

```sh
npm run test:ui
```

Alternativamente, instale o Chromium do Playwright com `npx playwright install chromium` e use `PLAYWRIGHT_CHANNEL=chromium npm run test:ui`. A URL pode ser alterada com `LTE_LAB_URL`. Os testes usam dados fictícios e escrevem screenshots no diretório temporário. O teste desktop abre e fecha uma janela de verificação.

Cobertura: Attach/Handover completos; RRC vs registro; IP; reset durante resposta; troca de simulação durante resposta; bloqueio de etapas; pause/resume; retorno e revisão; terminal; casos negativos; animação de troca de célula; início em Electron isolado.

## Referências de contexto

- [srsRAN 4G — documentação](https://docs.srsran.com/projects/4g/en/latest/)
- [ZeroMQ Virtual Radios](https://docs.srsran.com/projects/4g/en/next/app_notes/source/zeromq/source/index.html)
- [Handover Application Note](https://docs.srsran.com/projects/4g/en/rfsoc/app_notes/source/handover/source/index.html)
- [Electron — Security](https://www.electronjs.org/docs/latest/tutorial/security)

O roteiro fornecido é a fonte principal dos exemplos de logs. As referências contextualizam a tecnologia; não certificam a execução dos comandos deste protótipo.

## Explicações ampliadas

O painel de cada um dos 35 eventos contém resumo, **Observe na tela** e a ideia principal. **Aprofundar** abre contexto adicional, uma pergunta para a turma e sua resposta comentada. A rolagem do texto volta ao início quando o evento muda; os estados de registro, rádio e IP permanecem separados do texto.

As introduções de Attach e Handover são diferentes. O texto distingue evidência de log, representação didática e conclusão que depende de teste adicional. Os arquivos de eventos mantêm o conteúdo no campo `teaching`, separado da apresentação.

`PERGUNTAS-PARA-VALIDAR-LABORATORIO.txt` contém perguntas prontas para o responsável técnico. Versões, confirmação exata de S1 Setup, motivo do RRC Release, serviço na porta 7777 e abrangência da suíte dependem de evidência do ambiente; não foram presumidos como verificados.

Referências adicionais para revisão dos conceitos:
- [3GPP TS 23.401 / ETSI — arquitetura e procedimentos EPS](https://www.etsi.org/deliver/etsi_TS/123400_123499/123401/18.05.00_60/ts_123401v180500p.pdf)
- [3GPP TS 33.401 / ETSI — segurança EPS](https://www.etsi.org/deliver/etsi_ts/133400_133499/133401/15.11.00_60/ts_133401v151100p.pdf)
- [Open5GS — funções do Core e configuração](https://open5gs.org/open5gs/docs/guide/01-quickstart/)
- [MongoDB — significado do comando ping](https://www.mongodb.com/docs/v7.0/reference/command/ping/)

As referências são de contexto; a versão do laboratório deve ser confirmada antes de atribuir comportamentos específicos a seus logs.
