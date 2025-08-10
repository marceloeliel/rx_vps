#!/bin/bash

# 🐳 Script para Instalar Docker e Configurar Ambiente de Produção
# Execute este script na VPS após remover a instalação anterior

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 INSTALANDO DOCKER E CONFIGURANDO PRODUÇÃO${NC}"
echo "================================================"

# 1. Atualizar sistema
echo -e "${YELLOW}1. Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✅ Sistema atualizado${NC}"

# 2. Instalar dependências
echo -e "${YELLOW}2. Instalando dependências...${NC}"
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    htop \
    nano
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 3. Instalar Docker
echo -e "${YELLOW}3. Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker instalado${NC}"
else
    echo -e "${BLUE}ℹ️ Docker já está instalado${NC}"
fi

# 4. Instalar Docker Compose
echo -e "${YELLOW}4. Instalando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose instalado${NC}"
else
    echo -e "${BLUE}ℹ️ Docker Compose já está instalado${NC}"
fi

# 5. Configurar firewall
echo -e "${YELLOW}5. Configurando firewall...${NC}"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 9443/tcp  # Portainer HTTPS
echo -e "${GREEN}✅ Firewall configurado${NC}"

# 6. Instalar Portainer (opcional)
echo -e "${YELLOW}6. Instalando Portainer...${NC}"
read -p "Deseja instalar Portainer para gerenciar containers? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${BLUE}ℹ️ Portainer não instalado${NC}"
else
    docker volume create portainer_data
    docker run -d \
        -p 8000:8000 \
        -p 9443:9443 \
        --name portainer \
        --restart=always \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        portainer/portainer-ce:latest
    echo -e "${GREEN}✅ Portainer instalado${NC}"
    echo -e "${BLUE}🌐 Acesse: https://SEU_IP:9443${NC}"
fi

# 7. Criar diretório para aplicação
echo -e "${YELLOW}7. Criando diretório para aplicação...${NC}"
sudo mkdir -p /opt/rx-veiculos
sudo chown $USER:$USER /opt/rx-veiculos
cd /opt/rx-veiculos
echo -e "${GREEN}✅ Diretório criado: /opt/rx-veiculos${NC}"

# 8. Clonar repositório
echo -e "${YELLOW}8. Clonando repositório...${NC}"
if [ ! -d ".git" ]; then
    git clone https://github.com/marceloeliel/rx-git.git .
    echo -e "${GREEN}✅ Repositório clonado${NC}"
else
    git pull origin main
    echo -e "${GREEN}✅ Repositório atualizado${NC}"
fi

# 9. Criar arquivo de ambiente
echo -e "${YELLOW}9. Criando arquivo de ambiente...${NC}"
if [ ! -f ".env.production" ]; then
    cat > .env.production << 'EOF'
# 🚗 RX Veículos - Configuração de Produção
# Configure as variáveis abaixo com seus valores reais

# Essenciais
NODE_ENV=production
PORT=3000

# NextAuth
NEXTAUTH_SECRET=GERE_UMA_CHAVE_SECRETA_AQUI
NEXTAUTH_URL=https://seudominio.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Database
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# PostgreSQL
POSTGRES_HOST=seu-host.supabase.com
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres.seu-projeto
POSTGRES_PASSWORD=sua_senha_aqui
POSTGRES_POOL_MODE=transaction

# URLs da aplicação
NEXT_PUBLIC_APP_URL=https://seudominio.com
WEBSITE_URL=https://seudominio.com

# FIPE API
NEXT_PUBLIC_FIPE_API_TOKEN=seu_token_fipe_aqui

# Admin
ADMIN_EMAIL=admin@seudominio.com

# Webhook (opcional)
WEBHOOK_URL=https://seudominio.com/api/webhook
EOF
    echo -e "${GREEN}✅ Arquivo .env.production criado${NC}"
    echo -e "${RED}⚠️ IMPORTANTE: Edite o arquivo .env.production com suas configurações reais!${NC}"
else
    echo -e "${BLUE}ℹ️ Arquivo .env.production já existe${NC}"
fi

# 10. Verificar versões instaladas
echo -e "${YELLOW}10. Verificando instalação...${NC}"
echo -e "${BLUE}Docker version:${NC}"
docker --version
echo -e "${BLUE}Docker Compose version:${NC}"
docker-compose --version
echo -e "${BLUE}Git version:${NC}"
git --version

echo
echo -e "${GREEN}🎉 INSTALAÇÃO CONCLUÍDA!${NC}"
echo "================================================"
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Editar o arquivo .env.production com suas configurações"
echo "2. Configurar seu domínio/DNS"
echo "3. Fazer deploy da aplicação"
echo
echo -e "${YELLOW}📁 Localização dos arquivos:${NC}"
echo "   Aplicação: /opt/rx-veiculos"
echo "   Configuração: /opt/rx-veiculos/.env.production"
echo
echo -e "${YELLOW}🚀 Para fazer deploy:${NC}"
echo "   cd /opt/rx-veiculos"
echo "   nano .env.production  # Editar configurações"
echo "   docker-compose up -d  # Iniciar aplicação"
echo
if docker ps | grep -q portainer; then
    echo -e "${YELLOW}🌐 Portainer:${NC}"
    echo "   Acesse: https://$(curl -s ifconfig.me):9443"
    echo "   Configure sua senha no primeiro acesso"
fi
echo
echo -e "${RED}⚠️ IMPORTANTE:${NC}"
echo "   - Configure o .env.production antes de fazer deploy"
echo "   - Configure seu domínio/DNS para apontar para este servidor"
echo "   - Para HTTPS, configure um proxy reverso (Nginx/Traefik)"