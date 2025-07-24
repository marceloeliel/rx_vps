-- Criar função para criar a tabela dados_agencia
CREATE OR REPLACE FUNCTION create_dados_agencia_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar tabela se não existir
  CREATE TABLE IF NOT EXISTS dados_agencia (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
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
    servicos_oferecidos text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
  );

  -- Criar índices
  CREATE INDEX IF NOT EXISTS idx_dados_agencia_user_id ON dados_agencia(user_id);
  CREATE INDEX IF NOT EXISTS idx_dados_agencia_cnpj ON dados_agencia(cnpj);
  CREATE INDEX IF NOT EXISTS idx_dados_agencia_cidade ON dados_agencia(cidade);
  CREATE INDEX IF NOT EXISTS idx_dados_agencia_estado ON dados_agencia(estado);

  -- Habilitar RLS
  ALTER TABLE dados_agencia ENABLE ROW LEVEL SECURITY;

  -- Criar políticas de segurança
  CREATE POLICY "Users can view own agency data" ON dados_agencia
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can update own agency data" ON dados_agencia
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own agency data" ON dados_agencia
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own agency data" ON dados_agencia
    FOR DELETE USING (auth.uid() = user_id);

  -- Criar trigger para atualizar updated_at
  CREATE OR REPLACE FUNCTION update_dados_agencia_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  CREATE TRIGGER update_dados_agencia_updated_at
    BEFORE UPDATE ON dados_agencia
    FOR EACH ROW
    EXECUTE FUNCTION update_dados_agencia_updated_at();

  RAISE NOTICE 'Tabela dados_agencia criada/atualizada com sucesso';
END;
$$; 