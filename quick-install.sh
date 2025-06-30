#!/bin/bash

# 🚗 RX Veículos - Instalação Super Rápida
# Execute: curl -fsSL https://raw.githubusercontent.com/marceloeliel/rx-git/master/quick-install.sh | bash

set -e

# Cores
G='\033[0;32m'  # Verde
B='\033[0;34m'  # Azul
Y='\033[1;33m'  # Amarelo
R='\033[0;31m'  # Vermelho
NC='\033[0m'    # Sem cor

echo -e "${B}🚗 RX VEÍCULOS - INSTALAÇÃO AUTOMÁTICA${NC}"
echo -e "${B}===========================================${NC}"

# Verificar Node.js
echo -e "${B}[1/6]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${R}❌ Node.js não encontrado!${NC}"
    echo -e "${Y}Instale Node.js 18+ em: https://nodejs.org${NC}"
    exit 1
fi
echo -e "${G}✅ Node.js $(node --version) encontrado${NC}"

# Verificar Git
echo -e "${B}[2/6]${NC} Verificando Git..."
if ! command -v git &> /dev/null; then
    echo -e "${R}❌ Git não encontrado!${NC}"
    echo -e "${Y}Instale Git em: https://git-scm.com${NC}"
    exit 1
fi
echo -e "${G}✅ Git encontrado${NC}"

# Instalar pnpm
echo -e "${B}[3/6]${NC} Instalando pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    echo -e "${G}✅ pnpm instalado${NC}"
else
    echo -e "${G}✅ pnpm já instalado${NC}"
fi

# Clonar repositório
echo -e "${B}[4/6]${NC} Clonando repositório..."
if [ -d "rx-git" ]; then
    echo -e "${Y}⚠️ Removendo pasta existente...${NC}"
    rm -rf rx-git
fi
git clone https://github.com/marceloeliel/rx-git.git
cd rx-git
echo -e "${G}✅ Repositório clonado${NC}"

# Instalar dependências
echo -e "${B}[5/6]${NC} Instalando dependências..."
pnpm install
echo -e "${G}✅ Dependências instaladas${NC}"

# Configurar ambiente
echo -e "${B}[6/6]${NC} Configurando ambiente..."
cp env-production-example.txt .env.local
echo -e "${G}✅ Arquivo .env.local criado${NC}"

# Sucesso
echo ""
echo -e "${G}🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${G}===========================================${NC}"
echo -e "${Y}📋 PRÓXIMOS PASSOS:${NC}"
echo -e "1. ${B}Configure suas credenciais:${NC}"
echo -e "   ${Y}nano .env.local${NC}"
echo -e ""
echo -e "2. ${B}Execute em desenvolvimento:${NC}"
echo -e "   ${Y}pnpm dev${NC}"
echo -e ""
echo -e "3. ${B}Acesse no navegador:${NC}"
echo -e "   ${Y}http://localhost:3000${NC}"
echo -e ""
echo -e "${G}===========================================${NC}"
echo -e "${B}📖 Documentação:${NC} README.md"
echo -e "${B}🐛 Problemas:${NC} INSTALL.md"
echo -e "${B}🚀 Deploy:${NC} DEPLOY-COMPLETO.md" 