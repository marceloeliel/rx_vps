# 🚗 RX Veículos - Script de Instalação para Windows
# Este script automatiza toda a instalação do projeto RX Veículos no Windows

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

# Funções para output colorido
function Write-Step { 
    param($Message)
    Write-Host "[PASSO] $Message" -ForegroundColor Blue
}

function Write-Success { 
    param($Message)
    Write-Host "[SUCESSO] $Message" -ForegroundColor Green
}

function Write-Warning { 
    param($Message)
    Write-Host "[AVISO] $Message" -ForegroundColor Yellow
}

function Write-Error { 
    param($Message)
    Write-Host "[ERRO] $Message" -ForegroundColor Red
}

function Write-Info { 
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

# Banner
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                    🚗 RX VEÍCULOS                             ║" -ForegroundColor Magenta
Write-Host "║            Script de Instalação Automática                   ║" -ForegroundColor Magenta
Write-Host "║                       Windows                                 ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Verificar Node.js
function Install-NodeJS {
    Write-Step "Verificando Node.js..."
    
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $majorVersion = ($nodeVersion -replace 'v', '').Split('.')[0]
            if ([int]$majorVersion -ge 18) {
                Write-Success "Node.js $nodeVersion já está instalado"
                return
            }
        }
    }
    catch {
        # Node não encontrado
    }
    
    Write-Step "Node.js não encontrado ou versão antiga..."
    Write-Warning "Por favor, instale Node.js 18+ manualmente:"
    Write-Info "1. Acesse: https://nodejs.org"
    Write-Info "2. Baixe e instale o Node.js LTS"
    Write-Info "3. Reinicie o PowerShell"
    Write-Info "4. Execute este script novamente"
    Write-Error "Instalação interrompida - Node.js necessário"
    exit 1
}

# Verificar pnpm
function Install-Pnpm {
    Write-Step "Verificando pnpm..."
    
    try {
        pnpm --version 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "pnpm já está instalado"
            return
        }
    }
    catch {
        # pnpm não encontrado
    }
    
    Write-Step "Instalando pnpm..."
    npm install -g pnpm
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "pnpm instalado com sucesso!"
    } else {
        Write-Error "Erro ao instalar pnpm"
        exit 1
    }
}

# Verificar Git
function Install-Git {
    Write-Step "Verificando Git..."
    
    try {
        git --version 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Git já está instalado"
            return
        }
    }
    catch {
        # Git não encontrado
    }
    
    Write-Warning "Git não encontrado!"
    Write-Info "Por favor, instale Git manualmente:"
    Write-Info "1. Acesse: https://git-scm.com/download/win"
    Write-Info "2. Baixe e instale o Git"
    Write-Info "3. Reinicie o PowerShell"
    Write-Info "4. Execute este script novamente"
    Write-Error "Instalação interrompida - Git necessário"
    exit 1
}

# Clonar repositório
function Clone-Repository {
    Write-Step "Clonando repositório RX Veículos..."
    
    if (Test-Path "rx-git") {
        Write-Warning "Diretório rx-git já existe. Removendo..."
        Remove-Item -Recurse -Force "rx-git"
    }
    
    git clone https://github.com/marceloeliel/rx-git.git
    
    if ($LASTEXITCODE -eq 0) {
        Set-Location "rx-git"
        Write-Success "Repositório clonado com sucesso!"
    } else {
        Write-Error "Erro ao clonar repositório"
        exit 1
    }
}

# Instalar dependências
function Install-Dependencies {
    Write-Step "Instalando dependências do projeto..."
    
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json não encontrado!"
        exit 1
    }
    
    pnpm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependências instaladas com sucesso!"
    } else {
        Write-Error "Erro ao instalar dependências"
        exit 1
    }
}

# Configurar ambiente
function Setup-Environment {
    Write-Step "Configurando arquivo de ambiente..."
    
    if (-not (Test-Path "env-production-example.txt")) {
        Write-Error "Arquivo env-production-example.txt não encontrado!"
        exit 1
    }
    
    Copy-Item "env-production-example.txt" ".env.local"
    
    Write-Warning "=========================================="
    Write-Warning "  CONFIGURAÇÃO NECESSÁRIA"
    Write-Warning "=========================================="
    Write-Warning "O arquivo .env.local foi criado com valores de exemplo."
    Write-Warning "Você DEVE configurar as seguintes variáveis:"
    Write-Warning ""
    Write-Warning "1. SUPABASE_URL e SUPABASE_ANON_KEY"
    Write-Warning "2. ASAAS_API_KEY (para pagamentos)"
    Write-Warning "3. NEXT_PUBLIC_SUPABASE_URL"
    Write-Warning ""
    Write-Warning "Edite o arquivo .env.local antes de executar o projeto!"
    Write-Warning "=========================================="
}

# Verificar portas
function Check-Ports {
    Write-Step "Verificando porta 3000..."
    
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        Write-Warning "Porta 3000 está em uso. Tentando liberar..."
        # Tentar parar processos Node.js
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    Write-Success "Portas verificadas!"
}

# Função principal
function Main {
    Write-Step "Iniciando instalação do RX Veículos..."
    
    # Verificar pré-requisitos
    Install-Git
    Install-NodeJS
    Install-Pnpm
    
    # Clonar e configurar projeto
    Clone-Repository
    Install-Dependencies
    Setup-Environment
    Check-Ports
    
    # Sucesso final
    Write-Host ""
    Write-Success "=========================================="
    Write-Success "  INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
    Write-Success "=========================================="
    Write-Info "Próximos passos:"
    Write-Info ""
    Write-Info "1. Configure o arquivo .env.local com suas credenciais:"
    Write-Info "   notepad.exe .env.local"
    Write-Info ""
    Write-Info "2. Execute o projeto em desenvolvimento:"
    Write-Info "   pnpm dev"
    Write-Info ""
    Write-Info "3. Ou faça o build para produção:"
    Write-Info "   pnpm build"
    Write-Info "   pnpm start"
    Write-Info ""
    Write-Info "4. Acesse: http://localhost:3000"
    Write-Info ""
    Write-Info "📖 Documentação completa em:"
    Write-Info "   - README.md"
    Write-Info "   - DEPLOY-COMPLETO.md"
    Write-Info "   - PWA_INSTALL_GUIDE.md"
    Write-Success "=========================================="
    
    # Perguntar se quer abrir editor
    Write-Host ""
    $response = Read-Host "Deseja abrir o arquivo .env.local para configuração agora? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        if (Get-Command "code" -ErrorAction SilentlyContinue) {
            code .env.local
        } else {
            notepad.exe .env.local
        }
    }
    
    Write-Success "Instalação finalizada! 🚀"
}

# Executar instalação
try {
    Main
} catch {
    Write-Error "Erro durante a instalação: $_"
    Write-Info "Verifique os logs acima e tente novamente"
    exit 1
} 