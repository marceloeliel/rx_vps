# 🚀 Ocultação de Seção Promocional para Planos Ativos

## 📋 Resumo
Sistema que oculta automaticamente a seção promocional "🚀 Oportunidade Exclusiva" quando o usuário é uma agência com plano de assinatura ativo.

## 🎯 Objetivo
Evitar mostrar promoções de cadastro para usuários que já são agências pagas, melhorando a experiência do usuário e evitando confusão.

## 🔧 Implementação

### **1. Localização da Seção**
- **Arquivo**: `app/page.tsx`
- **Seção**: "🚀 Oportunidade Exclusiva" (linhas 453-540)
- **Conteúdo**: Promoção para cadastro de agências com 30 dias gratuitos

### **2. Lógica de Controle**
```typescript
// Função que determina se deve ocultar a seção
const shouldHideAgencySection = () => {
  return profile && 
         profile.tipo_usuario === 'agencia' && 
         subscriptionStatus?.hasAccess
}

// Renderização condicional
{!shouldHideAgencySection() && (
  <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Seção promocional completa */}
  </section>
)}
```

### **3. Critérios para Ocultação**
A seção é ocultada quando **TODAS** as condições são verdadeiras:

1. **Usuário logado**: `profile` existe
2. **É agência**: `profile.tipo_usuario === 'agencia'`
3. **Plano ativo**: `subscriptionStatus?.hasAccess === true`

### **4. Hook de Assinatura**
Utiliza o hook `useSubscription()` que verifica:
- Status da assinatura atual
- Data de vencimento do plano
- Tipo de usuário no perfil
- Acesso ativo aos recursos pagos

## 📱 Comportamento

### **Para Agências com Plano Ativo:**
- ✅ Seção promocional **OCULTA**
- ✅ Página mais limpa sem promoções desnecessárias
- ✅ Foco no conteúdo relevante (veículos, ferramentas)

### **Para Outros Usuários:**
- ✅ Seção promocional **VISÍVEL**
- ✅ Incentivo ao cadastro de agência
- ✅ Promoção de 30 dias gratuitos
- ✅ Call-to-action para teste gratuito

## 🧪 Como Testar

### **1. Acesse a Página de Teste**
```
/teste-esconder-promocao
```

### **2. Cenários de Teste**

#### **Cenário 1: Agência com Plano Ativo**
- Login como agência
- Ter plano ativo (não vencido)
- **Resultado**: Seção oculta

#### **Cenário 2: Usuário Comum**
- Login como usuário tipo "comum"
- **Resultado**: Seção visível

#### **Cenário 3: Agência sem Plano**
- Login como agência
- Sem plano ativo ou plano vencido
- **Resultado**: Seção visível

#### **Cenário 4: Usuário Não Logado**
- Sem login
- **Resultado**: Seção visível

## 🔍 Debugging

### **Verificar Status no Console**
```javascript
// No console do navegador
console.log({
  profile: profile,
  subscriptionStatus: subscriptionStatus,
  shouldHide: shouldHideAgencySection()
})
```

### **Dados Importantes**
- `profile.tipo_usuario`: deve ser 'agencia'
- `subscriptionStatus.hasAccess`: deve ser true
- `profile.plano_data_fim`: data de vencimento do plano
- `subscriptionStatus.status`: status da assinatura

## 📂 Arquivos Envolvidos

### **1. Página Principal**
- `app/page.tsx` - Contém a seção e lógica de ocultação

### **2. Hook de Assinatura**
- `hooks/use-subscription.ts` - Verifica status do plano

### **3. Página de Teste**
- `app/teste-esconder-promocao/page.tsx` - Teste da funcionalidade

### **4. Documentação**
- `docs/OCULTAR_PROMOCAO_PLANO_ATIVO.md` - Este arquivo

## ✅ Status de Implementação

- ✅ **Lógica implementada** em `app/page.tsx`
- ✅ **Hook de assinatura** funcionando
- ✅ **Renderização condicional** aplicada
- ✅ **Página de teste** criada
- ✅ **Documentação** completa

## 🔄 Fluxo de Funcionamento

1. **Usuário acessa a página inicial**
2. **Hook `useSubscription` carrega dados do plano**
3. **Função `shouldHideAgencySection()` avalia critérios**
4. **Renderização condicional decide se mostra/oculta**
5. **Seção aparece ou não dependendo do resultado**

## 🎨 Benefícios UX

- **Personalização**: Experiência adaptada ao tipo de usuário
- **Relevância**: Não mostra promoções desnecessárias
- **Limpeza**: Interface mais focada para usuários pagos
- **Profissionalismo**: Evita confusão sobre status do plano

## 🚨 Pontos de Atenção

- **Cache**: Dados de assinatura podem estar em cache
- **Loading**: Aguardar carregamento completo dos dados
- **Fallback**: Em caso de erro, seção deve aparecer (fail-safe)
- **Performance**: Hook não deve impactar carregamento da página 