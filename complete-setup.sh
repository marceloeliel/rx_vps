#!/bin/bash

# Script para completar a configuração da aplicação RX Veículos

echo "=== Configurando aplicação RX Veículos ==="

# Navegar para o diretório da aplicação
cd /home/rxapp/rx-git

# Configurar PM2 para o usuário rxapp
echo "Configurando PM2..."
su - rxapp -c "cd /home/rxapp/rx-git && pm2 start npm --name 'rx-app' -- run dev"
su - rxapp -c "pm2 save"
su - rxapp -c "pm2 startup"

# Configurar Nginx
echo "Configurando Nginx..."
cat > /etc/nginx/sites-available/rx-app << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site no Nginx
ln -sf /etc/nginx/sites-available/rx-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Configurar firewall
echo "Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Verificar status dos serviços
echo "=== Status dos Serviços ==="
echo "PM2 Status:"
su - rxapp -c "pm2 status"
echo "\nNginx Status:"
systemctl status nginx --no-pager
echo "\nFirewall Status:"
ufw status

echo "\n=== Configuração Concluída ==="
echo "Aplicação disponível em: http://$(curl -s ifconfig.me)"
echo "Para configurar SSL, execute: certbot --nginx -d seu-dominio.com"
echo "\nPróximos passos:"
echo "1. Configure as variáveis de ambiente em /home/rxapp/rx-git/.env.production"
echo "2. Configure um domínio apontando para este servidor"
echo "3. Execute o SSL com Let's Encrypt"