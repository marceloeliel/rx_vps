# Teste: Esconder Card de Agência quando tem Plano Ativo

## 🎯 Objetivo

Verificar se o card "Expanda seu negócio com a RX Autos" é escondido quando:
- Usuário é do tipo "agencia" 
- E tem uma assinatura ativa (hasAccess = true)

## 🧪 Como Testar

### 1. **Página de Teste**
```
http://localhost:3000/teste-esconder-card-agencia
```

### 2. **Cenários para Testar**

#### ✅ **Card DEVE APARECER quando:**
- Usuário tipo "particular" (qualquer situação de assinatura)
- Usuário tipo "agencia" SEM assinatura ativa
- Usuário não logado

#### ❌ **Card DEVE SER ESCONDIDO quando:**
- Usuário tipo "agencia" COM assinatura ativa

### 3. **Passos do Teste**

1. **Acesse a página de teste**
2. **Teste Cenário 1 - Card Visível:**
   - Clique em "Tornar Particular"
   - Clique em "Recarregar Dados"
   - Verifique: Status deve ser "❌ CARD VISÍVEL"

3. **Teste Cenário 2 - Card Visível (agência sem plano):**
   - Clique em "Tornar Agência"
   - Clique em "Recarregar Dados"
   - Verifique: Status deve ser "❌ CARD VISÍVEL"

4. **Teste Cenário 3 - Card Escondido:**
   - Certifique-se que é agência (passo anterior)
   - Clique em um dos planos (Básico/Premium/Premium Plus)
   - Aguarde e clique em "Recarregar Dados"
   - Verifique: Status deve ser "✅ CARD ESCONDIDO"

5. **Confirme na página inicial:**
   - Vá para `http://localhost:3000`
   - Verifique se o card realmente não aparece

## 🔍 **Lógica do Código**

### Arquivo: `app/page.tsx`
```typescript
const shouldHideAgencySection = () => {
  return profile && 
         profile.tipo_usuario === 'agencia' && 
         subscriptionStatus?.hasAccess
}
```

### Uso no JSX:
```typescript
{!shouldHideAgencySection() && (
  <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Card "Expanda seu negócio com a RX Autos" */}
  </section>
)}
```

## 🛠️ **Implementação**

### Arquivos Modificados:
- `hooks/use-subscription.ts` - Atualizado para usar novo sistema de assinaturas
- `app/page.tsx` - Já tinha a lógica `shouldHideAgencySection()` implementada
- `app/teste-esconder-card-agencia/page.tsx` - Página de teste criada

### Como Funciona:
1. Hook `useSubscription` busca dados da API `/api/subscriptions`
2. Retorna `subscriptionStatus.hasAccess` baseado no status da assinatura
3. Página inicial verifica se `tipo_usuario === 'agencia'` E `hasAccess === true`
4. Se ambas condições forem verdadeiras, esconde o card

## ✅ **Status da Implementação**

- ✅ Hook atualizado para novo sistema
- ✅ Lógica de esconder implementada
- ✅ Página de teste criada
- ✅ Documentação criada

## 🚀 **Pronto para Produção**

O sistema já está funcionando! Agências com planos ativos não verão mais o card de promoção na página inicial. 