# Mapa do projeto

## Destino da execução

O usuário definiu o notebook Ubuntu 24.04 LTS como destino do aplicativo e do laboratório, já instalado por ele. O Mac atual serve para desenvolver e preparar o projeto; não iniciar a aplicação ou serviços LTE nele. As instruções de inicialização abaixo descrevem as entradas do software, sem autorizar execução no Mac.

## Entradas

| Arquivo | Responsabilidade |
| --- | --- |
| `main.cjs` | Inicializador visível; executa `npm start` a partir da raiz. Pode ser iniciado com Node. |
| `electron/main.cjs` | Processo principal do Electron; cria a janela isolada e carrega o build local. Requer Electron. |
| `src/main.tsx` | Monta a aplicação React. |
| `src/App.tsx` | Compõe os painéis e conecta o controlador à interface. |

O campo `main` de `package.json` continua apontando para `electron/main.cjs`: essa é a entrada que o Electron precisa. A entrada da raiz é um inicializador para o usuário.

## Organização implementada

| Local | O que alterar aqui |
| --- | --- |
| `src/components/` | Topologia, controles, terminal, explicações e timeline. |
| `src/controller/` | Reprodução mock, dependências, revisão e cancelamento. |
| `src/backend/` | Contrato atual e implementação mock. |
| `src/simulations/` | Eventos, saídas e conteúdo educacional predefinidos. |
| `src/types/` | Tipos compartilhados da simulação. |
| `src/styles/` | Layout e aparência. |
| `electron/` | Janela desktop e limites de acesso ao sistema. |
| `tests/` | Verificações de controlador, interface e Electron. |
| `docs/` | Planejamento, arquitetura e informações do ambiente. |
| `config/` | Modelo do perfil do notebook e cópia local ignorada pelo Git. |
| `scripts/lib/lab-config.mjs` | Leitura e validação estrutural do perfil, sem operações do sistema. |
| `scripts/check-config.mjs` | Verificação do perfil por linha de comando, sem abrir o aplicativo. |
| `scripts/diagnose.mjs` | Relatório de leitura no notebook Linux x64; não inicia o aplicativo ou laboratório. |
| `scripts/lib/diagnostics.mjs` | Consultas limitadas a arquivos, versões e estados; testável com respostas simuladas. |

Fluxo atual: interface → SimulationController → SimulationBackend → MockSimulationBackend.

`dist/` é gerado pela compilação. `node_modules/` é instalado pelo npm para a máquina de execução. Ambos ficam fora do Git; não devem ser copiados do Mac para Ubuntu.

## Separação para a evolução — ainda não implementada

Preservar o modo mock e a interface existente. Acrescentar as seguintes responsabilidades quando os respectivos cartões forem implementados:

- **Configuração:** perfil e validador já preparados; conectar ao diagnóstico e à futura camada de operações. A interface mock ainda não consome esse perfil.
- **Operações reais:** camada fora do renderer que aceita identificadores de operações permitidas e acompanha processos, saídas, cancelamento e timeout.
- **Análise de capturas:** execução controlada do TShark e interpretação dos resultados com referência à evidência original.
- **Sessões:** associação entre solicitações, observações, estado atual e revisão histórica.

Os nomes e diretórios dessas implementações serão definidos ao introduzir os módulos. Não existem serviços reais ocultos nas pastas atuais.

O contrato atual aceita apenas `mode: 'mock'` e retorna uma saída por evento. Ele precisará ser ampliado para operações e eventos assíncronos. Iniciar UE é uma operação; autenticação e registro são observações decorrentes, não comandos de shell separados.

O modo real precisa distinguir revisão visual de execução: Previous não desfaz operações, Pause não congela a rede e Reset não encerra automaticamente serviços externos.

## Verificação da base

- `npm run build`: tipos e compilação.
- `npm run test:config` e `npm run test:diagnose`: validação isolada, sem execução do aplicativo ou laboratório.
- `npm test`: comportamento do controlador e cenários mock.
- `npm run test:ui`: interação no navegador; requer servidor e navegador conforme README.
- `npm run test:desktop`: abertura e isolamento do Electron em ambiente gráfico.

Passar nas verificações do Mac não confirma funcionamento no notebook Ubuntu. Essa confirmação será registrada separadamente no Kanban.
