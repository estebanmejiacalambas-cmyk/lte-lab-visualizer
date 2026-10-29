# Kanban — LTE Lab Visualizer

Atualizado em 29/10/2026. Este arquivo acompanha o trabalho local; não está sincronizado com um quadro externo.

Objetivo: desenvolver nesta máquina, distribuir pelo GitHub e executar no notebook Ubuntu sem depender de ferramentas de assistência ao desenvolvimento.

Restrição confirmada: não iniciar o aplicativo nem o laboratório no Mac atual. O ambiente LTE já foi instalado pelo usuário no notebook Ubuntu; a transferência deverá aproveitar essa instalação.

Situação atual: usuário informou autorização do chefe e concluiu clonagem da versão 2941b4b, instalação de dependências/Electron e compilação no Ubuntu. Diagnóstico com 0 pendências. Abertura desktop bloqueada pela sandbox; orientação solicitada ao Eliseu. Nenhuma alteração de AppArmor, SUID ou execução com sudo foi orientada como correção. Em 29/10, usuário autorizou publicar TAU/Paging; o mapeamento dos botões será entregue somente na conversa.

## A fazer

| ID | Cartão | Critério para passar a Feito |
| --- | --- | --- |
| 01 | Completar levantamento do notebook | Diagnóstico da versão inicial com 0 pendências em 29/10. Falta conferir permissões operacionais, Wireshark gráfico e pré-requisitos específicos de TAU/Paging. |
| 06 | Validar o mock no notebook | Dependências instaladas no Ubuntu e os quatro cenários conferidos nessa máquina. |
| 07 | Implementar primeira operação real | Verificação do MongoDB mostra saída real, sucesso, erro e timeout. Depende dos comandos validados no cartão 01. |
| 08 | Importar captura de referência | Fluxo de importação definido com Wireshark, conforme preferência do usuário, e mensagens conferidas com a captura. |
| 09 | Integrar serviços e captura | Core, eNodeB e UE acompanhados; captura inicia antes do tráfego; encerramento respeita a propriedade dos processos. |
| 10 | Sincronizar evidências e interface | Eventos reconhecidos atualizam topologia e timeline; origem e incertezas são exibidas. |
| 11 | Validar execução e manutenção | Procedimentos reais e falhas verificados; guia de atualização e retorno de versão utilizável no notebook. |

## Fazendo


- **14 · Adicionar Paging simulado (solicitado pelo usuário):** código implementado com 13 grupos e 19 eventos, topologia srsEPC própria e sequência Idle → downlink → Paging → Service Request → retomada. Namespace/rota explicados para evitar ping local. Build e 23 testes isolados aprovados, incluindo 5 de Paging e renderização HTML estática. Validação visual/interação pendente em ambiente autorizado. Nenhum aplicativo aberto no Mac; publicado em 29/10 no commit 9a32018.

- **13 · Adicionar TAU simulado (solicitado pelo usuário):** código implementado com 11 grupos e 13 eventos, topologia própria e evidências de execução/Request/Accept. Compilação, 5 testes TAU, 4 testes de mensagens e 9 testes do controlador aprovados. HTML estático conferido por testes; validação visual/interação pendente em ambiente autorizado. Publicado em 29/10 no commit 9a32018.
- **12 · Painel didático de mensagens simuladas (antecipado):** implementação concluída com filtros, detalhes, revisão e destaque de uma rota na topologia. Build, 4 testes de mensagens e 9 de controlador aprovados. Teste de UI ampliado, ainda não executado; validação visual pendente em ambiente autorizado. Publicado como parte da versão 9a32018; validação visual ainda pendente.
- Cartão **06** aguarda resolução da sandbox com Eliseu e conferência visual dos quatro cenários. Captura real e executor Linux continuam fora desta entrega.

## Feito

- **15 · Publicar os quatro cenários:** push de 9a32018 para main confirmado em 29/10. Build e 36 testes isolados aprovados. Mapa dos comandos excluído do commit e do histórico enviado a pedido do usuário. A publicação não resolve a sandbox nem certifica a interface gráfica no Ubuntu.


- **05 · Validar e publicar primeira versão:** commit `2941b4b` confirmado diretamente na branch `main` do GitHub por `git ls-remote`. Build e 22 testes aprovados antes da publicação. Repositório privado: `https://github.com/estebanmejiacalambas-cmyk/srsRAN`. Validação gráfica e diagnóstico real no Ubuntu continuam pendentes.
- Preparação Node/npm no notebook: usuário confirmou Node v24.21.0 e npm 11.19.0 instalados via nvm. Ainda não confirma instalação ou abertura do Visualizer.
- **04 · Preparar instalação e diagnóstico:** guia Ubuntu, `.nvmrc` com Node 24.21.0 e `npm run diagnose` implementados. Consultas limitadas e sem sudo; não inicia serviços, captura ou aplicativo. 7 testes do diagnóstico e 6 de configuração aprovados. Testes com respostas simuladas e arquivos temporários; diagnóstico real no Ubuntu ainda pendente. Referências de instalação conferidas na documentação oficial.
- **03 · Separar configuração local do código:** modelo em `config/lab.example.json`, cópia local ignorada pelo Git, leitor/validador e guia de configuração. `npm run config:check -- --example` aprovado e 6/6 testes de configuração aprovados. Perfil destinado à futura integração; mock preservado. Não valida a presença de arquivos ou serviços no Ubuntu.
- **02 · Organizar projeto e documentar entradas:** documentação separada em `docs/`, mapa de responsabilidades atuais e futuras, levantamento do notebook e links no README e guia inicial. Estrutura de código existente preservada, sem criar módulos de integração vazios. Verificação local: `npm run build` aprovado e `npm test` com 9/9 testes aprovados. Interface gráfica e notebook Ubuntu ainda não verificados nesta etapa.
- Protótipo mock de Attach e S1 Handover implementado. A validação no notebook Ubuntu pertence ao cartão 06.
- `main.cjs` na raiz e configuração F5 do VS Code. Problema de inicialização resolvido, conforme confirmação do usuário.

## Regras de acompanhamento

- Manter um cartão técnico por vez em Fazendo.
- Mover para Feito somente quando houver evidência do critério de conclusão.
- Registrar pendências no próprio cartão; informações ausentes não são resultados verificados.
- A primeira publicação cobre a base transferível (01 a 05). Integração real vem depois da validação no notebook.
- Ao concluir cada passo, atualizar este arquivo e informar o resultado na conversa.

## Histórico

- 27/10/2026: iniciado o planejamento executável e registrado o ambiente informado pelo usuário. Nenhuma integração real ou publicação foi feita nesta etapa.
- 27/10/2026: cartão 02 concluído. O primeiro teste foi impedido pela restrição de IPC do sandbox; repetido com permissão, passou integralmente.
- 27/10/2026: manual recebido e levantamento atualizado. Usuário confirmou instalação do laboratório no notebook e restringiu execução do aplicativo àquela máquina. Attach e Handover documentados como fluxos distintos; cartão 03 permanece como próximo passo.
- 27/10/2026: recebida saída do notebook com x86_64, Git 2.43.0, Open5GS 2.8.0~noble5 e ausência de Node/npm. Cartão 03 concluído com validação isolada dos arquivos; nenhum aplicativo ou serviço LTE iniciado no Mac.
- 27/10/2026: cartão 04 concluído como entrega de código e guia. Próxima ação do usuário: instalar Node/npm no Ubuntu e enviar versões. Publicação/transferência e diagnóstico real ainda não realizados.
- 27/10/2026: instalação de Node/npm confirmada no Ubuntu; cartão 05 iniciado com inspeção do estado Git local. Aguardando definição do repositório de destino.
- 27/10/2026: usuário criou o repositório privado srsRAN. Base preparada para primeira publicação e guia atualizado com endereço de clonagem.
- 27/10/2026: publicação confirmada no GitHub; cartão 05 concluído. Esta atualização do quadro é local e será incluída na próxima publicação.
- 27/10/2026: usuário adiou atividades no notebook do estágio até conversar com o TI. Antecipado cartão 12, sem abrir o aplicativo no Mac e sem publicar mudanças. Guia para conversa com TI preparado.
- 27/10/2026: após o usuário exigir aprovação prévia de alterações, recebido pedido explícito de adicionar TAU com especificação de apoio. Implementado somente o cenário simulado autorizado. Integração real e publicação permanecem pendentes.

- 28/10/2026: Paging adicionado a pedido do usuário conforme especificação fornecida. Comandos permanecem textos do mock; não houve execução no laboratório nem integração com Wireshark.

- 29/10/2026: usuário confirmou instalação/compilação no Ubuntu e diagnóstico sem pendências; Electron abortou por configuração da sandbox. Orientação com Eliseu pendente. Publicação das simulações autorizada explicitamente. Mapa de comandos será entregue na conversa, fora do GitHub.

- 29/10/2026: publicação de TAU/Paging confirmada; mapa entregue separadamente na conversa. Notebook ainda precisa receber a atualização.
