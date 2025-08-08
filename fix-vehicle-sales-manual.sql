-- Script para corrigir a estrutura da tabela vehicle_sales
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Adicionar colunas de referência
ALTER TABLE vehicle_sales 
ADD COLUMN IF NOT EXISTS vehicle_id UUID,
ADD COLUMN IF NOT EXISTS agency_id UUID,
ADD COLUMN IF NOT EXISTS buyer_id UUID,
ADD COLUMN IF NOT EXISTS seller_id UUID;

-- 2. Adicionar informações do veículo
ALTER TABLE vehicle_sales 
ADD COLUMN IF NOT EXISTS vehicle_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS vehicle_brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100),
ADD COLUMN IF NOT EXISTS vehicle_year INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_price DECIMAL(12,2);

-- 3. Adicionar informações financeiras
ALTER TABLE vehicle_sales 
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(12,2);

-- 4. Adicionar informações do comprador
ALTER TABLE vehicle_sales 
ADD COLUMN IF NOT EXISTS buyer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS buyer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS buyer_document VARCHAR(20);

-- 5. Adicionar status e outras informações
ALTER TABLE vehicle_sales 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS contract_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- 6. Adicionar timestamps e metadados
ALTER TABLE vehicle_sales 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 7. Adicionar constraints de check para status
ALTER TABLE vehicle_sales 
DROP CONSTRAINT IF EXISTS vehicle_sales_status_check;

ALTER TABLE vehicle_sales 
ADD CONSTRAINT vehicle_sales_status_check 
CHECK (status IN ('pendente', 'negociacao', 'concluida', 'cancelada'));

-- 8. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_seller_id ON vehicle_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_buyer_id ON vehicle_sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_created_at ON vehicle_sales(created_at);

-- 9. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_vehicle_sales_updated_at ON vehicle_sales;
CREATE TRIGGER update_vehicle_sales_updated_at
    BEFORE UPDATE ON vehicle_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Opcional: Adicionar foreign keys (descomente se necessário)
-- ALTER TABLE vehicle_sales 
-- ADD CONSTRAINT fk_vehicle_sales_vehicle_id 
-- FOREIGN KEY (vehicle_id) REFERENCES veiculos(id) ON DELETE CASCADE;

-- ALTER TABLE vehicle_sales 
-- ADD CONSTRAINT fk_vehicle_sales_agency_id 
-- FOREIGN KEY (agency_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ALTER TABLE vehicle_sales 
-- ADD CONSTRAINT fk_vehicle_sales_seller_id 
-- FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ALTER TABLE vehicle_sales 
-- ADD CONSTRAINT fk_vehicle_sales_buyer_id 
-- FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Verificar se tudo foi criado corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vehicle_sales' 
ORDER BY ordinal_position;