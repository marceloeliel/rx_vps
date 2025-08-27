# 🔧 Solução para o Erro de Vehicle Leads

## 🚨 Problema Identificado

O erro `"there is no unique or exclusion constraint matching the ON CONFLICT specification"` ocorre porque:

1. ✅ A tabela `vehicle_leads` existe
2. ❌ A constraint `UNIQUE (user_id, vehicle_id)` **NÃO** existe
3. ❌ Isso impede o uso de `upsert` com `onConflict`

## 💡 Solução

### Passo 1: Executar SQL no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/ecdmpndeunbzhaihabvi/sql
2. Execute este SQL:

```sql
-- Remover constraint existente se houver
ALTER TABLE vehicle_leads 
DROP CONSTRAINT IF EXISTS vehicle_leads_user_vehicle_unique;

-- Adicionar constraint UNIQUE necessária
ALTER TABLE vehicle_leads 
ADD CONSTRAINT vehicle_leads_user_vehicle_unique 
UNIQUE (user_id, vehicle_id);

-- Verificar se foi criada
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'vehicle_leads'
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name;
```

### Passo 2: Testar a Correção

Após executar o SQL acima, execute:

```bash
node test-lead-creation.js
```

## 🎯 Resultado Esperado

Após a correção:

1. ✅ A função `createLead` funcionará corretamente
2. ✅ O `upsert` com `onConflict: 'user_id,vehicle_id'` funcionará
3. ✅ Não haverá mais erros de "ON CONFLICT specification"
4. ✅ Leads duplicados serão atualizados em vez de causar erro

## 📋 Arquivos Modificados

- `lib/supabase/vehicle-favorites.ts` - Função `createLead` otimizada
- `components/veiculo-detalhes-modal.tsx` - Correção do `agency_id`

## 🔍 Scripts de Diagnóstico Criados

- `check-vehicle-leads-constraints.js` - Verificar constraints
- `apply-vehicle-leads-fix.js` - Aplicar correção automaticamente
- `test-lead-creation.js` - Testar criação de leads
- `fix-vehicle-leads-constraint.sql` - SQL manual para correção

## ⚡ Execução Rápida

1. **Execute o SQL no Supabase Dashboard** (link acima)
2. **Teste**: `node test-lead-creation.js`
3. **Verifique a aplicação** em http://localhost:3000/veiculos

---

**Status**: ⏳ Aguardando execução do SQL no Supabase Dashboard