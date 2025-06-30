-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo text NOT NULL,
    email text,
    whatsapp text,
    tipo_usuario text,
    documento text,
    cep text,
    endereco text,
    numero text,
    complemento text,
    bairro text,
    cidade text,
    estado text,
    perfil_configurado boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    cpf text,
    cnpj text,
    foto_perfil text,
    plano_atual text,
    plano_data_fim timestamp without time zone,
    plano_data_inicio timestamp without time zone,
    plano_payment_id text,
    asaas_customer_id text,
    PRIMARY KEY (id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_tipo_usuario ON profiles(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_profiles_perfil_configurado ON profiles(perfil_configurado);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para usuários inserirem apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
