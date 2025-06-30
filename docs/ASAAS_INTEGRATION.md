# Integração com Asaas - Documentação Completa

## Visão Geral

Esta documentação descreve como configurar e usar a integração com a API do Asaas para processar pagamentos no sistema RX Autos.

## Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [APIs Disponíveis](#apis-disponíveis)
5. [Como Usar](#como-usar)
6. [Webhooks](#webhooks)
7. [Testes](#testes)
8. [Troubleshooting](#troubleshooting)

## Configuração Inicial

### 1. Criar Conta no Asaas

1. Acesse [https://asaas.com](https://asaas.com)
2. Crie uma conta gratuita
3. Ative sua conta e complete a documentação necessária
4. Acesse o painel e vá em **Configurações** > **Integrações** > **API**

### 2. Obter Chaves da API

**Para Ambiente de Sandbox (Desenvolvimento):**
1. No painel do Asaas, vá em **Configurações** > **Sandbox**
2. Copie sua chave de API do sandbox
3. Esta chave geralmente começa com `$aact_YTU5YTE0M...`

**Para Ambiente de Produção:**
1. No painel do Asaas, vá em **Configurações** > **Integrações** > **API**
2. Gere uma nova chave de API
3. Esta chave geralmente começa com `$aact_YTU5YTE0M...`

### 3. Configurar Webhook

1. No painel do Asaas, vá em **Configurações** > **Webhooks**
2. Clique em **Novo Webhook**
3. Configure:
   - **Nome**: RX Autos Webhook
   - **URL**: `https://seu-dominio.com/api/webhooks/asaas`
   - **Eventos**: Selecione todos os eventos de pagamento
   - **Versão da API**: v3
   - **Ativo**: Sim

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Chaves da API do Asaas
ASAAS_SANDBOX_API_KEY=sua_chave_de_sandbox_aqui
ASAAS_API_KEY=sua_chave_de_producao_aqui

# URL do webhook (ajuste conforme seu domínio)
ASAAS_WEBHOOK_URL=http://localhost:3000/api/webhooks/asaas

# Configurações do Supabase (se ainda não estiverem definidas)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## Estrutura do Banco de Dados

Execute o script SQL localizado em `scripts/create-payments-tables.sql` no seu banco Supabase:

```sql
-- Este script criará as seguintes tabelas:
-- 1. payments - Para armazenar histórico de pagamentos
-- 2. subscriptions - Para armazenar assinaturas recorrentes
-- 3. Adiciona colunas na tabela profiles para integração com Asaas
```

### Tabelas Criadas

#### `payments`
- Armazena todos os pagamentos processados
- Integrada com a API do Asaas
- Políticas RLS configuradas

#### `subscriptions`
- Armazena assinaturas recorrentes
- Integrada com a API do Asaas
- Políticas RLS configuradas

#### Colunas Adicionadas em `profiles`
- `asaas_customer_id`: ID do cliente no Asaas
- `asaas_subscription_id`: ID da assinatura no Asaas
- `plano_payment_method`: Método de pagamento preferido
- `plano_valor`: Valor do plano atual

## APIs Disponíveis

### 1. Clientes (`/api/asaas/customers`)

**POST** - Criar cliente
```typescript
const response = await fetch('/api/asaas/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@email.com',
    cpfCnpj: '12345678900',
    phone: '1199999999',
    // ... outros campos
  })
})
```

**GET** - Listar clientes
```typescript
const response = await fetch('/api/asaas/customers?name=João')
```

### 2. Pagamentos (`/api/asaas/payments`)

**POST** - Criar pagamento
```typescript
const response = await fetch('/api/asaas/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: 'cus_000005492849',
    billingType: 'PIX',
    value: 49.90,
    dueDate: '2024-12-31',
    description: 'Plano Básico - Dezembro 2024',
    saveToDatabase: true
  })
})
```

**GET** - Listar pagamentos
```typescript
const response = await fetch('/api/asaas/payments?status=RECEIVED')
```

### 3. Assinaturas (`/api/asaas/subscriptions`)

**POST** - Criar assinatura
```typescript
const response = await fetch('/api/asaas/subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: 'cus_000005492849',
    billingType: 'CREDIT_CARD',
    value: 49.90,
    nextDueDate: '2024-12-01',
    cycle: 'MONTHLY',
    description: 'Plano Básico Mensal',
    planId: 'basico',
    saveToDatabase: true
  })
})
```

## Como Usar

### 1. Hook Personalizado

Use o hook `useAsaas` para facilitar as operações:

```typescript
import { useAsaas } from '@/hooks/use-asaas'

export default function CheckoutPage() {
  const {
    loading,
    createCustomer,
    createPixPayment,
    createCreditCardPayment,
    createMonthlySubscription
  } = useAsaas()

  const handlePixPayment = async () => {
    // Primeiro, criar o cliente (se necessário)
    const { data: customer } = await createCustomer({
      name: 'João Silva',
      email: 'joao@email.com',
      cpfCnpj: '12345678900'
    })

    if (customer) {
      // Criar pagamento PIX
      const { data: payment } = await createPixPayment(
        customer.id,
        49.90,
        'Plano Básico - Pagamento único'
      )

      if (payment) {
        console.log('Pagamento PIX criado:', payment)
        // Mostrar QR Code para o usuário
      }
    }
  }

  const handleSubscription = async () => {
    // Criar assinatura mensal
    const { data: subscription } = await createMonthlySubscription(
      customerId,
      49.90,
      'Plano Básico Mensal',
      'basico',
      'CREDIT_CARD',
      creditCardData,
      holderInfo
    )

    if (subscription) {
      console.log('Assinatura criada:', subscription)
    }
  }

  return (
    // Sua UI aqui
  )
}
```

### 2. Integração no Checkout Existente

Modifique a página `app/checkout/page.tsx` para usar o Asaas:

```typescript
// Substituir a função handlePayment existente
const handlePayment = async () => {
  setIsProcessing(true)

  try {
    // 1. Criar ou obter cliente no Asaas
    const customerData = {
      name: formData.nomeCompleto,
      email: formData.email,
      cpfCnpj: formData.cpf.replace(/\D/g, ''),
      phone: formData.telefone.replace(/\D/g, ''),
      // ... outros dados
    }

    const { data: customer } = await createCustomer(customerData)
    
    if (!customer) {
      throw new Error('Erro ao criar cliente')
    }

    // 2. Processar pagamento baseado no método escolhido
    let result

    if (paymentMethod === 'pix') {
      result = await createPixPayment(
        customer.id,
        calculatePrice(),
        `${selectedPlan.name} - ${billingCycle === 'anual' ? 'Anual' : 'Mensal'}`
      )
    } else if (paymentMethod === 'cartao') {
      const creditCardData = {
        holderName: formData.nomeCartao,
        number: formData.numeroCartao.replace(/\s/g, ''),
        expiryMonth: formData.validade.split('/')[0],
        expiryYear: '20' + formData.validade.split('/')[1],
        ccv: formData.cvv
      }

      const holderInfo = {
        name: formData.nomeCompleto,
        email: formData.email,
        cpfCnpj: formData.cpf.replace(/\D/g, ''),
        postalCode: '00000000', // CEP se disponível
        addressNumber: '1', // Número se disponível
        phone: formData.telefone.replace(/\D/g, '')
      }

      if (billingCycle === 'mensal') {
        result = await createMonthlySubscription(
          customer.id,
          calculatePrice(),
          `${selectedPlan.name} - Assinatura Mensal`,
          selectedPlan.id,
          'CREDIT_CARD',
          creditCardData,
          holderInfo
        )
      } else {
        result = await createCreditCardPayment(
          customer.id,
          calculatePrice(),
          `${selectedPlan.name} - Pagamento Anual`,
          creditCardData,
          holderInfo
        )
      }
    } else if (paymentMethod === 'boleto') {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 3) // 3 dias para vencer
      
      result = await createBoletoPayment(
        customer.id,
        selectedPlan.price, // Sempre mensal para boleto
        `${selectedPlan.name} - Boleto`,
        dueDate.toISOString().split('T')[0]
      )
    }

    if (result?.data) {
      toast({
        title: 'Sucesso!',
        description: 'Pagamento processado com sucesso',
      })

      // Redirecionar baseado no tipo de pagamento
      if (paymentMethod === 'pix') {
        setPixCode(result.data.pixQrCode)
        setShowPixDetails(true)
      } else if (paymentMethod === 'boleto') {
        window.open(result.data.bankSlipUrl, '_blank')
      } else {
        router.push('/perfil?payment=success')
      }
    }

  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Erro',
      description: 'Erro ao processar pagamento',
    })
  } finally {
    setIsProcessing(false)
  }
}
```

## Webhooks

O sistema está configurado para receber notificações do Asaas automaticamente. Quando um pagamento é processado, o Asaas enviará uma notificação para `https://seu-dominio.com/api/webhooks/asaas`.

### Eventos Tratados

- `PAYMENT_CREATED`: Pagamento criado
- `PAYMENT_RECEIVED`: Pagamento recebido
- `PAYMENT_CONFIRMED`: Pagamento confirmado
- `PAYMENT_OVERDUE`: Pagamento vencido
- `PAYMENT_REFUNDED`: Pagamento estornado
- E muitos outros...

### Ações Automáticas

- **Pagamento Confirmado**: Ativa o plano do usuário
- **Pagamento Vencido**: Pode desativar o plano (configurável)
- **Pagamento Estornado**: Desativa o plano
- **Atualização de Status**: Mantém sincronizado com o banco local

## Testes

### 1. Ambiente Sandbox

Configure `NODE_ENV=development` para usar automaticamente o sandbox:

```typescript
// A biblioteca detecta automaticamente o ambiente
const isProduction = process.env.NODE_ENV === 'production'
const apiUrl = isProduction ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3'
```

### 2. Cartões de Teste

Para testes com cartão no sandbox:

```
Cartão de Crédito Aprovado:
- Número: 5162306219378829
- Vencimento: 12/2028
- CVV: 318

Cartão de Crédito Rejeitado:
- Número: 5162306219378837
- Vencimento: 12/2028
- CVV: 318
```

### 3. PIX de Teste

No sandbox, todos os PIX são aprovados automaticamente após 30 segundos.

### 4. Boletos de Teste

No sandbox, você pode forçar a aprovação de boletos através da API.

## Troubleshooting

### Problemas Comuns

#### 1. Erro 401 - Unauthorized
```
Causa: Chave de API inválida ou não configurada
Solução: Verificar se a chave está correta no .env.local
```

#### 2. Erro 400 - Bad Request
```
Causa: Dados obrigatórios não enviados
Solução: Verificar se todos os campos obrigatórios estão preenchidos
```

#### 3. Webhook não recebido
```
Causa: URL do webhook incorreta ou inacessível
Solução: 
- Verificar se a URL está acessível publicamente
- Usar ngrok para desenvolvimento local
- Verificar logs do servidor
```

#### 4. Cliente já existe
```
Causa: Tentativa de criar cliente com CPF/CNPJ já cadastrado
Solução: Buscar cliente existente antes de criar novo
```

### Logs de Debug

Para ativar logs detalhados, adicione no `.env.local`:

```env
DEBUG=asaas:*
```

### Ferramentas de Teste

1. **Postman/Insomnia**: Para testar APIs diretamente
2. **ngrok**: Para expor localhost para webhooks
3. **Logs do Asaas**: Acompanhar no painel do Asaas

## URLs Importantes

- **Documentação oficial**: https://docs.asaas.com/
- **Painel Sandbox**: https://sandbox.asaas.com/
- **Painel Produção**: https://app.asaas.com/
- **Status da API**: https://status.asaas.com/

## Suporte

Em caso de problemas:

1. Verificar logs do servidor
2. Consultar documentação oficial do Asaas
3. Verificar status da API do Asaas
4. Contatar suporte técnico do Asaas se necessário

---

**Última atualização**: Dezembro 2024 