#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v npm >/dev/null 2>&1; then
  echo 'Instale Node.js 22.12 ou superior para abrir o aplicativo.'
  read '?Pressione Enter para fechar.'
  exit 1
fi
if [ ! -d node_modules ]; then
  echo 'Dependências do aplicativo ausentes.'
  read '?Pressione Enter para fechar.'
  exit 1
fi
npm start
