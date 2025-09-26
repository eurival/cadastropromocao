#!/bin/sh

# --- Configuração ---
# Pare o script se qualquer comando falhar
set -e

# Nome da sua imagem no Docker Hub (usuário/repositório)
DOCKER_IMAGE_NAME="eurival/cadastropromocao-frontend"
# Tag da imagem. 'latest' é comum, mas usar o hash do commit (git rev-parse --short HEAD) é uma prática melhor.
IMAGE_TAG="latest"

# Configuração do Kubernetes
K8S_NAMESPACE="cadastropromocao-apps"
K8S_DEPLOYMENT_NAME="cadastropromocao-deployment"


# --- Início do Script ---

echo "🚀 Iniciando o processo de deploy..."

# 1. Build da imagem Docker
echo "📦 Construindo a imagem Docker: ${DOCKER_IMAGE_NAME}:${IMAGE_TAG}"
docker build -t "${DOCKER_IMAGE_NAME}:${IMAGE_TAG}" .

# 2. Push da imagem para o Docker Hub
echo "⬆️ Enviando a imagem para o Docker Hub..."
docker push "${DOCKER_IMAGE_NAME}:${IMAGE_TAG}"

# 3. Forçar o rolling update no Kubernetes
# Este comando atualiza o deployment para usar a nova imagem que acabamos de enviar.
# A anotação com a data/hora força o Kubernetes a recriar os Pods.
echo "🔄 Realizando o rolling update no Kubernetes..."
kubectl patch deployment ${K8S_DEPLOYMENT_NAME} -n ${K8S_NAMESPACE} -p \
  "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"kubectl.kubernetes.io/restartedAt\":\"$(date +'%Y-%m-%dT%H:%M:%SZ')\"}}}}}"

echo "✅ Deploy concluído com sucesso!"
