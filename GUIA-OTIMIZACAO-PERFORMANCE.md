# Guia de Otimização de Performance - RX Negócio

## Problemas Identificados
- Lentidão no carregamento de páginas
- Dificuldade para fazer logout
- Página recarrega e desloga o usuário
- Navegador não atualiza mudanças

## Soluções Implementadas

### 1. Configuração Otimizada do Nginx

**Arquivo:** `/etc/nginx/sites-available/rxnegocio`

```nginx
server {
    listen 80;
    server_name rxnegocio.com.br www.rxnegocio.com.br;

    # Configurações de timeout otimizadas
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer sizes otimizados
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Headers para evitar cache de páginas dinâmicas
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    # Otimizações para arquivos estáticos do Next.js
    location /_next/static/ {
        proxy_pass http://localhost:3002;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        expires 1y;
    }
    
    # Cache para imagens
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif)$ {
        proxy_pass http://localhost:3002;
        add_header Cache-Control "public, max-age=2592000" always;
        expires 30d;
    }
    
    # Cache para CSS e JS
    location ~* \.(css|js)$ {
        proxy_pass http://localhost:3002;
        add_header Cache-Control "public, max-age=86400" always;
        expires 1d;
    }
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;

    # Compressão otimizada
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Configurações de cliente
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
}
```

### 2. Configuração Otimizada do PM2

**Arquivo:** `ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'rxnegocio',
    script: 'server.js',
    instances: 2, // Usar 2 instâncias para melhor performance
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', '.next', 'logs']
  }]
}
```

## Comandos para Aplicar as Otimizações

### 1. Backup e Atualização do Nginx
```bash
# Fazer backup da configuração atual
sudo cp /etc/nginx/sites-available/rxnegocio /etc/nginx/sites-available/rxnegocio.backup

# Aplicar nova configuração (copie o conteúdo acima)
sudo nano /etc/nginx/sites-available/rxnegocio

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 2. Otimizar Aplicação Next.js
```bash
# Ir para o diretório da aplicação
cd /root/rxnegocio

# Parar aplicação
pm2 stop rxnegocio

# Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
NODE_ENV=production pnpm build

# Criar configuração otimizada do PM2
echo 'module.exports = {
  apps: [{
    name: "rxnegocio",
    script: "server.js",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3002
    },
    max_memory_restart: "1G",
    node_args: "--max-old-space-size=1024",
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    autorestart: true,
    watch: false
  }]
}' > ecosystem.config.js

# Reiniciar com nova configuração
pm2 delete rxnegocio
pm2 start ecosystem.config.js
pm2 save
```

### 3. Otimizações do Sistema
```bash
# Aumentar limites de arquivo
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Otimizar kernel
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
echo "net.core.netdev_max_backlog = 5000" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Verificações Pós-Otimização

### 1. Status dos Serviços
```bash
# Verificar Nginx
sudo systemctl status nginx

# Verificar PM2
pm2 status
pm2 monit

# Verificar logs
tail -f /var/log/nginx/error.log
pm2 logs rxnegocio
```

### 2. Testes de Performance
```bash
# Testar resposta do servidor
curl -I https://rxnegocio.com.br

# Verificar tempo de resposta
time curl -s https://rxnegocio.com.br > /dev/null

# Monitorar recursos
htop
free -h
df -h
```

## Melhorias Adicionais Recomendadas

### 1. Configuração de Cache Redis (Opcional)
```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Configurar Redis para cache de sessão
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 2. Monitoramento Contínuo
```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/rxnegocio

# Adicionar:
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

### 3. Configurações de Firewall
```bash
# Verificar portas abertas
sudo ufw status

# Otimizar conexões
echo "net.ipv4.tcp_keepalive_time = 600" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_keepalive_intvl = 60" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Problemas Específicos e Soluções

### 1. Logout Automático
- **Causa:** Headers de cache inadequados
- **Solução:** Headers `no-cache` aplicados nas páginas dinâmicas

### 2. Lentidão no Carregamento
- **Causa:** Falta de otimização de buffers e timeouts
- **Solução:** Configurações otimizadas de proxy no Nginx

### 3. Cache do Navegador
- **Causa:** Headers de cache inconsistentes
- **Solução:** Cache específico por tipo de arquivo

### 4. Performance Geral
- **Causa:** Configuração padrão do PM2
- **Solução:** Modo cluster com múltiplas instâncias

## Comandos de Monitoramento

```bash
# Monitorar em tempo real
pm2 monit

# Logs da aplicação
pm2 logs rxnegocio --lines 50

# Status detalhado
pm2 show rxnegocio

# Reiniciar se necessário
pm2 restart rxnegocio

# Verificar memória
free -h && ps aux --sort=-%mem | head -10
```

Após aplicar essas otimizações, a aplicação deve apresentar melhor performance, resolução dos problemas de logout e cache adequado.