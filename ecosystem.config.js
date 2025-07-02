module.exports = {
  apps: [{
    name: 'rx-veiculos',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 'max', // Usa todos os cores disponíveis
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Configurações de performance
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=1024',
    
    // Configurações de restart
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Logs
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/var/log/pm2/rx-veiculos-error.log',
    out_file: '/var/log/pm2/rx-veiculos-out.log',
    log_file: '/var/log/pm2/rx-veiculos-combined.log',
    
    // Outras configurações
    watch: false,
    autorestart: true,
    
    // Configurações de cluster
    kill_timeout: 5000,
    listen_timeout: 8000,
    
    // Environment variables
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_SUPABASE_URL: 'sua_url_supabase',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sua_chave_anon_supabase',
      SUPABASE_SERVICE_ROLE_KEY: 'sua_chave_service_role_supabase',
      // Adicione outras variáveis aqui
    }
  }]
} 