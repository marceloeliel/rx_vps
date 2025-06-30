-- Criar tabela dados_agencia se não existir (versão simplificada)
CREATE TABLE IF NOT EXISTS dados_agencia (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    inscricao_estadual VARCHAR(50),
    ano_fundacao INTEGER,
    especialidades TEXT,
    telefone_principal VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    endereco TEXT,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    total_vendedores INTEGER DEFAULT 0,
    total_clientes INTEGER DEFAULT 0,
    vendas_mes INTEGER DEFAULT 0,
    vendas_ano INTEGER DEFAULT 0,
    logo_url TEXT,
    descricao TEXT,
    horario_funcionamento TEXT,
    servicos_oferecidos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dados_agencia_user_id ON dados_agencia(user_id);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_cnpj ON dados_agencia(cnpj);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_cidade ON dados_agencia(cidade);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_estado ON dados_agencia(estado);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_created_at ON dados_agencia(created_at);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_nome_fantasia ON dados_agencia(nome_fantasia);

-- Comentários para documentação
COMMENT ON TABLE dados_agencia IS 'Tabela para armazenar informações detalhadas das agências';
COMMENT ON COLUMN dados_agencia.id IS 'Identificador único da agência';
COMMENT ON COLUMN dados_agencia.user_id IS 'Identificador do usuário associado à agência';
COMMENT ON COLUMN dados_agencia.cnpj IS 'CNPJ da agência (único)';
COMMENT ON COLUMN dados_agencia.servicos_oferecidos IS 'Lista de serviços oferecidos pela agência (JSON como texto)';
COMMENT ON COLUMN dados_agencia.total_vendedores IS 'Total de vendedores da agência (padrão 0)';
COMMENT ON COLUMN dados_agencia.total_clientes IS 'Total de clientes da agência (padrão 0)';
COMMENT ON COLUMN dados_agencia.vendas_mes IS 'Vendas do mês (padrão 0)';
COMMENT ON COLUMN dados_agencia.vendas_ano IS 'Vendas do ano (padrão 0)';
