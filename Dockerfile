# --- Estágio 1: Build da Aplicação ---
# Usamos uma imagem completa do Node para ter todas as ferramentas de build.
FROM node:20-slim AS build

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# --- CORREÇÃO IMPORTANTE ---
# Copia APENAS o package.json para forçar uma instalação limpa.
COPY package.json ./

# Instala as dependências DENTRO do contêiner Linux, gerando um
# package-lock.json novo e correto para o ambiente.
RUN npm install

# Copia o resto do código-fonte da sua aplicação.
COPY . .

# Roda o script de build para gerar os arquivos estáticos na pasta /app/dist.
RUN npm run build


# --- Estágio 2: Produção ---
# Usamos uma imagem super leve do NGINX para servir os arquivos.
FROM nginx:stable-alpine

# Copia os arquivos estáticos que foram gerados no estágio de build
# para a pasta padrão do NGINX que serve conteúdo web.
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do NGINX.
EXPOSE 80

# O comando padrão da imagem do NGINX já é iniciado, então não precisamos de um CMD.
