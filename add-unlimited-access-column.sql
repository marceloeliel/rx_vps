-- Adicionar coluna unlimited_access na tabela profiles
ALTER TABLE profiles 
ADD COLUMN unlimited_access BOOLEAN DEFAULT FALSE;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_unlimited_access 
ON profiles(unlimited_access);

-- Comentário explicativo
COMMENT ON COLUMN profiles.unlimited_access IS 'Indica se o usuário tem acesso ilimitado concedido pelo administrador';