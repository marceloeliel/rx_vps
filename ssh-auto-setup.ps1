# Script para configurar acesso SSH automatico a VPS
param(
    [string]$VpsIp = "31.97.92.120",
    [string]$VpsUser = "root"
)

Write-Host "=== Configuracao SSH Automatica ===" -ForegroundColor Green
Write-Host "VPS: $VpsUser@$VpsIp" -ForegroundColor Yellow

# Verificar diretorio .ssh
$sshDir = "$env:USERPROFILE\.ssh"
if (!(Test-Path $sshDir)) {
    Write-Host "Criando diretorio .ssh..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

# Caminhos das chaves
$privateKey = "$sshDir\id_rsa"
$publicKey = "$sshDir\id_rsa.pub"

# Verificar se chaves existem
if (Test-Path $privateKey) {
    Write-Host "Chave SSH ja existe: $privateKey" -ForegroundColor Green
} else {
    Write-Host "Gerando chave SSH automaticamente..." -ForegroundColor Yellow
    
    # Gerar chave SSH sem interacao usando cmd
    $keygenCmd = "ssh-keygen -t rsa -b 4096 -f `"$privateKey`" -N `""""
    cmd /c "echo. | $keygenCmd"
    
    if ((Test-Path $privateKey) -and (Test-Path $publicKey)) {
        Write-Host "Chaves criadas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Erro ao criar chaves" -ForegroundColor Red
        exit 1
    }
}

# Verificar se chaves existem
if (!(Test-Path $privateKey) -or !(Test-Path $publicKey)) {
    Write-Host "Erro: Chaves nao encontradas" -ForegroundColor Red
    exit 1
}

# Ler chave publica
$publicKeyContent = Get-Content $publicKey -Raw
$publicKeyContent = $publicKeyContent.Trim()
Write-Host "Chave publica carregada" -ForegroundColor Green

# Configurar VPS
Write-Host "`nConfigurando VPS..." -ForegroundColor Yellow
Write-Host "Digite a senha da VPS quando solicitado" -ForegroundColor Cyan

# Comandos para executar na VPS
$commands = @(
    "mkdir -p ~/.ssh",
    "echo '$publicKeyContent' >> ~/.ssh/authorized_keys",
    "chmod 700 ~/.ssh",
    "chmod 600 ~/.ssh/authorized_keys",
    "echo 'SSH configurado com sucesso!'"
)

# Executar cada comando
foreach ($cmd in $commands) {
    Write-Host "Executando: $cmd" -ForegroundColor Gray
    & ssh -o "StrictHostKeyChecking=no" "$VpsUser@$VpsIp" $cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao executar comando" -ForegroundColor Red
        exit 1
    }
}

# Testar conexao
Write-Host "`nTestando conexao automatica..." -ForegroundColor Yellow
$testResult = & ssh -i $privateKey -o "StrictHostKeyChecking=no" "$VpsUser@$VpsIp" "echo 'Teste OK'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "$testResult" -ForegroundColor Green
    Write-Host "✅ Configuracao bem-sucedida!" -ForegroundColor Green
    
    # Criar config SSH
    $sshConfig = "$sshDir\config"
    if (!(Test-Path $sshConfig)) {
        $configContent = @"
Host vps-rx
    HostName $VpsIp
    User $VpsUser
    IdentityFile $privateKey
    StrictHostKeyChecking no
"@
        $configContent | Out-File -FilePath $sshConfig -Encoding UTF8
        Write-Host "Config SSH criado: $sshConfig" -ForegroundColor Green
    }
    
    Write-Host "`n=== SUCESSO! ===" -ForegroundColor Green
    Write-Host "Agora voce pode usar:" -ForegroundColor Cyan
    Write-Host "1. ssh vps-rx" -ForegroundColor White
    Write-Host "2. ssh -i $privateKey $VpsUser@$VpsIp" -ForegroundColor White
    Write-Host "3. scp -i $privateKey arquivo ${VpsUser}@${VpsIp}:/destino" -ForegroundColor White
    
} else {
    Write-Host "❌ Teste falhou" -ForegroundColor Red
    Write-Host "Verifique a configuracao manualmente" -ForegroundColor Yellow
}

Write-Host "`nScript finalizado" -ForegroundColor Green