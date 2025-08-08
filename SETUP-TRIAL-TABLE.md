# Configuração da Tabela Trial Periods

Para que a barra de notificação do período de teste funcione corretamente, é necessário criar a tabela `trial_periods` no Supabase.

## Passos para criar a tabela:

1. Acesse o painel do Supabase (https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Navegue até "SQL Editor"
4. Execute o seguinte SQL:

```sql
CREATE TABLE IF NOT EXISTS trial_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'premium', 'premium_plus')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  converted_to_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_periods_end_date ON trial_periods(end_date);

-- Habilitar RLS (Row Level Security)
ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios períodos de teste
CREATE POLICY "Users can view own trial periods" ON trial_periods
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserção (apenas o próprio usuário)
CREATE POLICY "Users can insert own trial periods" ON trial_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualização (apenas o próprio usuário)
CREATE POLICY "Users can update own trial periods" ON trial_periods
  FOR UPDATE USING (auth.uid() = user_id);
```

## Após criar a tabela:

1. No arquivo `components/trial-notification-bar.tsx`, substitua o código temporário:
   - Remova as linhas que simulam dados
   - Descomente e use o hook `useTrial`

2. O componente ficará assim:

```tsx
"use client"

import { useTrial } from "@/hooks/use-trial"
import { useUserData } from "@/hooks/use-user-data"
// ... outros imports

export function TrialNotificationBar() {
  const { user } = useUserData()
  const { isInTrial, daysRemaining, loading } = useTrial()
  const [isVisible, setIsVisible] = useState(true)

  if (!user || loading || !isInTrial || !isVisible) {
    return null
  }
  
  // ... resto do componente
}
```

## Status Atual:

✅ Componente TrialNotificationBar criado
✅ Hook useTrial implementado
✅ Funções do Supabase para trial implementadas
⏳ Tabela trial_periods precisa ser criada manualmente
⏳ Dados simulados sendo usados temporariamente

## Funcionalidades da Barra:

- Mostra contador de dias restantes do período de teste
- Muda cor conforme proximidade do fim (verde → amarelo → vermelho)
- Botão para ver planos disponíveis
- Botão para fechar a notificação
- Mensagens específicas para diferentes situações:
  - Mais de 7 dias: "Você tem X dias restantes no seu período gratuito"
  - 3-7 dias: "Seu período gratuito expira em X dias"
  - 1-2 dias: "Último dia do período gratuito" / "Período gratuito expira amanhã"
  - Expirado: "Período gratuito expirado - confirme sua assinatura em 3 dias"