# 🔧 Guia de Correção de CSS em Produção

## Problema Identificado
O CSS não está carregando corretamente para usuários deslogados na VPS devido a:
- Problemas de hidratação do Next.js
- Configurações inadequadas para produção
- Cache de arquivos CSS não otimizado

## Soluções Aplicadas

### 1. Configurações do Next.js Otimizadas
- ✅ Configuração específica para CSS em produção
- ✅ Otimização de chunks CSS
- ✅ Remoção de console.log em produção

### 2. Variáveis de Ambiente Corrigidas
- ✅ NODE_ENV=production
- ✅ URLs corretas para produção
- ✅ Configurações do Supabase

### 3. PostCSS Otimizado
- ✅ Autoprefixer habilitado
- ✅ CSSnano para minificação em produção

## Como Aplicar na VPS

### Opção 1: Script Automático
```bash
# Na VPS, execute:
chmod +x deploy-css-fix.sh
./deploy-css-fix.sh
```

### Opção 2: Manual
```bash
# 1. Parar aplicação
pm2 stop rx-veiculos

# 2. Atualizar código
git pull origin main

# 3. Copiar configurações
cp .env.production.example .env.production
# Editar .env.production com suas credenciais

# 4. Limpar cache e rebuild
rm -rf .next
npm ci
NODE_ENV=production npm run build

# 5. Reiniciar
pm2 start ecosystem.config.js
```

## Verificações Pós-Deploy

1. **Verificar se CSS está carregando:**
   - Abrir DevTools > Network
   - Verificar se arquivos .css estão sendo carregados
   - Status 200 para /_next/static/css/*

2. **Verificar logs:**
   ```bash
   pm2 logs rx-veiculos
   ```

3. **Testar usuário deslogado:**
   - Abrir navegador anônimo
   - Acessar https://rxnegocio.com.br
   - Verificar se estilos estão aplicados

## Configurações do Nginx (se necessário)

Adicionar ao nginx.conf:
```nginx
# Cache otimizado para CSS
location ~* .css$ {
    proxy_pass http://localhost:3002;
    proxy_cache_valid 200 1y;
    add_header Cache-Control "public, immutable";
    add_header X-CSS-Source "nginx-optimized";
}

# Headers para debugging
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

## Troubleshooting

### CSS ainda não carrega?
1. Verificar se NODE_ENV=production
2. Limpar cache do navegador
3. Verificar logs do PM2
4. Testar build local: `npm run build && npm start`

### Erros de hidratação?
1. Verificar console do navegador
2. Verificar se componentes HydrationSafe foram corrigidos
3. Verificar se suppressHydrationWarning foi removido

---

**✅ Após aplicar essas correções, o CSS deve carregar corretamente para todos os usuários!**
