-- Criar tabela para simular storage de logos
CREATE TABLE IF NOT EXISTS agencia_logos (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size INTEGER,
    file_data BYTEA, -- Para armazenar o arquivo como binário
    public_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- Cada usuário pode ter apenas uma logo
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_agencia_logos_user_id ON agencia_logos(user_id);
CREATE INDEX IF NOT EXISTS idx_agencia_logos_filename ON agencia_logos(filename);

-- Comentários
COMMENT ON TABLE agencia_logos IS 'Tabela para armazenar logos das agências';
COMMENT ON COLUMN agencia_logos.file_data IS 'Dados binários do arquivo de logo';
COMMENT ON COLUMN agencia_logos.public_url IS 'URL pública para acesso à logo';
