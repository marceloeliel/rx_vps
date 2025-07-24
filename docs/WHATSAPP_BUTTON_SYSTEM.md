# Sistema de Botões WhatsApp - RX Autos

## Visão Geral

Sistema completo de botões WhatsApp flutuantes e contextuais para melhorar a experiência do usuário e facilitar o contato direto com a RX Autos.

## Componentes Disponíveis

### 1. WhatsAppFloatButton (Padrão)

Botão flutuante fixo que aparece em todas as páginas.

```tsx
import { WhatsAppFloatButton } from '@/components/whatsapp-float-button'

// Uso básico
<WhatsAppFloatButton />

// Personalizado
<WhatsAppFloatButton
  phoneNumber="5573999377300"
  message="Mensagem personalizada"
  context="veiculo"
  showBusinessHours={true}
/>
```

**Funcionalidades:**
- Tooltip interativo com informações
- Indicador de horário comercial (verde = online, laranja = offline)
- Animações de pulsação e ondas
- Auto-show após 1 segundo
- Tooltip automático após 3 segundos

### 2. WhatsAppFloatButtonCompact

Versão compacta para dispositivos móveis ou casos específicos.

```tsx
import { WhatsAppFloatButtonCompact } from '@/components/whatsapp-float-button'

<WhatsAppFloatButtonCompact
  context="planos"
  message="Interesse em planos de assinatura"
/>
```

### 3. WhatsAppInlineButton

Botão para usar dentro de cards, formulários ou seções específicas.

```tsx
import { WhatsAppInlineButton } from '@/components/whatsapp-float-button'

// Variantes disponíveis
<WhatsAppInlineButton variant="default">WhatsApp</WhatsAppInlineButton>
<WhatsAppInlineButton variant="outline">Falar no WhatsApp</WhatsAppInlineButton>
<WhatsAppInlineButton variant="ghost">Contato</WhatsAppInlineButton>
```

## Hook useWhatsApp

Gerencia configurações e funcionalidades do WhatsApp.

```tsx
import { useWhatsApp } from '@/hooks/use-whatsapp'

function MeuComponente() {
  const { 
    config, 
    isBusinessHours, 
    openWhatsApp, 
    getContextualMessage, 
    updateConfig 
  } = useWhatsApp({
    phoneNumber: "5573999377300",
    defaultMessage: "Olá da RX Autos!",
    businessHours: {
      start: "08:00",
      end: "18:00", 
      days: [1, 2, 3, 4, 5] // Segunda a sexta
    }
  })

  const handleClick = () => {
    const message = getContextualMessage('veiculo')
    openWhatsApp(message)
  }

  return (
    <button onClick={handleClick}>
      Status: {isBusinessHours ? 'Online' : 'Offline'}
    </button>
  )
}
```

## Contextos Disponíveis

O sistema suporta mensagens contextuais baseadas na seção do site:

```tsx
type Context = 'veiculo' | 'agencia' | 'planos' | 'suporte' | 'vendas'
```

**Mensagens por contexto:**
- `veiculo`: "Gostaria de saber mais informações sobre um veículo específico."
- `agencia`: "Gostaria de falar sobre parcerias para agências."
- `planos`: "Gostaria de saber mais sobre os planos de assinatura."
- `suporte`: "Preciso de suporte técnico."
- `vendas`: "Gostaria de anunciar meu veículo."

## Configurações

### Configuração Global

Definida em `hooks/use-whatsapp.ts`:

```tsx
const DEFAULT_CONFIG = {
  phoneNumber: "5573999377300",
  defaultMessage: "Olá! Gostaria de saber mais informações sobre os veículos da RX Autos.",
  businessHours: {
    start: "08:00",
    end: "18:00",
    days: [1, 2, 3, 4, 5] // Segunda a sexta
  }
}
```

### Horário Comercial

O sistema verifica automaticamente se está dentro do horário comercial:
- **Verde**: Horário comercial ativo
- **Laranja**: Fora do horário comercial
- Verificação a cada minuto
- Configurável por componente

## Implementação nas Páginas

### Layout Principal (Global)

```tsx
// app/layout.tsx
import { WhatsAppFloatButton } from '@/components/whatsapp-float-button'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
        <WhatsAppFloatButton /> {/* Aparece em todas as páginas */}
      </body>
    </html>
  )
}
```

### Uso Contextual em Cards

```tsx
// Exemplo em card de veículo
<div className="vehicle-card">
  <h3>Honda Civic 2022</h3>
  <p>R$ 89.900</p>
  
  <WhatsAppInlineButton
    context="veiculo"
    message="Olá! Vi o Honda Civic 2022 no site e gostaria de mais informações."
  >
    Tenho Interesse
  </WhatsAppInlineButton>
</div>
```

### Página de Agências

```tsx
<WhatsAppInlineButton
  context="agencia"
  variant="outline"
  message="Olá! Sou uma agência e gostaria de saber sobre parcerias."
>
  Quero ser Parceiro
</WhatsAppInlineButton>
```

## Funcionalidades Técnicas

### Responsividade

- **Desktop**: Botão 56x56px (14 x 14 classes Tailwind)
- **Mobile**: Botão 48x48px (12 x 12 classes Tailwind)
- Tooltip adapta largura em telas pequenas

### Acessibilidade

```tsx
// Implementações de acessibilidade
aria-label="Abrir WhatsApp"
title="Falar no WhatsApp"
focus:outline-none focus:ring-4 focus:ring-green-300/50
```

### Animações

- **Pulse**: Botão principal quando fora do horário
- **Ping**: Efeito de ondas quando online
- **Scale**: Hover e click effects
- **Tooltip**: Slide in/out com opacity

### Performance

- Lazy loading: Componente aparece após 1s
- Timers limpos no unmount
- Verificação de horário a cada minuto (não a cada segundo)

## Estilização

### Cores WhatsApp

```css
bg-[#25D366] /* Verde WhatsApp padrão */
hover:bg-[#20BA5A] /* Verde escuro no hover */
```

### Variantes de Botão

```tsx
const variants = {
  default: "bg-[#25D366] hover:bg-[#20BA5A] text-white",
  outline: "border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white",
  ghost: "text-[#25D366] hover:bg-[#25D366]/10"
}
```

## Página de Teste

Acesse `/teste-whatsapp` para ver todos os componentes em ação:

- Exemplos de todos os tipos de botão
- Diferentes contextos e mensagens
- Configurações ativas
- Funcionalidades implementadas

## Manutenção

### Alterar Número de Telefone

```tsx
// 1. Globalmente no hook
const DEFAULT_CONFIG = {
  phoneNumber: "5511999999999" // Novo número
}

// 2. Por componente
<WhatsAppFloatButton phoneNumber="5511999999999" />
```

### Alterar Horário Comercial

```tsx
const businessHours = {
  start: "09:00",
  end: "17:00", 
  days: [1, 2, 3, 4, 5, 6] // Segunda a sábado
}
```

### Desabilitar em Páginas Específicas

```tsx
// Ocultar botão flutuante global
const shouldShowWhatsApp = !pathname.includes('/admin')

{shouldShowWhatsApp && <WhatsAppFloatButton />}
```

## Benefícios Implementados

✅ **Sempre Acessível**: Botão flutuante fixo em todas as páginas
✅ **Contextual**: Mensagens específicas por seção
✅ **Visual Atrativo**: Animações e indicadores de status  
✅ **Responsivo**: Funciona bem em desktop e mobile
✅ **Acessível**: ARIA labels e navegação por teclado
✅ **Performance**: Lazy loading e otimizações
✅ **Flexível**: 3 tipos de botão para diferentes usos
✅ **Inteligente**: Horário comercial automático
✅ **Personalizável**: Fácil de configurar e manter

## Próximos Passos

- [ ] Integração com sistema de notificações
- [ ] Métricas de cliques/conversões
- [ ] A/B testing de mensagens
- [ ] Integração com chatbot
- [ ] Multi-idiomas 