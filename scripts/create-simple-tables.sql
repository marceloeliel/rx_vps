-- Script simplificado para criar as tabelas necessárias
-- Este script funciona sem dependências de schemas externos

-- Criar tabela dados_agencia
CREATE TABLE IF NOT EXISTS dados_agencia (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    nome_fantasia TEXT,
    razao_social TEXT,
    cnpj TEXT UNIQUE,
    inscricao_estadual TEXT,
    ano_fundacao INTEGER,
    especialidades TEXT,
    telefone_principal TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    endereco TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    total_vendedores INTEGER DEFAULT 0,
    total_clientes INTEGER DEFAULT 0,
    vendas_mes INTEGER DEFAULT 0,
    vendas_ano INTEGER DEFAULT 0,
    logo_url TEXT,
    descricao TEXT,
    horario_funcionamento TEXT,
    servicos_oferecidos TEXT, -- JSON como string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela agencia_logos (opcional)
CREATE TABLE IF NOT EXISTS agencia_logos (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    mime_type TEXT,
    file_size INTEGER,
    public_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- Cada usuário pode ter apenas uma logo
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dados_agencia_user_id ON dados_agencia(user_id);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_cnpj ON dados_agencia(cnpj);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_cidade ON dados_agencia(cidade);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_estado ON dados_agencia(estado);

CREATE INDEX IF NOT EXISTS idx_agencia_logos_user_id ON agencia_logos(user_id);

-- Inserir dados de exemplo (opcional)
INSERT INTO dados_agencia (
    user_id, nome_fantasia, razao_social, cnpj, cidade, estado, 
    telefone_principal, email, total_vendedores, total_clientes,
    especialidades, servicos_oferecidos
) VALUES 
(
    'demo-user-1', 
    'Auto Center Premium', 
    'Auto Center Premium Ltda', 
    '12345678000195',
    'São Paulo', 
    'SP',
    '(11) 3000-0000',
    'contato@autopremium.com.br',
    5,
    150,
    'Carros de luxo, Veículos seminovos, Financiamento facilitado',
    '["Venda de veículos", "Financiamento", "Seguro", "Documentação"]'
),
(
    'demo-user-2',
    'Motos & Cia',
    'Motos e Companhia Ltda',
    '98765432000187',
    'Rio de Janeiro',
    'RJ',
    '(21) 2000-0000',
    'vendas@motosecia.com.br',
    3,
    80,
    'Motos esportivas, Scooters, Peças e acessórios',
    '["Venda de motos", "Manutenção", "Peças", "Acessórios"]'
)
ON CONFLICT (cnpj) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE dados_agencia IS 'Tabela para armazenar informações das agências';
COMMENT ON TABLE agencia_logos IS 'Tabela para armazenar logos das agências';
