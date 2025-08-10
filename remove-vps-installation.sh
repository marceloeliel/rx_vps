#!/bin/bash

# 🗑️ Script para Remover Instalação Atual do RX Veículos na VPS
# Execute este script na VPS para limpar a instalação atual

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🗑️ REMOVENDO INSTALAÇÃO ATUAL DO RX VEÍCULOS${NC}"
echo "================================================"

# 1. Parar e remover aplicação PM2
echo -e "${YELLOW}1. Parando aplicação PM2...${NC}"
if pm2 list | grep -q "rx-veiculos"; then
    pm2 stop rx-veiculos || true
    pm2 delete rx-veiculos || true
    echo -e "${GREEN}✅ Aplicação PM2 removida${NC}"
else
    echo -e "${BLUE}ℹ️ Nenhuma aplicação PM2 encontrada${NC}"
fi

# 2. Parar serviço systemd (se existir)
echo -e "${YELLOW}2. Parando serviço systemd...${NC}"
if systemctl is-active --quiet rx-veiculos 2>/dev/null; then
    sudo systemctl stop rx-veiculos
    sudo systemctl disable rx-veiculos
    sudo rm -f /etc/systemd/system/rx-veiculos.service
    sudo systemctl daemon-reload
    echo -e "${GREEN}✅ Serviço systemd removido${NC}"
else
    echo -e "${BLUE}ℹ️ Nenhum serviço systemd encontrado${NC}"
fi

# 3. Remover configuração Nginx
echo -e "${YELLOW}3. Removendo configuração Nginx...${NC}"
if [ -f "/etc/nginx/sites-available/rx-veiculos" ]; then
    sudo rm -f /etc/nginx/sites-available/rx-veiculos
    sudo rm -f /etc/nginx/sites-enabled/rx-veiculos
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Configuração Nginx removida${NC}"
else
    echo -e "${BLUE}ℹ️ Nenhuma configuração Nginx encontrada${NC}"
fi

# 4. Remover diretório da aplicação
echo -e "${YELLOW}4. Removendo diretório da aplicação...${NC}"
if [ -d "/var/www/rx-veiculos" ]; then
    sudo rm -rf /var/www/rx-veiculos
    echo -e "${GREEN}✅ Diretório da aplicação removido${NC}"
else
    echo -e "${BLUE}ℹ️ Diretório da aplicação não encontrado${NC}"
fi

# 5. Remover usuário da aplicação (opcional)
echo -e "${YELLOW}5. Removendo usuário da aplicação...${NC}"
if id "rxveiculos" &>/dev/null; then
    read -p "Deseja remover o usuário 'rxveiculos'? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo userdel -r rxveiculos 2>/dev/null || true
        echo -e "${GREEN}✅ Usuário removido${NC}"
    else
        echo -e "${BLUE}ℹ️ Usuário mantido${NC}"
    fi
else
    echo -e "${BLUE}ℹ️ Usuário 'rxveiculos' não encontrado${NC}"
fi

# 6. Limpar processos Node.js órfãos
echo -e "${YELLOW}6. Limpando processos Node.js órfãos...${NC}"
pkill -f "node.*rx-veiculos" 2>/dev/null || true
pkill -f "next.*start" 2>/dev/null || true
echo -e "${GREEN}✅ Processos limpos${NC}"

# 7. Verificar portas em uso
echo -e "${YELLOW}7. Verificando portas em uso...${NC}"
if netstat -tlnp | grep -q ":3000"; then
    echo -e "${RED}⚠️ Porta 3000 ainda em uso:${NC}"
    netstat -tlnp | grep ":3000"
    echo -e "${YELLOW}Execute: sudo fuser -k 3000/tcp${NC}"
else
    echo -e "${GREEN}✅ Porta 3000 livre${NC}"
fi

echo
echo -e "${GREEN}🎉 LIMPEZA CONCLUÍDA!${NC}"
echo "================================================"
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Instalar Docker e Docker Compose"
echo "2. Configurar Portainer (opcional)"
echo "3. Fazer deploy com Docker"
echo
echo -e "${YELLOW}💡 Para instalar Docker:${NC}"
echo "curl -fsSL https://get.docker.com | sh"
echo "sudo usermod -aG docker \$USER"
echo
echo -e "${YELLOW}💡 Para instalar Docker Compose:${NC}"
echo "sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
echo "sudo chmod +x /usr/local/bin/docker-compose"
echo
echo -e "${YELLOW}💡 Para instalar Portainer:${NC}"
echo "docker volume create portainer_data"
echo "docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest"