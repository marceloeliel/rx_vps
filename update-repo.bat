@echo off
echo 🔄 Atualizando repositório automaticamente...

cd /d "e:\projetos\rx-git"

echo ✅ Verificando mudanças...
git status

echo ✅ Adicionando arquivos modificados...
git add .

echo ✅ Fazendo commit...
set timestamp=%date% %time%
git commit -m "🔄 Auto-update: %timestamp%"

echo ✅ Enviando para GitHub...
git push

echo ✅ Repositório atualizado com sucesso!
echo 🎯 Agora você pode fazer deploy no Portainer!
pause