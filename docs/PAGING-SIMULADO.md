# Paging simulado

Quarta simulação do Visualizer, baseada na especificação de Paging fornecida pelo usuário em 28/10/2026. São 13 grupos de etapas e 19 eventos. Todos os comandos e resultados são textos reproduzidos pelo MockSimulationBackend; nenhum serviço, namespace, processo ou captura é iniciado.

## Cenário representado

- srsRAN 4G 23.11: srsEPC, srsENB e srsUE com ZeroMQ.
- Open5GS parado como pré-condição do roteiro real; o mock não para serviços.
- Host e srsEPC no namespace principal, interface srs_spgw_sgi em 172.16.0.1/24.
- Interface tun_srsue em ue1, IP 172.16.0.2/24. A configuração do gateway coloca a TUN em ue1; não representa todo o processo srsUE executando nesse namespace.
- PLMN 001/01; cadastro em user_db.csv; timer de inatividade de 15000 ms.

A topologia própria usa Host → srsEPC → eNodeB → UE. Os identificadores internos pgw e mme são reutilizados para Host e srsEPC somente neste cenário; seus títulos, descrições e rótulos no inspetor são específicos de Paging.

## Sequência didática

1. Conferir cenário exclusivo, namespace e configuração.
2. Iniciar EPC, eNodeB e UE; confirmar Attach e IP.
3. Observar RRC Release e RRC Idle antes do tráfego.
4. Conferir TUN em ue1 e rota pelo srs_spgw_sgi.
5. Gerar downlink e acompanhar notificação do EPC e Paging.
6. Observar S-TMSI match e Service Request com causa mt-Access.
7. Acompanhar novo Random Access, RRC Connected e Service Request successful.
8. Correlacionar logs e apresentar conclusão simulada.

O controlador permite avançar somente na sequência. O PASS final representa a conclusão do roteiro predefinido, não um analisador de logs reais nem um teste executado no notebook.

## Limites e critérios

Ping sozinho não comprova Paging. A rota `local 172.16.0.2 dev lo` é explicada como caminho inválido: o host pode responder sem atravessar LTE. As duas ocorrências de Random Access/RRC Connected só têm valor quando associadas ao Attach e à retomada após Idle. A ausência de strings Paging no log do eNodeB não invalida automaticamente as evidências do UE e EPC.

Não são inventadas respostas ICMP ou latências medidas. A reprodução automática não respeita o tempo real do timer; representa seus marcos. Setas mostram relações didáticas, não pacotes decodificados. Revisar logs históricos preserva o estado atual da rede.

Integração com comandos reais e Wireshark permanece fora desta entrega. No laboratório autorizado, a limpeza e eventual restauração do Open5GS devem seguir o procedimento operacional; a simulação apenas explica essa etapa.

## Validação

`npm run test:paging` cobre sequência de pré-condições, retorno/reset, descarte de resposta pendente, rótulos próprios e renderização HTML estática de todas as rotas. Os testes não abrem o aplicativo.

Build e 23 testes de Paging, TAU, mensagens e controlador aprovados em 28/10/2026. Conferência visual e interação no notebook autorizado ainda pendentes. Publicado em 29/10/2026 no commit 9a32018; validação visual continua pendente.
