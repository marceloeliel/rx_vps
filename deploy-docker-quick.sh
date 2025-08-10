#!/bin/bash

# 🚀 Deploy Rápido RX Veículos com Docker
# Script completo para migração e deploy em produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "██████╗ ██╗  ██╗    ██╗   ██╗███████╗██╗ ██████╗██╗   ██╗██╗      ██████╗ ███████╗"
echo "██╔══██╗╚██╗██╔╝    ██║   ██║██╔════╝██║██╔════╝██║   ██║██║     ██╔═══██╗██╔════╝"
echo "██████╔╝ ╚███╔╝     ██║   ██║█████╗  ██║██║     ██║   ██║██║     ██║   ██║███████╗"
echo "██╔══██╗ ██╔██╗     ╚██╗ ██╔╝██╔══╝  ██║██║     ██║   ██║██║     ██║   ██║╚════██║"
echo "██║  ██║██╔╝ ██╗     ╚████╔╝ ███████╗██║╚██████╗╚██████╔╝███████╗╚██████╔╝███████║"
echo "╚═╝  ╚═╝╚═╝  ╚═╝      ╚═══╝  ╚══════╝╚═╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝"
echo -e "${NC}"
echo -e "${CYAN}🐳 Deploy Rápido com Docker - Produção${NC}"
echo "================================================"

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ Este script não deve ser executado como root!${NC}"
   echo "Execute como usuário normal (o script pedirá sudo quando necessário)"
   exit 1
fi

# Função para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 encontrado${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 não encontrado${NC}"
        return 1
    fi
}

# Função para aguardar confirmação
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# 1. VERIFICAÇÕES INICIAIS
echo -e "${YELLOW}🔍 1. Verificações iniciais...${NC}"

# Verificar sistema operacional
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}❌ Este script é para Linux apenas${NC}"
    exit 1
fi

# Verificar distribuição
if ! command -v apt &> /dev/null; then
    echo -e "${RED}❌ Este script é para distribuições baseadas em Debian/Ubuntu${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Sistema compatível${NC}"

# 2. LIMPEZA DA INSTALAÇÃO ANTERIOR
echo -e "${YELLOW}🗑️ 2. Removendo instalação anterior...${NC}"

if confirm "Deseja remover a instalação anterior do RX Veículos?"; then
    # Parar PM2
    if command -v pm2 &> /dev/null; then
        pm2 stop rx-veiculos 2>/dev/null || true
        pm2 delete rx-veiculos 2>/dev/null || true
        echo -e "${GREEN}✅ PM2 limpo${NC}"
    fi
    
    # Parar systemd
    if systemctl is-active --quiet rx-veiculos 2>/dev/null; then
        sudo systemctl stop rx-veiculos
        sudo systemctl disable rx-veiculos
        sudo rm -f /etc/systemd/system/rx-veiculos.service
        sudo systemctl daemon-reload
        echo -e "${GREEN}✅ Systemd limpo${NC}"
    fi
    
    # Remover Nginx config
    if [ -f "/etc/nginx/sites-available/rx-veiculos" ]; then
        sudo rm -f /etc/nginx/sites-available/rx-veiculos
        sudo rm -f /etc/nginx/sites-enabled/rx-veiculos
        sudo nginx -t && sudo systemctl reload nginx 2>/dev/null || true
        echo -e "${GREEN}✅ Nginx limpo${NC}"
    fi
    
    # Remover diretório antigo
    if [ -d "/var/www/rx-veiculos" ]; then
        sudo rm -rf /var/www/rx-veiculos
        echo -e "${GREEN}✅ Diretório antigo removido${NC}"
    fi
    
    # Limpar processos
    pkill -f "node.*rx-veiculos" 2>/dev/null || true
    pkill -f "next.*start" 2>/dev/null || true
    echo -e "${GREEN}✅ Processos limpos${NC}"
else
    echo -e "${BLUE}ℹ️ Pulando limpeza${NC}"
fi

# 3. ATUALIZAR SISTEMA
echo -e "${YELLOW}📦 3. Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✅ Sistema atualizado${NC}"

# 4. INSTALAR DEPENDÊNCIAS
echo -e "${YELLOW}🔧 4. Instalando dependências...${NC}"
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    htop \
    nano \
    wget \
    unzip
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 5. INSTALAR DOCKER
echo -e "${YELLOW}🐳 5. Instalando Docker...${NC}"
if ! check_command docker; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker instalado${NC}"
    echo -e "${YELLOW}⚠️ Você precisará fazer logout/login para usar Docker sem sudo${NC}"
else
    echo -e "${BLUE}ℹ️ Docker já instalado${NC}"
fi

# 6. INSTALAR DOCKER COMPOSE
echo -e "${YELLOW}🔧 6. Instalando Docker Compose...${NC}"
if ! check_command docker-compose; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose instalado${NC}"
else
    echo -e "${BLUE}ℹ️ Docker Compose já instalado${NC}"
fi

# 7. CONFIGURAR FIREWALL
echo -e "${YELLOW}🔥 7. Configurando firewall...${NC}"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 9443/tcp  # Portainer
echo -e "${GREEN}✅ Firewall configurado${NC}"

# 8. INSTALAR PORTAINER
echo -e "${YELLOW}📊 8. Instalando Portainer...${NC}"
if confirm "Deseja instalar Portainer para gerenciar containers?"; then
    if ! docker ps | grep -q portainer; then
        docker volume create portainer_data 2>/dev/null || true
        docker run -d \
            -p 8000:8000 \
            -p 9443:9443 \
            --name portainer \
            --restart=always \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v portainer_data:/data \
            portainer/portainer-ce:latest
        echo -e "${GREEN}✅ Portainer instalado${NC}"
        echo -e "${CYAN}🌐 Acesse: https://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU_IP'):9443${NC}"
    else
        echo -e "${BLUE}ℹ️ Portainer já está rodando${NC}"
    fi
else
    echo -e "${BLUE}ℹ️ Portainer não instalado${NC}"
fi

# 9. PREPARAR DIRETÓRIO
echo -e "${YELLOW}📁 9. Preparando diretório da aplicação...${NC}"
sudo mkdir -p /opt/rx-veiculos
sudo chown $USER:$USER /opt/rx-veiculos
cd /opt/rx-veiculos
echo -e "${GREEN}✅ Diretório preparado: /opt/rx-veiculos${NC}"

# 10. CLONAR/ATUALIZAR REPOSITÓRIO
echo -e "${YELLOW}📥 10. Obtendo código fonte...${NC}"
if [ ! -d ".git" ]; then
    git clone https://github.com/marceloeliel/rx-git.git .
    echo -e "${GREEN}✅ Repositório clonado${NC}"
else
    git pull origin main
    echo -e "${GREEN}✅ Repositório atualizado${NC}"
fi

# 11. CONFIGURAR AMBIENTE
echo -e "${YELLOW}⚙️ 11. Configurando ambiente...${NC}"
if [ ! -f ".env.production" ]; then
    # Gerar chave secreta
    SECRET=$(openssl rand -base64 32)
    
    cat > .env.production << EOF
# 🚗 RX Veículos - Configuração de Produção
# Gerado automaticamente em $(date)

# Essenciais
NODE_ENV=production
PORT=3000

# NextAuth
NEXTAUTH_SECRET=$SECRET
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
else
    echo -e "${BLUE}ℹ️ Arquivo .env.production já existe${NC}"
fi

# 12. VERIFICAR CONFIGURAÇÃO
echo -e "${YELLOW}🔍 12. Verificando configuração...${NC}"
echo -e "${BLUE}Docker version:${NC}"
docker --version
echo -e "${BLUE}Docker Compose version:${NC}"
docker-compose --version
echo -e "${BLUE}Git version:${NC}"
git --version

# 13. OPÇÕES DE DEPLOY
echo -e "${YELLOW}🚀 13. Opções de deploy...${NC}"
echo "Escolha uma opção de deploy:"
echo "1) Deploy simples (Docker Compose)"
echo "2) Deploy com Traefik (HTTPS automático)"
echo "3) Apenas preparar (configurar manualmente depois)"
read -p "Opção (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        echo -e "${YELLOW}🚀 Iniciando deploy simples...${NC}"
        if confirm "Deseja editar o .env.production antes do deploy?"; then
            nano .env.production
        fi
        docker-compose up -d
        echo -e "${GREEN}✅ Deploy concluído!${NC}"
        echo -e "${CYAN}🌐 Aplicação rodando em: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU_IP'):3000${NC}"
        ;;
    2)
        echo -e "${YELLOW}🚀 Iniciando deploy com Traefik...${NC}"
        if confirm "Deseja editar o .env.production antes do deploy?"; then
            nano .env.production
        fi
        if [ -f "docker-compose-traefik.yml" ]; then
            docker-compose -f docker-compose-traefik.yml up -d
            echo -e "${GREEN}✅ Deploy com Traefik concluído!${NC}"
            echo -e "${CYAN}🌐 Configure seu DNS para apontar para este servidor${NC}"
        else
            echo -e "${RED}❌ Arquivo docker-compose-traefik.yml não encontrado${NC}"
            echo -e "${YELLOW}Usando deploy simples...${NC}"
            docker-compose up -d
        fi
        ;;
    3)
        echo -e "${BLUE}ℹ️ Preparação concluída${NC}"
        echo -e "${YELLOW}Para fazer deploy manualmente:${NC}"
        echo "   cd /opt/rx-veiculos"
        echo "   nano .env.production"
        echo "   docker-compose up -d"
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

# 14. INFORMAÇÕES FINAIS
echo
echo -e "${GREEN}🎉 INSTALAÇÃO CONCLUÍDA!${NC}"
echo "================================================"
echo -e "${BLUE}📋 Informações importantes:${NC}"
echo -e "   📁 Localização: /opt/rx-veiculos"
echo -e "   ⚙️ Configuração: /opt/rx-veiculos/.env.production"
echo -e "   🐳 Containers: docker-compose ps"
echo -e "   📊 Logs: docker-compose logs -f"
echo
if docker ps | grep -q portainer; then
    echo -e "${CYAN}🌐 Portainer: https://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU_IP'):9443${NC}"
fi
echo
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Editar .env.production com suas configurações reais"
echo "2. Configurar DNS do seu domínio"
echo "3. Configurar proxy reverso para HTTPS (se necessário)"
echo "4. Testar a aplicação"
echo
echo -e "${RED}⚠️ IMPORTANTE:${NC}"
echo "   - Configure o .env.production antes de usar em produção"
echo "   - Configure SSL/HTTPS para produção"
echo "   - Faça backup regular dos dados"
echo
echo -e "${GREEN}✨ Boa sorte com seu deploy!${NC}"