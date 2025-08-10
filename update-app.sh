#!/bin/bash

# 🔄 Script de Atualização - RX Veículos
# Atualiza a aplicação na VPS de forma segura

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configurações
APP_DIR="/opt/rx-veiculos"
SERVICE_NAME="rx-veiculos"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Iniciando atualização da aplicação RX Veículos..."
echo "📅 Data: $(date)"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    log_error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# Verificar se o diretório existe
if [ ! -d "$APP_DIR" ]; then
    log_error "Diretório da aplicação não encontrado: $APP_DIR"
    exit 1
fi

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Fazer backup antes da atualização
log_info "Criando backup da versão atual..."
tar -czf $BACKUP_DIR/rx-veiculos_backup_$DATE.tar.gz -C /opt rx-veiculos
log_success "Backup criado: $BACKUP_DIR/rx-veiculos_backup_$DATE.tar.gz"

# Verificar status do serviço
log_info "Verificando status do serviço..."
if systemctl is-active --quiet $SERVICE_NAME; then
    SERVICE_WAS_RUNNING=true
    log_info "Serviço está rodando, será reiniciado após a atualização"
else
    SERVICE_WAS_RUNNING=false
    log_warning "Serviço não está rodando"
fi

# Parar o serviço temporariamente
if [ "$SERVICE_WAS_RUNNING" = true ]; then
    log_info "Parando serviço temporariamente..."
    systemctl stop $SERVICE_NAME
    sleep 2
fi

# Navegar para o diretório da aplicação
cd $APP_DIR

# Verificar se há mudanças locais
log_info "Verificando mudanças locais..."
if ! sudo -u rxapp git diff --quiet; then
    log_warning "Há mudanças locais não commitadas. Fazendo stash..."
    sudo -u rxapp git stash push -m "Auto-stash antes da atualização $DATE"
fi

# Fazer pull das últimas mudanças
log_info "Baixando últimas atualizações do repositório..."
sudo -u rxapp git fetch origin
sudo -u rxapp git pull origin main

# Verificar se houve mudanças
if [ $? -eq 0 ]; then
    log_success "Código atualizado com sucesso"
else
    log_error "Erro ao atualizar código"
    # Restaurar serviço se estava rodando
    if [ "$SERVICE_WAS_RUNNING" = true ]; then
        systemctl start $SERVICE_NAME
    fi
    exit 1
fi

# Instalar/atualizar dependências
log_info "Instalando/atualizando dependências..."
sudo -u rxapp pnpm install

if [ $? -eq 0 ]; then
    log_success "Dependências atualizadas"
else
    log_error "Erro ao instalar dependências"
    exit 1
fi

# Fazer build da aplicação
log_info "Fazendo build da aplicação..."
sudo -u rxapp pnpm build

if [ $? -eq 0 ]; then
    log_success "Build concluído com sucesso"
else
    log_error "Erro no build da aplicação"
    exit 1
fi

# Verificar se o arquivo .env.production existe
if [ ! -f "$APP_DIR/.env.production" ]; then
    log_warning "Arquivo .env.production não encontrado!"
    log_info "Criando arquivo de exemplo..."
    sudo -u rxapp cp .env.example .env.production
    log_warning "⚠️  Configure as variáveis em $APP_DIR/.env.production"
fi

# Reiniciar o serviço
if [ "$SERVICE_WAS_RUNNING" = true ]; then
    log_info "Reiniciando serviço..."
    systemctl start $SERVICE_NAME
    sleep 3
    
    # Verificar se o serviço iniciou corretamente
    if systemctl is-active --quiet $SERVICE_NAME; then
        log_success "Serviço reiniciado com sucesso"
    else
        log_error "Erro ao reiniciar serviço"
        log_info "Verificando logs..."
        journalctl -u $SERVICE_NAME -n 20 --no-pager
        exit 1
    fi
else
    log_info "Serviço não estava rodando, não foi iniciado"
fi

# Verificar se a aplicação está respondendo
log_info "Verificando se a aplicação está respondendo..."
sleep 5

if curl -f -s http://localhost:3000 > /dev/null; then
    log_success "✅ Aplicação está respondendo corretamente"
else
    log_warning "⚠️  Aplicação pode não estar respondendo na porta 3000"
fi

# Limpar backups antigos (manter últimos 5)
log_info "Limpando backups antigos..."
find $BACKUP_DIR -name "rx-veiculos_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs -r rm

# Recarregar Nginx (caso tenha mudanças de configuração)
log_info "Recarregando Nginx..."
nginx -t && systemctl reload nginx

echo ""
log_success "🎉 Atualização concluída com sucesso!"
echo ""
echo "📊 Status dos serviços:"
systemctl status $SERVICE_NAME --no-pager -l
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: sudo journalctl -u $SERVICE_NAME -f"
echo "   Status: sudo systemctl status $SERVICE_NAME"
echo "   Restart: sudo systemctl restart $SERVICE_NAME"
echo ""
echo "💾 Backup criado em: $BACKUP_DIR/rx-veiculos_backup_$DATE.tar.gz"
echo ""
log_success "✅ Aplicação atualizada e rodando!"