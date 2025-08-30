@echo off
echo === UPLOAD PROJETO RX-NEGOCIO PARA VPS ===

:: Criar arquivo ZIP do projeto
echo Criando arquivo ZIP do projeto...
tar -czf rx-negocio-completo.tar.gz ^^
    --exclude=node_modules ^^
    --exclude=.next ^^
    --exclude=.git ^^
    --exclude=pnpm-lock.yaml ^^
    --exclude=*.log ^^
    .

if exist rx-negocio-completo.tar.gz (
    echo ✅ Arquivo ZIP criado com sucesso!
    
    :: Upload para VPS
    echo Fazendo upload para VPS...
    scp rx-negocio-completo.tar.gz root@31.97.92.120:/tmp/
    
    if %ERRORLEVEL% == 0 (
        echo ✅ Upload realizado com sucesso!
        
        :: Executar deploy na VPS
        echo Executando deploy na VPS...
        ssh root@31.97.92.120 "cd /tmp && tar -xzf rx-negocio-completo.tar.gz -C /opt/ && mv /opt/rx-git /opt/rx-git-backup-$(date +%%s) 2>/dev/null; mv /opt/e:/projetos/rx-git /opt/rx-git 2>/dev/null || mv /opt/* /opt/rx-git/ && cd /opt/rx-git && chmod +x *.sh && ./deploy-vps-direto.sh"
        
        echo ✅ Deploy iniciado na VPS!
        echo 🌐 Acesse: http://31.97.92.120:3000
    ) else (
        echo ❌ Erro no upload para VPS
    )
) else (
    echo ❌ Erro ao criar arquivo ZIP
)

pause