-- Criar tabela de veículos
CREATE TABLE IF NOT EXISTS veiculos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_fipe character varying(10),
    marca_nome character varying(100) NOT NULL,
    modelo_nome character varying(100) NOT NULL,
    titulo character varying(200) NOT NULL,
    descricao text,
    ano_fabricacao integer NOT NULL,
    ano_modelo integer NOT NULL,
    quilometragem integer DEFAULT 0,
    preco numeric(12,2) NOT NULL,
    tipo_preco character varying(20) DEFAULT 'fixo',
    cor character varying(50),
    combustivel character varying(20),
    cambio character varying(20),
    portas integer,
    final_placa character varying(1),
    status character varying(20) DEFAULT 'ativo',
    destaque boolean DEFAULT false,
    vendido_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    aceita_financiamento boolean DEFAULT false,
    aceita_troca boolean DEFAULT false,
    aceita_parcelamento boolean DEFAULT false,
    parcelas_maximas integer,
    entrada_minima numeric(10,2),
    foto_principal text,
    fotos text[],
    video text,
    estado_veiculo text DEFAULT 'usado',
    profile_id uuid REFERENCES profiles(id),
    user_id uuid REFERENCES auth.users(id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_veiculos_user_id ON veiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_profile_id ON veiculos(profile_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_marca_modelo ON veiculos(marca_nome, modelo_nome);
CREATE INDEX IF NOT EXISTS idx_veiculos_status ON veiculos(status);
CREATE INDEX IF NOT EXISTS idx_veiculos_preco ON veiculos(preco);
CREATE INDEX IF NOT EXISTS idx_veiculos_ano ON veiculos(ano_fabricacao, ano_modelo);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_veiculos_updated_at 
    BEFORE UPDATE ON veiculos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios veículos
CREATE POLICY "Users can view own vehicles" ON veiculos
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários inserirem veículos
CREATE POLICY "Users can insert own vehicles" ON veiculos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios veículos
CREATE POLICY "Users can update own vehicles" ON veiculos
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem seus próprios veículos
CREATE POLICY "Users can delete own vehicles" ON veiculos
    FOR DELETE USING (auth.uid() = user_id);

-- Política para visualização pública de veículos ativos
CREATE POLICY "Public can view active vehicles" ON veiculos
    FOR SELECT USING (status = 'ativo');
