#!/bin/bash

# 🚀 Scripts Auxiliares para VPS - RX Veículos

# ==========================================
# SCRIPT DE DEPLOY AUTOMÁTICO
# ==========================================
create_deploy_script() {
cat > ~/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando deploy do RX Veículos..."

# Navegar para diretório da aplicação
cd /var/www/rx-veiculos

# Fazer backup antes do deploy
echo "💾 Fazendo backup..."
sudo tar -czf ~/backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz .

# Pull das mudanças
echo "📥 Baixando atualizações..."
git pull origin main

# Verificar se houve mudanças
if [ $? -eq 0 ]; then
    echo "✅ Código atualizado"
    
    # Instalar dependências
    echo "📦 Instalando dependências..."
    pnpm install --frozen-lockfile
    
    # Build de produção
    echo "🔨 Fazendo build..."
    pnpm run build
    
    # Reiniciar aplicação
    echo "🔄 Reiniciando aplicação..."
    pm2 restart rx-veiculos
    
    # Verificar status
    echo "📊 Status final:"
    pm2 status
    
    echo "✅ Deploy concluído com sucesso!"
else
    echo "❌ Erro no git pull"
    exit 1
fi
EOF

chmod +x ~/deploy.sh
echo "✅ Script de deploy criado: ~/deploy.sh"
}

# ==========================================
# SCRIPT DE MONITORAMENTO
# ==========================================
create_monitor_script() {
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
echo "=============================================="
echo "🔍 MONITOR RX VEÍCULOS - $(date)"
echo "=============================================="

# Sistema
echo "💻 SISTEMA:"
echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "  RAM: $(free -m | awk 'NR==2{printf "%.1f%% (%dMB/%dMB)", $3*100/$2, $3, $2}')"
echo "  DISK: $(df -h / | awk 'NR==2{printf "%s (%s livre)", $5, $4}')"
echo "  LOAD: $(uptime | awk -F'load average:' '{print $2}')"

# Rede
echo ""
echo "🌐 REDE:"
echo "  HTTP:  $(netstat -an | grep :80 | wc -l) conexões"
echo "  HTTPS: $(netstat -an | grep :443 | wc -l) conexões"
echo "  SSH:   $(netstat -an | grep :2022 | wc -l) conexões"

# Aplicação
echo ""
echo "🚀 APLICAÇÃO:"
pm2 status

# Nginx
echo ""
echo "⚡ NGINX:"
nginx_status=$(systemctl is-active nginx)
echo "  Status: $nginx_status"
if [ "$nginx_status" = "active" ]; then
    echo "  ✅ Nginx funcionando"
else
    echo "  ❌ Nginx com problema"
fi

# SSL
echo ""
echo "🔒 SSL:"
if [ -f "/etc/letsencrypt/live/*/cert.pem" ]; then
    cert_file=$(find /etc/letsencrypt/live -name "cert.pem" | head -n1)
    exp_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
    echo "  Expira em: $exp_date"
else
    echo "  ❌ Certificado SSL não encontrado"
fi

# Logs recentes
echo ""
echo "📝 LOGS RECENTES (últimas 5 linhas):"
tail -n 5 /var/log/nginx/rx-veiculos-error.log 2>/dev/null || echo "  Nenhum erro no Nginx"

echo ""
echo "=============================================="
EOF

chmod +x ~/monitor.sh
echo "✅ Script de monitoramento criado: ~/monitor.sh"
}

# ==========================================
# SCRIPT DE BACKUP
# ==========================================
create_backup_script() {
cat > ~/backup.sh << 'EOF'
#!/bin/bash
echo "💾 Iniciando backup do RX Veículos..."

# Diretórios
BACKUP_DIR="$HOME/backups"
APP_DIR="/var/www/rx-veiculos"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

# Backup da aplicação
echo "📦 Fazendo backup da aplicação..."
tar --exclude='node_modules' --exclude='.next/cache' --exclude='.git' \
    -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" -C /var/www rx-veiculos

# Backup das configurações
echo "⚙️  Fazendo backup das configurações..."
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" \
    /etc/nginx/sites-available/rx-veiculos \
    /etc/letsencrypt \
    /etc/ssh/sshd_config \
    /etc/fail2ban/jail.local 2>/dev/null

# Limpeza (manter apenas últimos 7 backups)
echo "🧹 Limpando backups antigos..."
ls -t "$BACKUP_DIR"/app_backup_*.tar.gz | tail -n +8 | xargs -r rm -f
ls -t "$BACKUP_DIR"/config_backup_*.tar.gz | tail -n +8 | xargs -r rm -f

# Informações do backup
echo "✅ Backup concluído!"
echo "📁 Arquivos criados:"
echo "   - $BACKUP_DIR/app_backup_$DATE.tar.gz"
echo "   - $BACKUP_DIR/config_backup_$DATE.tar.gz"
echo ""
echo "📊 Espaço usado por backups:"
du -sh "$BACKUP_DIR"
echo ""
echo "📋 Backups disponíveis:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "Nenhum backup encontrado"
EOF

chmod +x ~/backup.sh
echo "✅ Script de backup criado: ~/backup.sh"
}

# ==========================================
# SCRIPT DE HEALTH CHECK
# ==========================================
create_healthcheck_script() {
cat > ~/healthcheck.sh << 'EOF'
#!/bin/bash
# Health Check automático - RX Veículos

# Configurações
APP_URL="https://seudominio.com"  # SUBSTITUA PELO SEU DOMÍNIO
WEBHOOK_URL=""  # OPCIONAL: URL para notificações

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a ~/healthcheck.log
}

# Verificar aplicação
check_app() {
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" --connect-timeout 10 --max-time 30)
    
    if [ "$status" -eq 200 ]; then
        log "✅ App funcionando - Status: $status"
        return 0
    else
        log "❌ App com problema - Status: $status"
        return 1
    fi
}

# Verificar PM2
check_pm2() {
    local pm2_status=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null)
    
    if [ "$pm2_status" = "online" ]; then
        log "✅ PM2 online"
        return 0
    else
        log "❌ PM2 offline"
        return 1
    fi
}

# Verificar Nginx
check_nginx() {
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx funcionando"
        return 0
    else
        log "❌ Nginx parado"
        return 1
    fi
}

# Reiniciar serviços se necessário
restart_services() {
    log "🔄 Tentando reiniciar serviços..."
    
    # Reiniciar PM2
    pm2 restart rx-veiculos
    sleep 5
    
    # Reiniciar Nginx se necessário
    if ! check_nginx; then
        sudo systemctl restart nginx
        sleep 3
    fi
    
    # Verificar novamente
    if check_app && check_pm2 && check_nginx; then
        log "✅ Serviços reiniciados com sucesso"
        return 0
    else
        log "❌ Falha ao reiniciar serviços"
        return 1
    fi
}

# Enviar notificação (se webhook configurado)
send_notification() {
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"🚨 RX Veículos: $1\"}" \
             "$WEBHOOK_URL" &>/dev/null
    fi
}

# Executar verificações
log "🔍 Iniciando health check..."

if ! check_app || ! check_pm2 || ! check_nginx; then
    log "⚠️  Problemas detectados, tentando correção..."
    
    if restart_services; then
        send_notification "Serviços reiniciados automaticamente"
    else
        send_notification "ATENÇÃO: Falha crítica no sistema!"
        log "🚨 ALERTA: Intervenção manual necessária"
    fi
else
    log "✅ Todos os serviços funcionando normalmente"
fi
EOF

chmod +x ~/healthcheck.sh
echo "✅ Script de health check criado: ~/healthcheck.sh"
}

# ==========================================
# SCRIPT DE LOGS
# ==========================================
create_logs_script() {
cat > ~/logs.sh << 'EOF'
#!/bin/bash
# Visualizador de logs - RX Veículos

case "$1" in
    "app"|"pm2")
        echo "📱 LOGS DA APLICAÇÃO:"
        pm2 logs rx-veiculos --lines 50
        ;;
    "nginx")
        echo "⚡ LOGS DO NGINX:"
        echo "=== ACCESS LOG ==="
        tail -n 20 /var/log/nginx/rx-veiculos-access.log
        echo ""
        echo "=== ERROR LOG ==="
        tail -n 20 /var/log/nginx/rx-veiculos-error.log
        ;;
    "system"|"auth")
        echo "🔐 LOGS DO SISTEMA:"
        tail -n 30 /var/log/auth.log
        ;;
    "fail2ban")
        echo "🛡️  LOGS DO FAIL2BAN:"
        sudo tail -n 20 /var/log/fail2ban.log
        ;;
    "ssl")
        echo "🔒 LOGS DO CERTBOT:"
        tail -n 20 /var/log/letsencrypt/letsencrypt.log
        ;;
    *)
        echo "📋 USO: ./logs.sh [TIPO]"
        echo ""
        echo "TIPOS DISPONÍVEIS:"
        echo "  app      - Logs da aplicação (PM2)"
        echo "  nginx    - Logs do Nginx"
        echo "  system   - Logs do sistema"
        echo "  fail2ban - Logs de segurança"
        echo "  ssl      - Logs do SSL"
        echo ""
        echo "EXEMPLO: ./logs.sh app"
        ;;
esac
EOF

chmod +x ~/logs.sh
echo "✅ Script de logs criado: ~/logs.sh"
}

# ==========================================
# CONFIGURAR CRON JOBS
# ==========================================
setup_cron() {
    echo "⏰ Configurando tarefas automáticas..."
    
    # Criar arquivo temporário para crontab
    crontab -l 2>/dev/null > /tmp/crontab.tmp
    
    # Adicionar tarefas (se não existirem)
    grep -q "backup.sh" /tmp/crontab.tmp || echo "0 2 * * * $HOME/backup.sh" >> /tmp/crontab.tmp
    grep -q "healthcheck.sh" /tmp/crontab.tmp || echo "*/5 * * * * $HOME/healthcheck.sh" >> /tmp/crontab.tmp
    grep -q "certbot renew" /tmp/crontab.tmp || echo "0 3 * * 1 certbot renew --quiet" >> /tmp/crontab.tmp
    
    # Aplicar crontab
    crontab /tmp/crontab.tmp
    rm /tmp/crontab.tmp
    
    echo "✅ Tarefas automáticas configuradas:"
    echo "   - Backup diário às 2h"
    echo "   - Health check a cada 5 minutos"
    echo "   - Renovação SSL semanal"
}

# ==========================================
# FUNÇÃO PRINCIPAL
# ==========================================
main() {
    echo "🛠️  Criando scripts auxiliares para VPS..."
    echo ""
    
    create_deploy_script
    create_monitor_script
    create_backup_script
    create_healthcheck_script
    create_logs_script
    setup_cron
    
    echo ""
    echo "✅ SCRIPTS CRIADOS COM SUCESSO!"
    echo ""
    echo "📋 COMANDOS DISPONÍVEIS:"
    echo "   ./deploy.sh      - Deploy automático"
    echo "   ./monitor.sh     - Monitor do sistema"
    echo "   ./backup.sh      - Backup manual"
    echo "   ./healthcheck.sh - Verificação de saúde"
    echo "   ./logs.sh [tipo] - Visualizar logs"
    echo ""
    echo "🔄 TAREFAS AUTOMÁTICAS ATIVAS:"
    crontab -l
    echo ""
    echo "🎉 Sua VPS está totalmente automatizada!"
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 