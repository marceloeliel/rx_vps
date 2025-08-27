-- Script para corrigir a constraint UNIQUE na tabela vehicle_leads
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vehicle_leads'
) as table_exists;

-- 2. Remover registros duplicados se existirem
-- (Manter apenas o mais recente de cada combinação user_id + vehicle_id)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY user_id, vehicle_id 
           ORDER BY created_at DESC
         ) as rn
  FROM vehicle_leads
)
DELETE FROM vehicle_leads 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Adicionar a constraint UNIQUE necessária
ALTER TABLE vehicle_leads 
DROP CONSTRAINT IF EXISTS vehicle_leads_user_vehicle_unique;

ALTER TABLE vehicle_leads 
ADD CONSTRAINT vehicle_leads_user_vehicle_unique 
UNIQUE (user_id, vehicle_id);

-- 4. Verificar se a constraint foi criada
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'vehicle_leads'
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- 5. Testar a constraint com uma inserção de teste
-- (Esta query deve falhar na segunda execução)
INSERT INTO vehicle_leads (user_id, vehicle_id, agency_id, lead_type)
VALUES (
  'test-user-id',
  'test-vehicle-id', 
  'test-agency-id',
  'test'
)
ON CONFLICT (user_id, vehicle_id) 
DO UPDATE SET 
  lead_type = EXCLUDED.lead_type,
  updated_at = NOW();

-- 6. Limpar dados de teste
DELETE FROM vehicle_leads 
WHERE user_id = 'test-user-id' 
  AND vehicle_id = 'test-vehicle-id';

-- 7. Mostrar estrutura final da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vehicle_leads'
ORDER BY ordinal_position;