-- Criar tabela dados_agencia se não existir
CREATE TABLE IF NOT EXISTS dados_agencia (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_fantasia character varying(255),
    razao_social character varying(255),
    cnpj character varying(18) UNIQUE,
    inscricao_estadual character varying(50),
    ano_fundacao integer,
    especialidades text,
    telefone_principal character varying(20),
    whatsapp character varying(20),
    email character varying(255),
    website character varying(255),
    endereco text,
    numero character varying(10),
    complemento character varying(100),
    bairro character varying(100),
    cidade character varying(100),
    estado character varying(2),
    cep character varying(9),
    total_vendedores integer DEFAULT 0,
    total_clientes integer DEFAULT 0,
    vendas_mes integer DEFAULT 0,
    vendas_ano integer DEFAULT 0,
    logo_url text,
    descricao text,
    horario_funcionamento text,
    servicos_oferecidos text[],
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dados_agencia_user_id ON dados_agencia(user_id);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_cnpj ON dados_agencia(cnpj);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_cidade ON dados_agencia(cidade);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_estado ON dados_agencia(estado);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_created_at ON dados_agencia(created_at);
CREATE INDEX IF NOT EXISTS idx_dados_agencia_nome_fantasia ON dados_agencia(nome_fantasia);

-- Habilitar RLS (Row Level Security)
ALTER TABLE dados_agencia ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas dados da própria agência
CREATE POLICY "Users can view own agency data" ON dados_agencia
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas dados da própria agência
CREATE POLICY "Users can update own agency data" ON dados_agencia
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários inserirem apenas dados da própria agência
CREATE POLICY "Users can insert own agency data" ON dados_agencia
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários deletarem apenas dados da própria agência
CREATE POLICY "Users can delete own agency data" ON dados_agencia
    FOR DELETE USING (auth.uid() = user_id);

-- Política para visualização pública de dados básicos das agências (para listagens)
CREATE POLICY "Public can view basic agency info" ON dados_agencia
    FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_dados_agencia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_dados_agencia_updated_at ON dados_agencia;
CREATE TRIGGER update_dados_agencia_updated_at 
    BEFORE UPDATE ON dados_agencia 
    FOR EACH ROW 
    EXECUTE FUNCTION update_dados_agencia_updated_at();

-- Comentários nas colunas para documentação
COMMENT ON TABLE dados_agencia IS 'Tabela para armazenar informações detalhadas das agências';
COMMENT ON COLUMN dados_agencia.id IS 'Identificador único da agência';
COMMENT ON COLUMN dados_agencia.user_id IS 'Identificador do usuário associado à agência';
COMMENT ON COLUMN dados_agencia.cnpj IS 'CNPJ da agência (único)';
COMMENT ON COLUMN dados_agencia.servicos_oferecidos IS 'Lista de serviços oferecidos pela agência';
COMMENT ON COLUMN dados_agencia.total_vendedores IS 'Total de vendedores da agência (padrão 0)';
COMMENT ON COLUMN dados_agencia.total_clientes IS 'Total de clientes da agência (padrão 0)';
COMMENT ON COLUMN dados_agencia.vendas_mes IS 'Vendas do mês (padrão 0)';
COMMENT ON COLUMN dados_agencia.vendas_ano IS 'Vendas do ano (padrão 0)';
