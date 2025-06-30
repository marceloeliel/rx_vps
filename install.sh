#!/bin/bash

# 🚗 RX Veículos - Script de Instalação Completa
# Automatiza toda a instalação do projeto RX Veículos

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_step() { echo -e "${BLUE}[PASSO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCESSO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[AVISO]${NC} $1"; }
print_error() { echo -e "${RED}[ERRO]${NC} $1"; }
print_info() { echo -e "${CYAN}[INFO]${NC} $1"; }

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    🚗 RX VEÍCULOS                             ║"
echo "║            Script de Instalação Automática                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detectar OS
print_step "Detectando sistema operacional..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/debian_version ]; then
        OS="debian"
        print_info "Sistema: Ubuntu/Debian detectado"
    elif [ -f /etc/redhat-release ]; then
        OS="redhat"
        print_info "Sistema: CentOS/RHEL detectado"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    print_info "Sistema: macOS detectado"
fi

# Instalar Node.js
install_nodejs() {
    print_step "Verificando Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js $NODE_VERSION já instalado"
            return
        fi
    fi
    
    print_step "Instalando Node.js 20 LTS..."
    if [[ "$OS" == "debian" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OS" == "redhat" ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
    elif [[ "$OS" == "macos" ]]; then
        brew install node@20
    fi
    print_success "Node.js instalado!"
}

# Instalar pnpm
install_pnpm() {
    print_step "Verificando pnpm..."
    if command -v pnpm &> /dev/null; then
        print_success "pnpm já instalado"
        return
    fi
    print_step "Instalando pnpm..."
    npm install -g pnpm
    print_success "pnpm instalado!"
}

# Clonar repositório
clone_repository() {
    print_step "Clonando repositório RX Veículos..."
    if [ -d "rx-git" ]; then
        print_warning "Removendo diretório existente..."
        rm -rf rx-git
    fi
    git clone https://github.com/marceloeliel/rx-git.git
    cd rx-git
    print_success "Repositório clonado!"
}

# Instalar dependências
install_dependencies() {
    print_step "Instalando dependências..."
    pnpm install
    print_success "Dependências instaladas!"
}

# Configurar ambiente
setup_environment() {
    print_step "Configurando arquivo de ambiente..."
    cp env-production-example.txt .env.local
    print_warning "Configure o arquivo .env.local com suas credenciais!"
}

# Função principal
main() {
    install_nodejs
    install_pnpm
    clone_repository
    install_dependencies
    setup_environment
    
    echo ""
    print_success "=========================================="
    print_success "  INSTALAÇÃO CONCLUÍDA!"
    print_success "=========================================="
    print_info "Próximos passos:"
    print_info "1. Configure .env.local"
    print_info "2. Execute: pnpm dev"
    print_info "3. Acesse: http://localhost:3000"
    print_success "=========================================="
}

main "$@" 