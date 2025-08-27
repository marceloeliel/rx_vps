# Sistema de Verificação Automática de Usuários

Este documento descreve o sistema implementado para verificar automaticamente se os usuários ainda estão ativos e cadastrados no Supabase, fazendo logout automático de usuários excluídos ou inativos.

## 🎯 Objetivo

Evitar que usuários excluídos ou inativos continuem usando o sistema, garantindo a segurança e integridade da aplicação.

## 🏗️ Componentes Implementados

### 1. Hook `useAuthGuard`
**Arquivo:** `hooks/use-auth-guard.ts`

**Funcionalidades:**
- Verificação automática periódica do status do usuário
- Logout automático para usuários inválidos
- Verificação de consistência entre Auth e Profile
- Listener para mudanças de estado de autenticação

**Opções de configuração:**
```typescript
interface AuthGuardOptions {
  redirectTo?: string        // Página de redirecionamento (padrão: "/login")
  checkInterval?: number     // Intervalo de verificação em ms (padrão: 30000)
  enableAutoCheck?: boolean  // Habilitar verificação automática (padrão: true)
  showToastOnLogout?: boolean // Mostrar toast no logout (padrão: true)
}
```

**Hooks disponíveis:**
- `useAuthGuard(options)` - Hook completo com todas as funcionalidades
- `useQuickAuthGuard()` - Hook simplificado para verificação rápida
- `useRequireAuth(redirectTo)` - Hook para páginas que requerem autenticação

### 2. Componente `AuthGuard`
**Arquivo:** `components/auth-guard.tsx`

**Componentes disponíveis:**
- `<AuthGuard>` - Componente principal para proteger páginas
- `<RequireAuth>` - Componente simplificado para páginas que requerem auth
- `<ConditionalAuth>` - Componente para mostrar conteúdo baseado no status

**Exemplo de uso:**
```tsx
// Para páginas públicas com verificação
<AuthGuard requireAuth={false} showLoader={false}>
  {/* Conteúdo da página */}
</AuthGuard>

// Para páginas que requerem autenticação
<RequireAuth>
  {/* Conteúdo protegido */}
</RequireAuth>
```

### 3. Middleware Aprimorado
**Arquivo:** `middleware.ts`

**Funcionalidades adicionadas:**
- Verificação do status do usuário em cada requisição
- Validação se o perfil ainda existe na tabela `profiles`
- Verificação se o perfil está ativo
- Verificação de consistência entre Auth e Profile
- Logout automático e limpeza de cookies

### 4. Componente de Debug
**Arquivo:** `components/auth-status-debug.tsx`

**Funcionalidades:**
- Monitoramento em tempo real do status de autenticação
- Informações detalhadas sobre usuário e perfil
- Botão para forçar verificação manual
- Instruções de teste

## 🔍 Verificações Realizadas

### No Middleware (Server-side)
1. **Sessão válida:** Verifica se há uma sessão ativa
2. **Perfil existe:** Consulta a tabela `profiles` para verificar se o perfil ainda existe
3. **Perfil ativo:** Verifica se o campo `status` não é 'inactive'
4. **Usuário no Auth:** Confirma que o usuário ainda existe no Supabase Auth
5. **Consistência de email:** Verifica se o email do perfil confere com o do Auth

### No Hook (Client-side)
1. **Autenticação ativa:** Verifica se o usuário ainda está autenticado
2. **Perfil válido:** Consulta o perfil na tabela `profiles`
3. **Status do perfil:** Verifica se o perfil está ativo
4. **Consistência de dados:** Compara dados entre Auth e Profile
5. **Verificação periódica:** Executa verificações automáticas em intervalos regulares

## 🚨 Cenários de Logout Automático

O sistema fará logout automático nos seguintes casos:

1. **Perfil não encontrado:** O perfil foi excluído da tabela `profiles`
2. **Perfil inativo:** O campo `status` do perfil está como 'inactive'
3. **Usuário não existe no Auth:** O usuário foi removido do Supabase Auth
4. **Inconsistência de email:** O email do perfil não confere com o do Auth
5. **Erro de autenticação:** Falha na verificação de autenticação

## 📱 Páginas Protegidas

As seguintes páginas foram configuradas com verificação automática:

### Páginas com Autenticação Obrigatória:
- `/perfil` - Usa `<RequireAuth>`
- `/painel-agencia` - Protegida pelo middleware
- `/meus-veiculos` - Protegida pelo middleware
- `/cadastro-veiculo` - Protegida pelo middleware
- `/editar-veiculo` - Protegida pelo middleware

### Páginas Públicas com Verificação:
- `/` (página inicial) - Usa `<AuthGuard requireAuth={false}>`
- `/veiculos` - Usa `<AuthGuard requireAuth={false}>`

## 🧪 Como Testar

### Teste 1: Exclusão de Perfil
1. Faça login na aplicação
2. No Supabase Dashboard, exclua o perfil do usuário da tabela `profiles`
3. Aguarde até 30 segundos (ou force verificação)
4. O sistema deve fazer logout automático

### Teste 2: Perfil Inativo
1. Faça login na aplicação
2. No Supabase Dashboard, altere o campo `status` do perfil para 'inactive'
3. Aguarde a verificação automática
4. O sistema deve fazer logout automático

### Teste 3: Exclusão do Auth
1. Faça login na aplicação
2. No Supabase Dashboard, exclua o usuário da seção Authentication
3. Aguarde a verificação automática
4. O sistema deve fazer logout automático

### Teste 4: Verificação no Middleware
1. Faça login na aplicação
2. Exclua o perfil ou usuário no Supabase
3. Tente navegar para uma página protegida
4. O middleware deve detectar e redirecionar para login

## 🔧 Configuração

### Intervalos de Verificação
- **Padrão:** 30 segundos
- **Debug:** 10 segundos (componente de debug)
- **Quick Auth:** 60 segundos

### Personalização
Você pode personalizar o comportamento alterando as opções do hook:

```tsx
const authGuard = useAuthGuard({
  redirectTo: '/custom-login',
  checkInterval: 60000, // 1 minuto
  enableAutoCheck: true,
  showToastOnLogout: false
})
```

## 📊 Monitoramento

O componente `<AuthStatusDebug>` foi adicionado à página inicial para monitoramento em tempo real. Ele mostra:

- Status atual de autenticação
- Informações do usuário e perfil
- Última verificação realizada
- Botão para forçar verificação manual
- Instruções de teste

## 🔒 Segurança

### Medidas Implementadas:
1. **Verificação dupla:** Middleware (server) + Hook (client)
2. **Limpeza de cookies:** Remove tokens de autenticação no logout
3. **Redirecionamento seguro:** Redireciona para login com parâmetros de erro
4. **Logs de segurança:** Console logs para auditoria
5. **Fallback gracioso:** Em caso de erro de rede, não faz logout imediato

### Logs de Auditoria:
- `🔍 [AUTH-GUARD] Verificando validade do usuário...`
- `✅ [AUTH-GUARD] Usuário válido`
- `🚨 [AUTH-GUARD] Logout automático: [motivo]`
- `⚠️ [AUTH-GUARD] Perfil não encontrado - usuário excluído`
- `❌ [AUTH-GUARD] Erro ao buscar perfil`

## 🚀 Próximos Passos

1. **Métricas:** Implementar coleta de métricas de segurança
2. **Alertas:** Sistema de alertas para administradores
3. **Auditoria:** Log de eventos de segurança no banco
4. **Rate Limiting:** Limitar tentativas de verificação
5. **Cache:** Cache inteligente para reduzir consultas

## 📝 Notas Importantes

- O sistema é tolerante a falhas de rede temporárias
- Verificações são feitas apenas para usuários logados
- O middleware protege rotas server-side
- O hook protege componentes client-side
- Logs detalhados facilitam debugging e auditoria
- Sistema funciona tanto em desenvolvimento quanto produção