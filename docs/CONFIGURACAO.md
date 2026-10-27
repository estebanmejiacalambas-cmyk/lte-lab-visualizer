# Configuração do notebook Ubuntu

O perfil prepara as próximas etapas de diagnóstico e integração. Ele ainda não altera o comportamento do aplicativo: a interface permanece no modo mock. Não executa comandos nem modifica os arquivos do laboratório.

## Arquivos

- `config/lab.example.json`: modelo distribuído com o projeto, baseado no manual e nas informações do notebook.
- `config/lab.local.json`: cópia adaptada ao notebook, ignorada pelo Git.
- `scripts/lib/lab-config.mjs`: leitor e validador reutilizável para o diagnóstico e o futuro backend.

## Preparar no notebook após instalar Node e baixar o projeto

Na raiz do projeto, copie o exemplo somente se ainda não existir uma configuração local:

```bash
cp -n config/lab.example.json config/lab.local.json
```

Edite `config/lab.local.json` e confira os caminhos. Use caminhos absolutos Linux ou o prefixo `~/`. O validador mantém `~/` como texto; a futura camada Linux deverá resolvê-lo para a pasta pessoal do usuário que executa o Visualizer, antes de elevar privilégios. Não use `$HOME`, comandos ou substituições de shell.

Valide a estrutura:

```bash
npm run config:check
```

Para conferir apenas o modelo distribuído:

```bash
npm run config:check -- --example
```

Essas verificações não abrem o Electron, não iniciam processos do laboratório e não conferem se os caminhos existem. Configuração estruturalmente válida não significa ambiente pronto; a conferência de arquivos, ferramentas e permissões pertence ao cartão 04.

## Campos

| Grupo | Finalidade |
| --- | --- |
| `schemaVersion` | Versão do formato, atualmente 1. |
| `target` | Ubuntu 24.04 em Linux x64 (`uname -m` informa `x86_64`). |
| `paths` | Binários, configurações existentes, logs e diretório reservado às sessões do Visualizer. Nenhum diretório é criado pelo validador. |
| `mongodb` | Container e banco usados pelo Attach. Não inclui credenciais. |
| `handover` | Banco isolado, caso `epc-s1-test` e timeout inteiro entre 1 e 600 segundos. |
| `capture` | Interface documentada para a captura da suíte de Handover (`lo`). A captura do Attach deverá ser validada separadamente. |
| `expectedVersions` | Referências para o diagnóstico: srsRAN 23.11, pacotes Open5GS 2.8.0~noble5 e árvore de testes 2.8.0. Não são resultados detectados automaticamente. |

O validador rejeita campos ausentes, desconhecidos e valores incompatíveis. Comandos arbitrários, chaves K/OPc e senhas não fazem parte do perfil. A futura camada de operações terá sua própria lista permitida; um caminho válido neste perfil não autoriza sua execução.

O perfil não reconfigura o banco dentro dos YAMLs nem altera PLMN, APN ou parâmetros de rádio. Esses valores continuam nos arquivos existentes do laboratório. O diagnóstico deverá conferir a compatibilidade antes de iniciar qualquer operação.

Arquivos locais de configuração, `.env`, logs e capturas estão ignorados pelo Git. O modelo público deve continuar sem credenciais.

## Validação do código

`npm run test:config` executa testes isolados de leitura e validação, sem Electron e sem acesso ao laboratório.
