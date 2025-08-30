#!/bin/bash

# Script para atualização automática do PROJETO.md
# Uso: ./auto-update-projeto.sh "descrição" [tipo]

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA DO PROJETO.md${NC}"
echo "=================================================="

# Verificar se a descrição foi fornecida
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Descrição da mudança é obrigatória${NC}"
    echo -e "${YELLOW}📋 Uso: ./auto-update-projeto.sh \"descrição\" [tipo]${NC}"
    echo -e "${YELLOW}📋 Tipos: feature, bugfix, improvement, wip${NC}"
    exit 1
fi

DESCRIPTION="$1"
TYPE="${2:-feature}"

echo -e "${BLUE}📝 Descrição:${NC} $DESCRIPTION"
echo -e "${BLUE}🏷️ Tipo:${NC} $TYPE"
echo ""

# Executar o script Node.js
echo -e "${YELLOW}🔄 Atualizando PROJETO.md...${NC}"
node update-projeto-md.js "$DESCRIPTION" "$TYPE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ PROJETO.md atualizado com sucesso!${NC}"
    
    # Opcional: Fazer commit automático se estiver em um repositório Git
    if [ -d ".git" ]; then
        echo -e "${YELLOW}📦 Fazendo commit automático...${NC}"
        git add PROJETO.md
        git commit -m "docs: $DESCRIPTION"
        echo -e "${GREEN}✅ Commit realizado!${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Status do Projeto Atualizado:${NC}"
    echo -e "${GREEN}• Documentação: Sincronizada${NC}"
    echo -e "${GREEN}• Versão: Incrementada${NC}"
    echo -e "${GREEN}• Log: Atualizado${NC}"
else
    echo -e "${RED}❌ Erro ao atualizar PROJETO.md${NC}"
    exit 1
fi





