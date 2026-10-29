# Pontos para conversar com o TI

Objetivo: confirmar as regras para usar o Visualizer no notebook do estágio, aproveitando o laboratório LTE existente. Atualização em 29/10: clonagem, dependências e build concluídos pelo usuário com autorização relatada do chefe; abertura desktop aguarda orientação do Eliseu sobre sandbox.

## Contexto para apresentar

O Visualizer é uma interface desktop Electron/React para ensino de LTE. A versão atual mostra cenários simulados; seus botões não controlam o laboratório. Node 24.21.0 e npm 11.19.0 já foram instalados pelo usuário via nvm. O código está em um repositório privado no GitHub. Clonagem HTTPS concluída com token restrito e credential.helper desativado para a operação. Nenhum token deve ser incluído neste documento.

A evolução pretende analisar capturas com Wireshark e solicitar um conjunto definido de operações do laboratório. Essas operações ainda não estão implementadas. O diagnóstico preparado apenas consulta arquivos, versões e estados; não usa sudo nem inicia serviços ou capturas.

## Perguntas

1. É permitido manter Node/npm via nvm e executar um aplicativo Electron desenvolvido para o laboratório? Há versão ou forma de distribuição exigida?
2. O notebook pode baixar dependências npm e o runtime Electron, inclusive executar seus scripts de instalação? Há proxy ou repositório interno obrigatório?
3. Qual forma de acesso ao repositório privado é permitida: conta institucional, conta pessoal, GitHub CLI, SSH ou transferência de uma versão aprovada? Como as credenciais devem ser armazenadas?
4. O usuário pode consultar Docker, arquivos de configuração e logs do laboratório? Quais acessos já existem e quais exigem autorização?
5. Para a futura integração, quais operações podem ser autorizadas sobre serviços Open5GS, srsUE/srsENB, namespaces e captura em loopback? Quem administra essas autorizações?
6. Onde logs e PCAPs podem ser guardados, por quanto tempo e quais dados podem sair da máquina para revisão? Podemos usar capturas anonimizadas de referência?

## Resultado a registrar

- Método de instalação/distribuição aprovado.
- Forma de autenticação aprovada e conta a utilizar.
- Operações permitidas e responsável pela configuração dos acessos.
- Regras para armazenamento e compartilhamento de evidências.

Não precisamos de senhas, tokens ou chaves de assinantes na conversa ou no repositório. As respostas orientarão a integração; não implicam alteração automática do notebook.

## Bloqueio atual da janela desktop

Electron compilado, mas aborta por sandbox no Ubuntu. Consultas informadas pelo usuário: `kernel.apparmor_restrict_unprivileged_userns=1` e `kernel.unprivileged_userns_clone=1`; auxiliar chrome-sandbox pertence ao usuário, modo 755. Solicitar ao responsável uma configuração aprovada para este aplicativo. Não desativar proteções globais nem executar a interface como root.
