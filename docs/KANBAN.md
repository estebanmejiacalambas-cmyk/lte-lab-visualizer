# Kanban — LTE Lab Visualizer

Atualizado em 27/10/2026. Este arquivo acompanha o trabalho local; não está sincronizado com um quadro externo.

Objetivo: desenvolver nesta máquina, distribuir pelo GitHub e executar no notebook Ubuntu sem depender de ferramentas de assistência ao desenvolvimento.

Restrição confirmada: não iniciar o aplicativo nem o laboratório no Mac atual. O ambiente LTE já foi instalado pelo usuário no notebook Ubuntu; a transferência deverá aproveitar essa instalação.

## A fazer

| ID | Cartão | Critério para passar a Feito |
| --- | --- | --- |
| 01 | Completar levantamento do notebook | Ubuntu x86_64, Git 2.43.0, Open5GS 2.8.0~noble5, Node 24.21.0 e npm 11.19.0 confirmados. Falta conferir caminhos, ferramentas de captura e permissões pelo diagnóstico no notebook. |
| 06 | Validar o mock no notebook | Dependências instaladas no Ubuntu e ambos os cenários conferidos nessa máquina. |
| 07 | Implementar primeira operação real | Verificação do MongoDB mostra saída real, sucesso, erro e timeout. Depende dos comandos validados no cartão 01. |
| 08 | Importar captura de referência | TShark interpreta PCAP/PCAPNG e mensagens conferem com a captura inspecionada no Wireshark. |
| 09 | Integrar serviços e captura | Core, eNodeB e UE acompanhados; captura inicia antes do tráfego; encerramento respeita a propriedade dos processos. |
| 10 | Sincronizar evidências e interface | Eventos reconhecidos atualizam topologia e timeline; origem e incertezas são exibidas. |
| 11 | Validar execução e manutenção | Procedimentos reais e falhas verificados; guia de atualização e retorno de versão utilizável no notebook. |

## Fazendo

- **05 · Validar e publicar primeira versão:** Git local inicializado na branch `main`. Destino privado criado pelo usuário: `https://github.com/estebanmejiacalambas-cmyk/srsRAN`. Arquivos revisados, build e 22 testes aprovados (9 controlador, 6 configuração, 7 diagnóstico). Publicação ainda pendente; aplicação e laboratório não iniciados no Mac.

## Feito

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
