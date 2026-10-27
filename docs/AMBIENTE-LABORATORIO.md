# Ambiente do notebook de destino

Levantamento em 27/10/2026, baseado no manual `teste_organizado.docx` fornecido pelo usuário e em suas confirmações. O usuário confirmou ter instalado pessoalmente o ambiente no notebook. Ainda não houve diagnóstico remoto pelo projeto.

## Local de desenvolvimento e execução

- Mac atual: edição e preparação dos arquivos para distribuição. Não iniciar o Visualizer, serviços LTE ou capturas nesta máquina.
- Notebook Ubuntu: execução do Visualizer e uso do laboratório já instalado pelo usuário.
- Não reinstalar o laboratório como parte da transferência do Visualizer. Diagnosticar a instalação existente antes de solicitar operações reais.

| Item | Informação / situação |
| --- | --- |
| Sistema operacional | Ubuntu 24.04 LTS |
| srsRAN | srsRAN 4G 23.11 |
| Open5GS | Pacotes `2.8.0~noble5`, conforme saída de `dpkg-query` enviada pelo usuário; árvore v2.8.0, commit relatado `157f611` no manual, para testes TAU/Handover |
| Instalação e configuração | Seguem o procedimento do manual do laboratório |
| Instalação efetiva e serviços funcionando | Instalação confirmada pelo usuário; estado atual dos serviços será verificado no notebook |
| Arquitetura da máquina | `x86_64`, confirmada pela saída de `uname -m` |
| Git | 2.43.0, confirmado pela saída enviada |
| Node.js / npm | Node v24.21.0 e npm 11.19.0 instalados via nvm; versões confirmadas pela saída enviada pelo usuário. |
| Método de distribuição | Projeto pelo GitHub; instalação e execução no notebook |

## Dados extraídos do manual

Estes são os valores documentados, a serem comparados com a máquina ao transferir o aplicativo. `~` representa a pasta pessoal do usuário no Ubuntu.

| Item | Valor documentado |
| --- | --- |
| Código srsRAN | `~/srsran/srsRAN_4G_23_11`, release 23.11, commit relatado `eea87b1d8` |
| Binários | `build/srsenb/src/srsenb` e `build/srsue/src/srsue`, relativos ao código srsRAN |
| Diretório de trabalho | `~/srsran/lte_lab` |
| Configuração Attach | `enb_open5gs.conf`, `ue.conf`, `sib.conf`, `rr.conf`, `rb.conf` |
| MongoDB | Container `open5gs_mongo`, banco `open5gs`; verificação por `mongosh` com `db.adminCommand({ping:1})` |
| Serviços LTE | `open5gs-mmed`, `open5gs-hssd`, `open5gs-sgwcd`, `open5gs-sgwud`, `open5gs-smfd`, `open5gs-upfd`, `open5gs-pcrfd` |
| Configuração e logs do Core | `/etc/open5gs/` e `/var/log/open5gs/` |
| PLMN / TAC / PCI / PRB | `00101` / `7` / `1` / `50` |
| APN | `srsapn` |
| Namespace e interface UE | `ue1` e `tun_srsue` |
| MME / eNodeB S1 | `127.0.0.2` / `127.0.1.1` |
| ZeroMQ | eNodeB TX 2000/RX 2001; UE TX 2001/RX 2000 |
| Árvore de testes Open5GS | `~/open5gs-2.8.0` |
| Handover | `build/tests/handover/handover`, configuração `build/configs/sample_handover.yaml`, caso `epc-s1-test`, timeout documentado de 180 segundos |
| Banco isolado do Handover | `open5gs_handover` |
| Captura de Handover | `tcpdump` na interface `lo`, iniciada antes do teste; leitura posterior com TShark e filtro `s1ap` |

## Fluxos distintos

Attach usa srsUE, srsENB e serviços Open5GS. Handover usa a suíte de testes Open5GS; não representa automaticamente dois srsENB e um srsUE em mobilidade real. A suíte pode produzir casos negativos intencionais no mesmo PCAP.

Paging usa srsEPC no manual; TAU usa `idle-test` da árvore Open5GS. Esses procedimentos permanecem fora da primeira integração, focada nos dois cenários existentes no Visualizer.

O manual descreve instalação, configuração e operação. Seus comandos são referência para implementação, não autorização para executar alterações locais. A automação deverá substituir encerramentos amplos por controle dos processos pertencentes à sessão e preservar o estado anterior dos serviços.

## Evidência necessária para concluir o cartão 01

Conferir no notebook e registrar:

- Confirmação dos caminhos documentados e presença dos arquivos no notebook.
- Disponibilidade de TShark/Wireshark e dependências do laboratório; Node/npm já instalados e confirmados.
- Permissões disponíveis para serviços, Docker, logs, namespaces e captura na interface documentada.
- Captura de referência disponível e resultado esperado.

Não registrar credenciais ou chaves de assinantes neste arquivo. O questionário técnico detalhado permanece em `PERGUNTAS-PARA-VALIDAR-LABORATORIO.txt` na raiz.

## Pendência imediata

Manual recebido e lido; instalação confirmada pelo usuário. Perfil de configuração preparado em `config/lab.example.json`; conferir no notebook por diagnóstico. Não transcrever chaves K/OPc do manual para arquivos versionados ou relatórios.
