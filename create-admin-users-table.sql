-- Criar tabela admin_users para controle de acesso administrativo
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_admin ON admin_users(is_admin);

-- Habilitar RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Admin users can view admin records" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_admin = true
    )
  );

CREATE POLICY "Admin users can manage admin records" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_admin = true
    )
  );

-- Inserir primeiro usuário admin (substitua pelo ID do seu usuário)
-- INSERT INTO admin_users (user_id, is_admin, permissions) 
-- VALUES ('SEU_USER_ID_AQUI', true, '{"full_access"}');

-- Comentários para documentação
COMMENT ON TABLE admin_users IS 'Tabela para controle de acesso administrativo';
COMMENT ON COLUMN admin_users.is_admin IS 'Define se o usuário tem privilégios de administrador';
COMMENT ON COLUMN admin_users.permissions IS 'Array de permissões específicas do usuário';