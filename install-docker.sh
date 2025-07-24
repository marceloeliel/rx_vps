#!/bin/bash

# Script de instalação automática do RX Veículos em VPS Ubuntu usando Docker
# Execute como root ou com sudo: bash install-docker.sh

set -e

# 1. Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker
if ! command -v docker &> /dev/null; then
  echo "Instalando Docker..."
  curl -fsSL https://get.docker.com | bash
else
  echo "Docker já está instalado."
fi

# 3. Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
  echo "Instalando Docker Compose..."
  sudo apt install -y docker-compose
else
  echo "Docker Compose já está instalado."
fi

# 4. Clonar o repositório (se não existir)
if [ ! -d "rx-git" ]; then
  echo "Clonando repositório..."
  git clone https://github.com/SEU_USUARIO/rx-git.git
  cd rx-git
else
  echo "Repositório já existe. Atualizando..."
  cd rx-git
  git pull
fi

# 5. Copiar arquivo de ambiente de exemplo, se existir
if [ -f "env-production-example.txt" ] && [ ! -f ".env.production" ]; then
  cp env-production-example.txt .env.production
  echo "Arquivo .env.production criado. Edite com suas credenciais antes de subir o sistema."
fi

# 6. Subir o sistema com Docker Compose
sudo docker-compose up -d --build

echo "\nInstalação concluída!\n"
echo "Acesse o sistema pelo endereço configurado no seu .env.production." 