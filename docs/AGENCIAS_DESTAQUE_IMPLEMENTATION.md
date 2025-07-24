# Implementação: Agências em Destaque - Planos Ativos

## 📋 Resumo
Implementação de sistema que conecta a seção "Agências em Destaque" às agências reais da plataforma, exibindo apenas agências com planos de assinatura ativos e direcionando os botões para as agências específicas.

## 🎯 Objetivos Implementados

### 1. **Filtro por Planos Ativos**
- ✅ Exibir apenas agências com cadastro na plataforma
- ✅ Verificar se a agência tem plano de assinatura ativo
- ✅ Conectar anúncios pagos às agências reais

### 2. **Redirecionamento de Botões**
- ✅ Botão "Entrar em Contato" usa WhatsApp da agência específica
- ✅ Botão "Ver Estoque" direciona para página de veículos filtrada por agência

## 🔧 Implementações Técnicas

### **1. Estrutura de Dados**
- **Tabela**: `paid_ads`
- **Nova Coluna**: `agencia_id` (referência para `dados_agencia.id`)
- **Índice**: `idx_paid_ads_agencia_id` para performance

### **2. Função `getActivePaidAds()` Atualizada**
```typescript
// Busca anúncios pagos conectados a agências reais
// Verifica planos ativos através de JOIN com:
// - dados_agencia (informações da agência)
// - profiles (dados do plano: plano_atual, plano_data_fim)
// Retorna apenas agências com planos vigentes
```

### **3. Interface `PaidAd` Ampliada**
```typescript
export interface PaidAd {
  // ... campos existentes
  agencia_id?: string           // ID da agência
  agencia_user_id?: string      // ID do usuário proprietário
  agencia_whatsapp?: string     // WhatsApp da agência
  agencia_telefone?: string     // Telefone da agência
  agencia_email?: string        // Email da agência
  agencia_slug?: string         // Slug da agência
}
```

### **4. Botões Inteligentes**
- **Contato**: Prioriza WhatsApp da agência, fallback para número da RX
- **Estoque**: URL `/veiculos?agencia={user_id}` para filtrar por agência

### **5. Filtro de Veículos por Agência**
```typescript
// Função getVeiculosPublicos() atualizada
// Novo parâmetro: agencia (user_id)
// Filtro SQL: WHERE user_id = agencia_param
```

## 📊 Fluxo de Funcionamento

### **1. Carregamento de Anúncios**
```
1. Buscar anúncios pagos ativos com agencia_id
2. Fazer JOIN com dados_agencia
3. Fazer JOIN com profiles para verificar plano
4. Filtrar apenas planos vigentes (plano_data_fim > NOW())
5. Retornar lista de anúncios válidos
```

### **2. Interação do Usuário**
```
Botão "Entrar em Contato":
- Captura WhatsApp da agência
- Abre WhatsApp com mensagem personalizada
- Fallback para número da RX se não houver WhatsApp

Botão "Ver Estoque":
- Redireciona para /veiculos?agencia=USER_ID
- Filtra veículos apenas da agência específica
```

## 🗄️ Scripts SQL

### **Migração de Estrutura**
```sql
-- Adicionar coluna de referência
ALTER TABLE paid_ads 
ADD COLUMN IF NOT EXISTS agencia_id TEXT REFERENCES dados_agencia(id) ON DELETE SET NULL;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_paid_ads_agencia_id ON paid_ads(agencia_id);

-- Conectar anúncios existentes
UPDATE paid_ads 
SET agencia_id = (
  SELECT id FROM dados_agencia 
  WHERE nome_fantasia ILIKE paid_ads.company_name 
  LIMIT 1
)
WHERE agencia_id IS NULL AND company_name IS NOT NULL;
```

## 🔄 Verificação de Planos

### **Critérios de Validação**
```sql
-- Agência deve ter:
1. Registro na tabela dados_agencia
2. Perfil na tabela profiles
3. Campo plano_atual preenchido
4. Campo plano_data_fim > data atual
```

### **Estados de Plano**
- **Ativo**: `plano_data_fim > NOW()`
- **Inativo**: `plano_data_fim <= NOW()` ou `NULL`
- **Sem plano**: `plano_atual = NULL`

## 📱 Funcionalidades Mobile

### **Responsividade**
- Botões mantêm funcionalidade em todas as telas
- Links do WhatsApp funcionam corretamente em dispositivos móveis
- Filtros de agência funcionam em navegadores mobile

## 🛠️ Manutenção

### **Arquivos Modificados**
- `lib/supabase/paid-ads.ts` - Lógica de busca e validação
- `components/PaidAdsSection.tsx` - Botões e interface
- `lib/supabase/veiculos.ts` - Filtro por agência
- `app/veiculos/page.tsx` - Captura de parâmetros URL

### **Arquivos Criados**
- `scripts/update-paid-ads-structure.sql` - Migração da estrutura
- `docs/AGENCIAS_DESTAQUE_IMPLEMENTATION.md` - Esta documentação

## 🎯 Benefícios

1. **Precisão**: Apenas agências reais com planos ativos
2. **Conversão**: Botões direcionam para agências específicas
3. **Experiência**: Usuário vai direto ao WhatsApp da agência
4. **Monetização**: Incentiva agências a manter planos ativos
5. **Organização**: Filtragem de veículos por agência

## 🚀 Próximos Passos

1. **Executar migração SQL** no banco de produção
2. **Testar filtros** com dados reais
3. **Configurar anúncios** conectando às agências
4. **Monitorar performance** das consultas JOIN
5. **Adicionar métricas** de cliques por agência

---

**Status**: ✅ Implementado e pronto para uso
**Última atualização**: Janeiro 2025 