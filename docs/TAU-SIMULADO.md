# Simulação Tracking Area Update

Implementada a pedido do usuário, a partir do texto de apoio “LTE TAU TEST — EXECUTION SPECIFICATION FOR PROGRAMMING AGENT”, recebido em 27/10/2026. As instruções operacionais dessa fonte foram tratadas como conteúdo do roteiro; não foram executadas.

## Escopo

Terceiro cenário do Visualizer, com 11 grupos e 13 eventos. Usa o mesmo backend mock, controles de reprodução, explicações, terminal, timeline e painel de mensagens. Não instala componentes, não inicia processos e não lê nem grava PCAPs.

Baseline documentado: Open5GS v2.8.0, commit 157f611, executável `build/tests/attach/attach`, caso `idle-test`, banco `open5gs_tau`, captura em `lo`, PLMN 999/70. Esse cenário não usa srsUE/srsENB e não deve herdar PLMN, IMSI, IP ou TAC específicos do Attach integrado.

## Roteiro

1. Versão e binários.
2. Configuração e banco isolados.
3. Conferência dos serviços parados e porta 7777 livre.
4. Evidências da mesma sessão e captura antes do tráfego.
5. Execução de idle-test e preservação de PIPESTATUS[0].
6. Finalização da captura e exit=0.
7. Conferência do PCAP: a tela reproduz o trecho TShark do suporte histórico; a futura análise usará Wireshark conforme preferência do usuário.
8. Request 0x48 com TA updating (0), Old GUTI e PLMN 999/70.
9. Accept correspondente 0x49 com TA updated (0).
10. T3412 de 9 minutos e distinção dos outros casos da suíte.
11. Resumo das duas camadas e explicação da restauração condicional dos serviços.

A topologia mostra somente papéis de UE, MME e banco da suíte. A seta UE–MME representa a relação lógica NAS; o transporte via acesso/S1AP é abstraído. Não representa uma conexão rádio direta ou posição medida. Os indicadores são execução, Request e Accept; não afirmam registro, conexão rádio ou IP não fornecidos para este cenário.

## Limites

Este é um roteiro de sucesso predefinido, não um validador de capturas reais ou um executor do algoritmo operacional. Falhas de ambiente e de evidência são explicadas no conteúdo, mas não há injeção interativa de falhas nesta entrega. Um processo com exit=0, um arquivo presente, um tamanho observado ou um hash não bastam para validar TAU real.

Os comandos exibidos são trechos da especificação. Etapas foram agrupadas para ensino; o terminal não constitui um script completo para copiar e executar. Preparação destrutiva, alteração de privilégios e restauração não são executadas pelo mock. Saídas de ligação didática que não são transcrições foram marcadas como representações conceituais.

O valor T3412 de 9 minutos pertence à captura de referência, não é universal. Casos Combined TA/LA e Periodic updating são distintos do caso principal. Na execução real seria necessário correlacionar as mensagens de cada contexto, sem misturar Request e Accept de casos diferentes.

## Verificação

`npm run test:tau` cobre sequência, duas camadas, dados do cenário, reset/revisão/troca durante resposta pendente e HTML estático dos componentes. `tests/ui.cjs` inclui navegação pelo TAU, mas sua execução gráfica está pendente em ambiente autorizado. Nenhum aplicativo foi aberto no Mac.
