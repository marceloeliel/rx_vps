@echo off
echo ========================================
echo    ATUALIZACAO VPS - RX NEGOCIO
echo ========================================
echo.
echo COMANDOS PARA ATUALIZAR NA VPS:
echo ========================================
echo.
echo # Parar container atual
echo sudo docker stop rx-negocio
echo sudo docker rm rx-negocio
echo.
echo # Atualizar codigo
echo cd /opt/rx-git
echo sudo git pull origin main
echo.
echo # Rebuild e redeploy
echo sudo docker build -t rx-negocio .
echo sudo docker run -d --name rx-negocio -p 3000:3000 --restart unless-stopped rx-negocio
echo.
echo ========================================
echo Pressione qualquer tecla para conectar via SSH...
pause
ssh root@31.97.92.120