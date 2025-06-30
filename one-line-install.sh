#!/bin/bash
# RX Veículos - Instalação One-Line
echo "🚗 Instalando RX Veículos..." && \
git clone https://github.com/marceloeliel/rx-git.git && \
cd rx-git && \
npm install -g pnpm && \
pnpm install && \
cp env-production-example.txt .env.local && \
echo "✅ Instalação concluída! Configure .env.local e execute: pnpm dev" 