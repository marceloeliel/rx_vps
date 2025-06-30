# Sistema de Controle de Assinatura

## 📋 Visão Geral

Sistema completo de controle de assinatura que bloqueia automaticamente o acesso às funcionalidades quando a assinatura expira. Implementa controle granular por plano e funcionalidade.

## ✅ Funcionalidades Implementadas

### 🔒 **Controle de Acesso por Assinatura**
- ✅ Bloqueio automático após 30 dias (mensal) ou 365 dias (anual)
- ✅ Aviso de renovação 3 dias antes do vencimento
- ✅ Tela de bloqueio para usuários com assinatura vencida
- ✅ Controle granular por funcionalidade e plano

### 📊 **Limites por Plano**

#### **Plano Básico (R$ 49,90/mês)**
- ✅ Até 5 veículos
- ✅ 10 fotos por veículo
- ✅ Anúncios básicos
- ✅ Suporte por email
- ❌ Anúncios destacados
- ❌ Acesso à API

#### **Plano Profissional (R$ 99,90/mês)**
- ✅ Até 20 veículos
- ✅ 15 fotos por veículo
- ✅ Anúncios destacados
- ✅ Suporte prioritário
- ✅ Estatísticas avançadas
- ✅ Acesso à API
- ❌ Painel administrativo

#### **Plano Empresarial (R$ 199,90/mês)**
- ✅ Veículos ilimitados
- ✅ 20 fotos por veículo
- ✅ Anúncios premium
- ✅ Suporte 24/7
- ✅ Estatísticas completas
- ✅ Acesso à API
- ✅ Painel administrativo
- ✅ Múltiplos usuários

## 🛠️ Componentes Implementados

### 1. **Hook useSubscription**
```typescript
// hooks/use-subscription.ts
const { 
  subscriptionStatus,    // Status da assinatura
  hasFeatureAccess,     // Verificar acesso a funcionalidade
  getPlanLimits,        // Obter limites do plano
  renewSubscription     // Renovar assinatura
} = useSubscription()
```

### 2. **Componente SubscriptionGuard**
```typescript
// Proteção de funcionalidade específica
<SubscriptionGuard feature="create_vehicle">
  <VeiculoForm />
</SubscriptionGuard>

// Proteção geral (qualquer assinatura ativa)
<SubscriptionGuard>
  <ConteudoProtegido />
</SubscriptionGuard>
```

### 3. **Componente FeatureLimitReached**
```typescript
<FeatureLimitReached 
  feature="unlimited_vehicles"
  currentPlan="basico"
  upgradeAction={() => window.location.href = "/planos"}
/>
```

## 📅 Cálculo de Datas de Vencimento

### **Pagamento Mensal**
```javascript
// Vence em 30 dias
const dataFim = new Date(now)
dataFim.setDate(dataFim.getDate() + 30)
```

### **Pagamento Anual**
```javascript
// Vence em 1 ano (365 dias)
const dataFim = new Date(now)
dataFim.setFullYear(dataFim.getFullYear() + 1)
```

## 🔧 Integração com Checkout

O sistema está integrado ao checkout para ativar automaticamente o plano após o pagamento:

```javascript
// app/checkout/page.tsx
const updateData = {
  plano_atual: selectedPlan.id,
  plano_data_inicio: now.toISOString(),
  plano_data_fim: dataFim.toISOString(),
  plano_payment_id: newPayment.id,
  asaas_customer_id: newCustomer.id
}
```

## 🎯 Páginas Protegidas

### **Implementadas**
- ✅ `/cadastro-veiculo` - Criar veículos
- ✅ `/meus-veiculos` - Gerenciar veículos
- ✅ `/teste-assinatura` - Página de demonstração

### **A Implementar**
- 🔄 `/painel-agencia` - Painel administrativo
- 🔄 `/relatorios` - Relatórios avançados
- 🔄 `/api/*` - Endpoints da API

## 📱 Interface do Usuário

### **Tela de Assinatura Vencida**
- 🔒 Ícone de bloqueio
- 📅 Data de vencimento
- ⏰ Dias em atraso
- 💳 Botão de renovação
- 📞 Informações de contato

### **Avisos de Renovação**
- ⚠️ Alerta amarelo 3 dias antes
- 🔔 Notificação persistente
- 💳 Botão de renovação rápida

### **Indicadores de Limite**
- 📊 Progresso de uso
- 🚫 Bloqueio ao atingir limite
- ⬆️ Sugestão de upgrade

## 🧪 Como Testar

### **1. Acesse a Página de Teste**
```
http://localhost:3000/teste-assinatura
```

### **2. Simular Cenários**

#### **Usuário sem Assinatura**
```sql
-- No Supabase SQL Editor
UPDATE profiles 
SET plano_atual = NULL, plano_data_fim = NULL 
WHERE id = 'USER_ID';
```

#### **Assinatura Vencida**
```sql
-- Definir data de vencimento no passado
UPDATE profiles 
SET plano_data_fim = '2024-01-01T00:00:00.000Z' 
WHERE id = 'USER_ID';
```

#### **Assinatura Próxima do Vencimento**
```sql
-- Definir vencimento em 2 dias
UPDATE profiles 
SET plano_data_fim = (NOW() + INTERVAL '2 days')::timestamp 
WHERE id = 'USER_ID';
```

#### **Diferentes Planos**
```sql
-- Plano Básico
UPDATE profiles 
SET plano_atual = 'basico', 
    plano_data_fim = (NOW() + INTERVAL '30 days')::timestamp 
WHERE id = 'USER_ID';

-- Plano Profissional
UPDATE profiles 
SET plano_atual = 'profissional', 
    plano_data_fim = (NOW() + INTERVAL '30 days')::timestamp 
WHERE id = 'USER_ID';

-- Plano Empresarial
UPDATE profiles 
SET plano_atual = 'empresarial', 
    plano_data_fim = (NOW() + INTERVAL '30 days')::timestamp 
WHERE id = 'USER_ID';
```

## 🔄 Fluxo de Renovação

### **1. Detecção de Vencimento**
- Sistema verifica data de vencimento em tempo real
- Calcula dias restantes automaticamente

### **2. Avisos Progressivos**
- **7 dias**: Notificação discreta
- **3 dias**: Aviso prominente
- **1 dia**: Alerta crítico
- **Vencido**: Bloqueio total

### **3. Processo de Renovação**
- Botão "Renovar" redireciona para checkout
- Parâmetro `action=renewal` identifica renovação
- Mantém plano atual como padrão
- Ativa imediatamente após pagamento

## 📊 Monitoramento e Logs

### **Logs Implementados**
```javascript
console.log("📊 [SUBSCRIPTION] Status calculado:", status)
console.log("✅ [SUBSCRIPTION] Usuário autenticado:", user.email)
console.log("📋 [SUBSCRIPTION] Perfil carregado:", profile)
```

### **Métricas Importantes**
- Taxa de renovação por plano
- Tempo médio até renovação
- Funcionalidades mais acessadas
- Upgrades de plano

## 🚀 Próximos Passos

### **Melhorias Planejadas**
1. **Notificações por Email**
   - Avisos de vencimento automáticos
   - Lembretes de renovação

2. **Dashboard de Assinatura**
   - Histórico de pagamentos
   - Estatísticas de uso
   - Previsão de renovação

3. **Controle de Quota Dinâmico**
   - Limite de veículos em tempo real
   - Bloqueio progressivo por funcionalidade

4. **Sistema de Carência**
   - Período de graça após vencimento
   - Bloqueio gradual das funcionalidades

## 📝 Estrutura de Dados

### **Tabela profiles**
```sql
plano_atual VARCHAR(50)              -- basico, profissional, empresarial
plano_data_inicio TIMESTAMP          -- Data de ativação do plano
plano_data_fim TIMESTAMP             -- Data de vencimento do plano
plano_payment_id VARCHAR(255)        -- ID do último pagamento
asaas_customer_id VARCHAR(255)       -- ID do cliente no Asaas
asaas_subscription_id VARCHAR(255)   -- ID da assinatura no Asaas
```

### **Interface SubscriptionStatus**
```typescript
interface SubscriptionStatus {
  isActive: boolean                  // Se a assinatura está ativa
  isExpired: boolean                 // Se a assinatura expirou
  planType: string | null           // Tipo do plano atual
  expirationDate: Date | null       // Data de vencimento
  daysUntilExpiration: number | null // Dias até vencer
  hasAccess: boolean                // Se tem acesso geral
  needsRenewal: boolean             // Se precisa renovar
}
```

## ⚡ Performance

### **Otimizações Implementadas**
- ✅ Cache de status da assinatura
- ✅ Verificação em tempo real
- ✅ Queries otimizadas no Supabase
- ✅ Loading states apropriados

### **Considerações**
- Hook carrega dados uma vez por sessão
- Revalidação automática em mudanças de auth
- Estados de loading para UX fluída

## 🔐 Segurança

### **Medidas Implementadas**
- ✅ Verificação server-side nos endpoints
- ✅ RLS (Row Level Security) no Supabase
- ✅ Validação de tokens em todas as APIs
- ✅ Controle de acesso granular

### **Pontos de Atenção**
- Validar sempre no backend
- Não confiar apenas no frontend
- Logs de tentativas de acesso
- Monitoramento de anomalias

---

## 📞 Suporte

Para dúvidas sobre implementação ou problemas técnicos:
- **Email**: suporte@rxautos.com.br
- **Documentação**: `/docs/SISTEMA_CONTROLE_ASSINATURA.md`
- **Teste**: `/teste-assinatura` 