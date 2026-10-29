# Atualizar os quatro cenários no Ubuntu

Este guia atualiza a versão inicial 2941b4b para a publicação de Attach, Handover, TAU e Paging. Todos continuam simulados. O novo código não altera serviços LTE nem a segurança do sistema. O bloqueio de abertura do Electron por sandbox permanece uma questão separada, em avaliação com o TI.

## Antes de atualizar

Feche a interface ou interrompa o servidor preview com Ctrl+C, se estiver ativo. No terminal do Ubuntu:

```bash
cd "$HOME/lte-lab-visualizer"
git status --short --branch
```

Se houver arquivos alterados ou novos, revisar antes de continuar; não usar reset --hard, clean ou apagar arquivos para “resolver”. `config/lab.local.json` é ignorado pelo Git e deve ser preservado. Caso tenha personalizado esse arquivo, manter também uma cópia local de segurança em local privado; não publicá-lo.

## Receber a publicação

Depois de confirmar a publicação e ausência de mudanças locais conflitantes:

```bash
git -c credential.helper= pull --ff-only origin main
```

O repositório é privado. Se necessário, autenticar com usuário e token de leitura restrito ao repositório; o token vai somente no prompt Password, nunca no comando ou na conversa. Se foi revogado, será necessária nova autenticação. O helper de credenciais fica desativado somente para essa operação. Se houver erro de autenticação ou divergência de branches, parar e conferir; não usar force.

## Compilar a versão recebida

Esta atualização não altera dependências nem package-lock.json. Para o notebook que já instalou as dependências e o Electron:

```bash
nvm use
npm run build
```

Não é necessário repetir npm ci, pois ele substitui node_modules. Se o build falhar por dependência ausente, diagnosticar a mensagem antes de reinstalar.

## Conferência em ambiente autorizado

A janela Electron continua aguardando a correção de sandbox definida com o responsável. Quando resolvida, abrir `npm run desktop`. Como alternativa de interface no navegador local, se desejado, `npm run preview` usa 127.0.0.1; abrir o endereço que o terminal mostrar. Isso não transforma o mock em executor Linux.

Conferir os quatro cartões, avançar cada cenário até o resumo e testar Previous/Reset. TAU deve mostrar PLMN 999/70 e Request/Accept. Paging deve mostrar srsEPC, IP 172.16.0.2 e Idle antes do tráfego. Confirmar que retornar/revisar não mistura estados de cenários. Testes gráficos não foram executados no Mac por orientação do usuário.

## Resultado esperado

Quatro cenários disponíveis. O planejamento dos comandos reais é tratado separadamente na conversa. Integração real, permissões para controlar serviços e leitura automática de evidências ainda não estão implementadas. Não alterar SUID/AppArmor, adicionar --no-sandbox ou executar a interface com sudo como parte desta atualização.
