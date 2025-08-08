
      -- Criar tabela para vendas de veículos
      CREATE TABLE IF NOT EXISTS vehicle_sales (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
        agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        
        -- Informações do veículo no momento da venda (baseado na estrutura real)
        vehicle_title VARCHAR(255) NOT NULL,
        vehicle_brand VARCHAR(100) NOT NULL,
        vehicle_model VARCHAR(100) NOT NULL,
        vehicle_year INTEGER NOT NULL,
        vehicle_price DECIMAL(12,2) NOT NULL,
        
        -- Informações financeiras
        sale_price DECIMAL(12,2) NOT NULL,
        commission_rate DECIMAL(5,2) DEFAULT 5.00,
        commission_amount DECIMAL(12,2) NOT NULL,
        
        -- Informações do cliente (baseado na estrutura de profiles)
        buyer_name VARCHAR(255) NOT NULL,
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(20),
        buyer_document VARCHAR(20),
        
        -- Status da venda
        status VARCHAR(50) NOT NULL DEFAULT 'pendente' 
          CHECK (status IN ('pendente', 'negociacao', 'concluida', 'cancelada')),
        
        -- Informações adicionais
        notes TEXT,
        contract_url VARCHAR(500),
        payment_method VARCHAR(50),
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        
        -- Metadados
        metadata JSONB DEFAULT '{}'
      );
      
      -- Criar índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_seller_id ON vehicle_sales(seller_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_buyer_id ON vehicle_sales(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
      CREATE INDEX IF NOT EXISTS idx_vehicle_sales_created_at ON vehicle_sales(created_at);
      
      -- Criar função para atualizar updated_at automaticamente
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Criar trigger para atualizar updated_at
      DROP TRIGGER IF EXISTS update_vehicle_sales_updated_at ON vehicle_sales;
      CREATE TRIGGER update_vehicle_sales_updated_at
          BEFORE UPDATE ON vehicle_sales
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    