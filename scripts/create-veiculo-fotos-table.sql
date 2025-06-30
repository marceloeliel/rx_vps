-- Criar tabela para armazenar múltiplas fotos dos veículos
CREATE TABLE IF NOT EXISTS veiculo_fotos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    veiculo_id uuid REFERENCES veiculos(id) ON DELETE CASCADE,
    url_foto text NOT NULL,
    ordem integer DEFAULT 1,
    descricao text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_veiculo_fotos_veiculo_id ON veiculo_fotos(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_veiculo_fotos_ordem ON veiculo_fotos(veiculo_id, ordem);

-- Habilitar RLS (Row Level Security)
ALTER TABLE veiculo_fotos ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem fotos de seus próprios veículos
CREATE POLICY "Users can view own vehicle photos" ON veiculo_fotos
    FOR SELECT USING (
        veiculo_id IN (
            SELECT id FROM veiculos WHERE user_id = auth.uid()
        )
    );

-- Política para usuários inserirem fotos em seus próprios veículos
CREATE POLICY "Users can insert own vehicle photos" ON veiculo_fotos
    FOR INSERT WITH CHECK (
        veiculo_id IN (
            SELECT id FROM veiculos WHERE user_id = auth.uid()
        )
    );

-- Política para usuários atualizarem fotos de seus próprios veículos
CREATE POLICY "Users can update own vehicle photos" ON veiculo_fotos
    FOR UPDATE USING (
        veiculo_id IN (
            SELECT id FROM veiculos WHERE user_id = auth.uid()
        )
    );

-- Política para usuários deletarem fotos de seus próprios veículos
CREATE POLICY "Users can delete own vehicle photos" ON veiculo_fotos
    FOR DELETE USING (
        veiculo_id IN (
            SELECT id FROM veiculos WHERE user_id = auth.uid()
        )
    );

-- Política para visualização pública de fotos de veículos ativos
CREATE POLICY "Public can view active vehicle photos" ON veiculo_fotos
    FOR SELECT USING (
        veiculo_id IN (
            SELECT id FROM veiculos WHERE status = 'ativo'
        )
    );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_veiculo_fotos_updated_at 
    BEFORE UPDATE ON veiculo_fotos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
