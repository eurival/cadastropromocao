#!/bin/sh
# entrypoint.sh

# 1. Cria um ficheiro de configuração JavaScript no diretório web do NGINX.
# Ele lê as variáveis de ambiente que o Kubernetes injetou e as escreve
# num objeto 'window.runtimeConfig' que o seu React poderá ler.
echo "window.runtimeConfig = {
  API_BASE_URL: \"${VITE_API_BASE_URL}\",
  API_USERNAME: \"${VITE_API_USERNAME}\",
  API_PASSWORD: \"${VITE_API_PASSWORD}\"
};" > /usr/share/nginx/html/config.js

# 2. Inicia o servidor NGINX em primeiro plano.
# Esta deve ser a última linha do script.
exec nginx -g 'daemon off;'