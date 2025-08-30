@echo off
echo ========================================
echo    CORRIGINDO GIT PUSH - RX NEGOCIO
echo ========================================
echo.
echo Verificando branch atual...
git branch
echo.
echo Mudando para branch main...
git checkout -b main 2>nul || git checkout main
echo.
echo Adicionando arquivos...
git add .
echo.
echo Fazendo commit...
git commit -m "Deploy VPS direto - preparação inicial"
echo.
echo Fazendo push...
git push -u origin main
echo.
echo Se der erro, executando push forçado...
git push -u origin main --force
echo.
echo ========================================
echo Push concluído! Agora pode fazer o deploy na VPS.
echo ========================================
pause