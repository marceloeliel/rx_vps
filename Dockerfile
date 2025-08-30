# 🚗 RX Veículos - Dockerfile Definitivo com NPM
# Solução para resolver Exit Code 1 do pnpm

# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Instalar dependências do sistema
RUN apk add --no-cache \
    libc6-compat \
    git \
    ca-certificates \
    openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Converter pnpm-lock.yaml para package-lock.json se necessário
# e instalar com npm (mais estável no Docker)
RUN npm install --production --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache \
    libc6-compat \
    git \
    ca-certificates \
    openssl

WORKDIR /app

# Copiar dependências
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build da aplicação
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner

# Instalar dependências de runtime
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Configurar ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos de produção
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicialização
CMD ["node", "server.js"]