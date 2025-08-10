#!/bin/bash

# 📊 Script de Monitoramento - RX Veículos
# Monitora a saúde da aplicação e envia alertas

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_URL="http://localhost:3000"
SERVICE_NAME="rx-veiculos"
LOG_FILE="/var/log/rx-veiculos-monitor.log"
ALERT_EMAIL="admin@seudominio.com"  # Configure seu email
MAX_RESPONSE_TIME=5  # segundos
CHECK_INTERVAL=60    # segundos

# Função para log com timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log_info() {
    log_with_timestamp "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log_with_timestamp "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    log_with_timestamp "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    log_with_timestamp "${RED}[ERROR]${NC} $1"
}

# Função para enviar email de alerta (requer mailutils)
send_alert() {
    local subject="$1"
    local message="$2"
    
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "[RX-Veículos] $subject" $ALERT_EMAIL
        log_info "Alerta enviado por email: $subject"
    else
        log_warning "Sistema de email não configurado (instale mailutils)"
    fi
}

# Função para verificar se o serviço está rodando
check_service_status() {
    if systemctl is-active --quiet $SERVICE_NAME; then
        return 0
    else
        return 1
    fi
}

# Função para verificar resposta HTTP
check_http_response() {
    local start_time=$(date +%s.%N)
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $MAX_RESPONSE_TIME $APP_URL)
    local end_time=$(date +%s.%N)
    local response_time=$(echo "$end_time - $start_time" | bc)
    
    if [ "$http_code" = "200" ]; then
        log_success "HTTP OK (${http_code}) - Tempo: ${response_time}s"
        return 0
    else
        log_error "HTTP Error (${http_code}) - Tempo: ${response_time}s"
        return 1
    fi
}

# Função para verificar uso de memória
check_memory_usage() {
    local pid=$(pgrep -f "node.*rx-veiculos" | head -1)
    
    if [ -n "$pid" ]; then
        local memory_mb=$(ps -p $pid -o rss= | awk '{print $1/1024}')
        local memory_percent=$(ps -p $pid -o %mem= | tr -d ' ')
        
        log_info "Uso de memória: ${memory_mb}MB (${memory_percent}%)"
        
        # Alerta se usar mais de 80% da memória
        if (( $(echo "$memory_percent > 80" | bc -l) )); then
            log_warning "Alto uso de memória: ${memory_percent}%"
            send_alert "Alto uso de memória" "A aplicação está usando ${memory_percent}% da memória (${memory_mb}MB)"
        fi
    else
        log_error "Processo da aplicação não encontrado"
        return 1
    fi
}

# Função para verificar uso de CPU
check_cpu_usage() {
    local pid=$(pgrep -f "node.*rx-veiculos" | head -1)
    
    if [ -n "$pid" ]; then
        local cpu_percent=$(ps -p $pid -o %cpu= | tr -d ' ')
        log_info "Uso de CPU: ${cpu_percent}%"
        
        # Alerta se usar mais de 90% da CPU por mais de 1 minuto
        if (( $(echo "$cpu_percent > 90" | bc -l) )); then
            log_warning "Alto uso de CPU: ${cpu_percent}%"
        fi
    fi
}

# Função para verificar espaço em disco
check_disk_space() {
    local disk_usage=$(df /opt | tail -1 | awk '{print $5}' | sed 's/%//')
    log_info "Uso de disco: ${disk_usage}%"
    
    if [ "$disk_usage" -gt 85 ]; then
        log_warning "Pouco espaço em disco: ${disk_usage}%"
        send_alert "Pouco espaço em disco" "O disco está ${disk_usage}% cheio"
    fi
}

# Função para verificar logs de erro
check_error_logs() {
    local error_count=$(journalctl -u $SERVICE_NAME --since "1 minute ago" | grep -i error | wc -l)
    
    if [ "$error_count" -gt 0 ]; then
        log_warning "$error_count erros encontrados nos logs do último minuto"
        
        if [ "$error_count" -gt 10 ]; then
            send_alert "Muitos erros na aplicação" "$error_count erros encontrados no último minuto"
        fi
    fi
}

# Função para verificar conectividade de rede
check_network() {
    if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        log_success "Conectividade de rede OK"
    else
        log_error "Problema de conectividade de rede"
        send_alert "Problema de rede" "Servidor sem conectividade com a internet"
    fi
}

# Função para gerar relatório de status
generate_status_report() {
    echo "📊 RELATÓRIO DE STATUS - $(date)"
    echo "================================="
    echo ""
    
    # Status do serviço
    if check_service_status; then
        echo "✅ Serviço: RODANDO"
    else
        echo "❌ Serviço: PARADO"
    fi
    
    # Status HTTP
    if check_http_response >/dev/null 2>&1; then
        echo "✅ HTTP: OK"
    else
        echo "❌ HTTP: ERRO"
    fi
    
    # Uptime do sistema
    echo "⏱️  Uptime: $(uptime -p)"
    
    # Load average
    echo "📈 Load: $(uptime | awk -F'load average:' '{print $2}')"
    
    # Memória total do sistema
    echo "💾 Memória: $(free -h | grep Mem | awk '{print $3"/"$2}')"
    
    # Espaço em disco
    echo "💿 Disco: $(df -h /opt | tail -1 | awk '{print $3"/"$2" ("$5" usado)"}')"
    
    echo ""
    echo "📋 Últimos logs da aplicação:"
    journalctl -u $SERVICE_NAME -n 5 --no-pager
}

# Função principal de monitoramento
run_monitoring() {
    log_info "🔍 Iniciando verificação de saúde..."
    
    local issues=0
    
    # Verificar serviço
    if ! check_service_status; then
        log_error "Serviço $SERVICE_NAME não está rodando"
        send_alert "Serviço parado" "O serviço $SERVICE_NAME parou de funcionar"
        ((issues++))
        
        # Tentar reiniciar o serviço
        log_info "Tentando reiniciar o serviço..."
        systemctl restart $SERVICE_NAME
        sleep 10
        
        if check_service_status; then
            log_success "Serviço reiniciado com sucesso"
            send_alert "Serviço reiniciado" "O serviço $SERVICE_NAME foi reiniciado automaticamente"
        else
            log_error "Falha ao reiniciar o serviço"
            send_alert "Falha crítica" "Não foi possível reiniciar o serviço $SERVICE_NAME"
        fi
    fi
    
    # Verificar resposta HTTP
    if ! check_http_response; then
        ((issues++))
    fi
    
    # Verificar recursos do sistema
    check_memory_usage
    check_cpu_usage
    check_disk_space
    check_error_logs
    check_network
    
    if [ $issues -eq 0 ]; then
        log_success "✅ Todos os checks passaram - Sistema saudável"
    else
        log_warning "⚠️  $issues problemas detectados"
    fi
    
    echo ""
}

# Função para modo daemon
run_daemon() {
    log_info "🚀 Iniciando monitoramento em modo daemon (intervalo: ${CHECK_INTERVAL}s)"
    
    while true; do
        run_monitoring
        sleep $CHECK_INTERVAL
    done
}

# Função de ajuda
show_help() {
    echo "📊 Monitor RX Veículos"
    echo ""
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  check     - Executa uma verificação única"
    echo "  daemon    - Executa monitoramento contínuo"
    echo "  status    - Mostra relatório de status"
    echo "  help      - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 check          # Verificação única"
    echo "  $0 daemon         # Monitoramento contínuo"
    echo "  $0 status         # Relatório de status"
    echo ""
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root (use sudo)"
    exit 1
fi

# Criar arquivo de log se não existir
touch $LOG_FILE
chmod 644 $LOG_FILE

# Processar argumentos
case "${1:-check}" in
    "check")
        run_monitoring
        ;;
    "daemon")
        run_daemon
        ;;
    "status")
        generate_status_report
        ;;
    "help")
        show_help
        ;;
    *)
        echo "❌ Opção inválida: $1"
        show_help
        exit 1
        ;;
esac