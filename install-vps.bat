@echo off
echo Conectando na VPS e executando instalacao automatica...
echo.
echo y | plink -ssh root@31.97.92.120 -pw "D@niel929274929274" "curl -fsSL https://raw.githubusercontent.com/marceloeliel/rx_vps/main/quick-install.sh | bash"
echo.
echo Instalacao concluida!
pause