#!/bin/bash

# Script para atualizar configurações para rxnegocio.com.br

echo "=== Atualizando configurações para rxnegocio.com.br ==="

# Atualizar .env.production
cat > /home/rxapp/rx-git/.env.production << 'EOF'
NODE_ENV=production
PORT=3000

NEXTAUTH_URL=https://rxnegocio.com.br
NEXTAUTH_SECRET=sua_chave_secreta_nextauth_aqui

NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

DATABASE_URL=postgresql://usuario:senha@host:porta/database

POSTGRES_HOST=seu-host.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres
POSTGRES_USER=postgres.seu-projeto
POSTGRES_PASSWORD=sua_senha
POSTGRES_POOL_MODE=transaction

NEXT_PUBLIC_FIPE_API_TOKEN=seu_token_fipe_aqui

NEXT_PUBLIC_APP_URL=https://rxnegocio.com.br
WEBSITE_URL=https://rxnegocio.com.br

WEBHOOK_URL=https://hooks.slack.com/services/...
ADMIN_EMAIL=admin@rxnegocio.com.br
EOF

# Atualizar configuração do Nginx
cat > /etc/nginx/sites-available/rx-app << 'EOF'
server {
    listen 80;
    server_name rxnegocio.com.br www.rxnegocio.com.br;

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

# Recarregar Nginx
nginx -t && systemctl reload nginx

# Instalar Certbot se não estiver instalado
if ! command -v certbot &> /dev/null; then
    echo "Instalando Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Configurar SSL com Let's Encrypt
echo "Configurando SSL para rxnegocio.com.br..."
certbot --nginx -d rxnegocio.com.br -d www.rxnegocio.com.br --non-interactive --agree-tos --email admin@rxnegocio.com.br

# Reiniciar aplicação
echo "Reiniciando aplicação..."
su - rxapp -c "cd /home/rxapp/rx-git && pm2 restart rx-app"

echo "\n=== Configuração concluída ==="
echo "Site disponível em: https://rxnegocio.com.br"
echo "SSL configurado com sucesso!"

# Verificar status
echo "\n=== Status dos serviços ==="
echo "PM2 Status:"
su - rxapp -c "pm2 status"
echo "\nNginx Status:"
systemctl status nginx --no-pager
echo "\nCertificados SSL:"
certbot certificates