# --- Estágio 1: Build da Aplicação ---
FROM node:20-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Estágio 2: Produção ---
FROM nginx:stable-alpine

# Copia os ficheiros estáticos da aplicação
COPY --from=build /app/dist /usr/share/nginx/html

# --- ALTERAÇÃO IMPORTANTE ---
# Copia o nosso novo script de entrypoint para dentro do contentor
COPY entrypoint.sh /entrypoint.sh
# Dá permissão de execução ao script
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Define o novo entrypoint
ENTRYPOINT ["/entrypoint.sh"]