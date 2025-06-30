-- Adicionar coluna tipo_veiculo na tabela veiculos
ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS tipo_veiculo character varying(20) DEFAULT 'carro';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_veiculos_tipo ON veiculos(tipo_veiculo);

-- Comentário para documentação
COMMENT ON COLUMN veiculos.tipo_veiculo IS 'Tipo do veículo: carro, moto, caminhao, maquina_pesada';
