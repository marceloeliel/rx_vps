@echo off
echo 🚀 Aplicando correção definitiva do Dockerfile...

cd /d "e:\projetos\rx-git"

echo ✅ Adicionando arquivos...
git add .

echo ✅ Fazendo commit...
git commit -m "🐛 fix: Substitui pnpm por npm no Dockerfile para resolver Exit Code 1"

echo ✅ Enviando para GitHub...
git push

echo ✅ Correção aplicada com sucesso!
echo 🎯 Agora teste o deploy no Portainer!
pause