-- Script para atualizar estrutura da tabela paid_ads
-- Conectar anúncios pagos às agências reais da plataforma

-- Adicionar coluna agencia_id na tabela paid_ads (corrigido para UUID)
ALTER TABLE paid_ads 
ADD COLUMN IF NOT EXISTS agencia_id UUID REFERENCES dados_agencia(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_paid_ads_agencia_id ON paid_ads(agencia_id);

-- Atualizar anúncios existentes com agencias reais (exemplo)
-- Conectar anúncios baseado no nome da empresa
UPDATE paid_ads 
SET agencia_id = (
  SELECT id 
  FROM dados_agencia 
  WHERE nome_fantasia ILIKE paid_ads.company_name 
  LIMIT 1
)
WHERE agencia_id IS NULL 
AND company_name IS NOT NULL;

-- Comentário na nova coluna
COMMENT ON COLUMN paid_ads.agencia_id IS 'Referência para a agência real na tabela dados_agencia';

-- Verificar resultados da atualização
SELECT 
  p.id,
  p.company_name,
  p.agencia_id,
  a.nome_fantasia,
  a.cidade,
  a.estado,
  prof.plano_atual,
  prof.plano_data_fim
FROM paid_ads p
LEFT JOIN dados_agencia a ON p.agencia_id = a.id
LEFT JOIN profiles prof ON a.user_id = prof.id
ORDER BY p.position_order; 