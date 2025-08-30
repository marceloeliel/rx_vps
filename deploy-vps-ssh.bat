@echo off
echo ========================================
echo    DEPLOY DIRETO VPS - RX NEGOCIO
echo ========================================
echo.
echo Conectando na VPS: 31.97.92.120
echo Usuario: root
echo Senha: @D@niel929274
echo.
echo COMANDOS PARA EXECUTAR NA VPS:
echo ========================================
echo.
echo # 1. Atualizar sistema
echo sudo apt update && sudo apt upgrade -y
echo.
echo # 2. Instalar Docker (se não estiver instalado)
echo curl -fsSL https://get.docker.com -o get-docker.sh
echo sudo sh get-docker.sh
echo sudo systemctl start docker
echo sudo systemctl enable docker
echo.
echo # 3. Instalar Docker Compose
echo sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
echo sudo chmod +x /usr/local/bin/docker-compose
echo.
echo # 4. Clonar repositorio
echo cd /opt
echo sudo git clone https://github.com/marceloeliel/rx-git.git
echo cd rx-git
echo.
echo # 5. Configurar permissoes
echo sudo chown -R root:root /opt/rx-git
echo sudo chmod +x *.sh
echo.
echo # 6. Build e Deploy
echo sudo docker build -t rx-negocio .
echo sudo docker run -d --name rx-negocio -p 3000:3000 --restart unless-stopped rx-negocio
echo.
echo ========================================
echo Pressione qualquer tecla para conectar via SSH...
pause
ssh root@31.97.92.120