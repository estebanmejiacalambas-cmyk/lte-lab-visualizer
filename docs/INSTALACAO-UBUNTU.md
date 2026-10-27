# Preparar o Visualizer no Ubuntu

Destino: notebook Ubuntu 24.04 LTS x86_64 com o laboratório já instalado. Este guia instala as ferramentas do Visualizer, não reinstala srsRAN, Open5GS ou MongoDB. Não executar no Mac de desenvolvimento.

## 1. Instalar Node.js e npm no notebook

O projeto requer Node >=22.12. A referência adotada é Node **24.21.0**, fixada em `.nvmrc`. O npm acompanha o Node nessa instalação. Usamos nvm por usuário, conforme a orientação de instalação do Node/npm. Não executar npm com sudo.

No terminal Bash do notebook, confira se curl está disponível:

```bash
curl --version
```

Se o comando estiver ausente, instale apenas essa ferramenta:

```bash
sudo apt update
sudo apt install curl
```

Instale o nvm e o Node. Esse bloco baixa e executa o instalador oficial do nvm, configura o gerenciador na pasta pessoal e instala Node/npm; não é um diagnóstico de leitura.

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh -o /tmp/lte-nvm-install.sh
bash /tmp/lte-nvm-install.sh
source "$HOME/.nvm/nvm.sh"
nvm install 24.21.0
node --version
npm --version
```

Execute cada linha somente se a anterior terminou sem erro. Node deve mostrar `v24.21.0`; npm deve mostrar sua versão. Se houver erro de rede ou instalação, envie a saída antes de continuar. Em terminais novos, o nvm deve ser carregado pelo perfil do shell; se não estiver disponível, use novamente a linha `source` acima.

Referências consultadas em 27/10/2026: [download oficial do Node.js](https://nodejs.org/en/download), [instalação de Node/npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) e [projeto nvm](https://github.com/nvm-sh/nvm). A versão do instalador consta no método apresentado pelo site do Node na consulta.

## 2. Obter o projeto

Repositório privado: `https://github.com/estebanmejiacalambas-cmyk/srsRAN`. Após confirmar a primeira publicação, clone no notebook com uma conta que tenha acesso:

```bash
git clone https://github.com/estebanmejiacalambas-cmyk/srsRAN.git lte-lab-visualizer
cd lte-lab-visualizer
```

Não copie `node_modules` ou `dist` do Mac. A autenticação deve ser feita no notebook; não envie tokens pela conversa.

Se os arquivos forem transferidos temporariamente por outro meio, preserve `package.json`, `package-lock.json`, `.nvmrc`, `config/`, `scripts/` e o restante do código-fonte. O diagnóstico usa somente módulos nativos do Node e pode ser executado antes de `npm ci`.

## 3. Configurar e diagnosticar sem iniciar o laboratório

Na raiz do projeto, execute:

```bash
nvm use
cp -n config/lab.example.json config/lab.local.json
npm run config:check
npm run diagnose
```

O `cp -n` preserva uma configuração local já existente. Ajuste os caminhos no arquivo local conforme [Configuração](CONFIGURACAO.md). O diagnóstico deve ser executado como usuário normal, sem sudo.

Envie a saída inteira de `npm run diagnose` para revisão. Ele informa:

- Node/npm, Git, Docker, TShark, tcpdump e versão ZeroMQ disponível via pkg-config;
- arquivos de configuração, diretórios e executáveis documentados;
- estado dos sete serviços LTE e suas versões de pacote;
- tags das árvores srsRAN/Open5GS de testes;
- estado do container MongoDB e existência da interface de captura.

Cada comando externo tem timeout de cinco segundos e saída limitada. O script não usa shell, não inicia serviços, não executa srsUE/srsENB, não abre o Electron, não captura tráfego e não consulta chaves de assinantes. Também não altera permissões. A ausência de pkg-config/libzmq no diagnóstico não comprova, isoladamente, que o binário srsRAN instalado está inutilizável.

Os resultados **PENDENTE** podem ser arquivo ausente, versão diferente, serviço inativo ou falta de acesso. Um serviço inativo pode ser esperado antes da aula; não será iniciado automaticamente. **OK** no estado de serviço/container não comprova resposta funcional do MongoDB ou sucesso LTE.

Códigos de saída: **0** sem pendências nas consultas realizadas; **2** com pendências; **1** para erro de configuração, plataforma incompatível ou execução como root. Mesmo com código 0, captura, autorização para controlar serviços, escrita de sessões e abertura gráfica precisam de validação posterior.

Para gerar um arquivo JSON, opcionalmente:

```bash
node scripts/diagnose.mjs --json > diagnostico.local.json
```

O diagnóstico não escreve arquivos por conta própria; a redireção acima grava o relatório. O nome está ignorado pelo Git.

## 4. Instalar dependências do Visualizer

Após revisar as pendências, no notebook:

```bash
npm ci
npm run build
npm test
npm run test:config
npm run test:diagnose
```

`npm ci` baixa as dependências e o Electron, podendo precisar de acesso à internet. Não é instalação do laboratório LTE. Erros de download ou pacotes devem ser registrados antes de trocar versões no lockfile.

## 5. Abrir o mock no notebook

Somente no Ubuntu com sessão gráfica:

```bash
node main.cjs
```

Confira Attach e Handover. O perfil de laboratório ainda não transforma esses botões em comandos reais; a integração começa no cartão 07. Se a janela falhar por biblioteca gráfica ou sandbox do Electron, envie o erro exato. Não usar sudo para abrir o aplicativo nem adicionar `--no-sandbox` como correção automática.

## Atualizações futuras

Antes de atualizar, feche o Visualizer e consulte o estado do repositório. A atualização do código será feita pelo Git; a configuração `lab.local.json` permanece local. O procedimento de retorno de versão será detalhado quando houver a primeira versão publicada.
