-- Adicionar coluna veiculo_id na tabela simulacoes
-- Esta coluna armazenará o ID do veículo quando a simulação for feita a partir de um veículo específico

-- Adicionar a coluna veiculo_id (opcional, pode ser null para simulações genéricas)
ALTER TABLE simulacoes 
ADD COLUMN veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL;

-- Adicionar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_simulacoes_veiculo_id ON simulacoes(veiculo_id);

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN simulacoes.veiculo_id IS 'ID do veículo específico usado na simulação (opcional)';

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'simulacoes' 
AND column_name = 'veiculo_id'; 