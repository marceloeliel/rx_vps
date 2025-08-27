@echo off
REM Script para atualização automática do PROJETO.md no Windows
REM Uso: auto-update-projeto.bat "descrição" [tipo]

echo.
echo 🤖 SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA DO PROJETO.md
echo ==================================================

REM Verificar se a descrição foi fornecida
if "%~1"=="" (
    echo ❌ Erro: Descrição da mudança é obrigatória
    echo 📋 Uso: auto-update-projeto.bat "descrição" [tipo]
    echo 📋 Tipos: feature, bugfix, improvement, wip
    exit /b 1
)

set "DESCRIPTION=%~1"
set "TYPE=%~2"
if "%TYPE%"=="" set "TYPE=feature"

echo 📝 Descrição: %DESCRIPTION%
echo 🏷️ Tipo: %TYPE%
echo.

REM Executar o script Node.js
echo 🔄 Atualizando PROJETO.md...
node update-projeto-md.js "%DESCRIPTION%" "%TYPE%"

if %errorlevel% equ 0 (
    echo.
    echo ✅ PROJETO.md atualizado com sucesso!
    
    REM Opcional: Fazer commit automático se estiver em um repositório Git
    if exist ".git" (
        echo 📦 Fazendo commit automático...
        git add PROJETO.md
        git commit -m "docs: %DESCRIPTION%"
        echo ✅ Commit realizado!
    )
    
    echo.
    echo 📊 Status do Projeto Atualizado:
    echo • Documentação: Sincronizada
    echo • Versão: Incrementada
    echo • Log: Atualizado
) else (
    echo ❌ Erro ao atualizar PROJETO.md
    exit /b 1
)

