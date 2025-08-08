-- Script SQL completo para criar/corrigir a tabela vehicle_sales
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos dropar a tabela existente se ela existir (cuidado com dados!)
-- DROP TABLE IF EXISTS vehicle_sales CASCADE;

-- Criar a tabela vehicle_sales com todas as colunas necessárias
CREATE TABLE IF NOT EXISTS vehicle_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- IDs de referência
    vehicle_id UUID REFERENCES veiculos(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Informações do veículo
    vehicle_title VARCHAR(255),
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    vehicle_price DECIMAL(12,2),
    
    -- Informações financeiras
    sale_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Porcentagem
    commission_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Informações do comprador
    buyer_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_phone VARCHAR(20),
    buyer_cpf VARCHAR(14),
    
    -- Status da venda
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'negotiation', 'completed', 'cancelled')),
    
    -- Informações adicionais
    notes TEXT,
    contract_url VARCHAR(500),
    payment_method VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados adicionais
    metadata JSONB DEFAULT '{}'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_buyer_id ON vehicle_sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_created_at ON vehicle_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_sale_price ON vehicle_sales(sale_price);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_vehicle_sales_updated_at ON vehicle_sales;
CREATE TRIGGER update_vehicle_sales_updated_at
    BEFORE UPDATE ON vehicle_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE vehicle_sales ENABLE ROW LEVEL SECURITY;

-- Política RLS para agências verem apenas suas vendas
CREATE POLICY "Agencies can view their own sales" ON vehicle_sales
    FOR SELECT USING (agency_id = auth.uid());

CREATE POLICY "Agencies can insert their own sales" ON vehicle_sales
    FOR INSERT WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Agencies can update their own sales" ON vehicle_sales
    FOR UPDATE USING (agency_id = auth.uid());

CREATE POLICY "Agencies can delete their own sales" ON vehicle_sales
    FOR DELETE USING (agency_id = auth.uid());

-- Inserir alguns dados de exemplo (opcional)
-- INSERT INTO vehicle_sales (
--     agency_id,
--     vehicle_title,
--     vehicle_brand,
--     vehicle_model,
--     vehicle_year,
--     vehicle_price,
--     sale_price,
--     buyer_name,
--     buyer_email,
--     buyer_phone,
--     status
-- ) VALUES (
--     (SELECT id FROM profiles WHERE email = 'sua-agencia@email.com' LIMIT 1),
--     'Civic EXL 2020',
--     'Honda',
--     'Civic',
--     2020,
--     85000.00,
--     82000.00,
--     'João Silva',
--     'joao@email.com',
--     '(11) 99999-9999',
--     'completed'
-- );

-- Verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehicle_sales' 
ORDER BY ordinal_position;

-- Verificar se a tabela foi criada corretamente
SELECT COUNT(*) as total_records FROM vehicle_sales;

-- Comentário final
-- Este script cria a tabela vehicle_sales completa com:
-- 1. Todas as colunas necessárias incluindo agency_id
-- 2. Índices para performance
-- 3. Trigger para updated_at
-- 4. Políticas RLS para segurança
-- 5. Constraints e validações

-- Para executar:
-- 1. Copie todo este código
-- 2. Cole no Supabase SQL Editor
-- 3. Execute o script
-- 4. Verifique se não há erros
-- 5. Teste a função getAgencySalesStats novamente