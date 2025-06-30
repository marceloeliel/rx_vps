-- Script para criar tabela de simulações no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela simulacoes
CREATE TABLE IF NOT EXISTS public.simulacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  tipo_documento VARCHAR(2) NOT NULL CHECK (tipo_documento IN ('pf', 'pj')),
  cpf_cnpj VARCHAR(18) NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(15) NOT NULL,
  
  -- Dados do veículo
  placa VARCHAR(8),
  condicao_veiculo VARCHAR(10) NOT NULL CHECK (condicao_veiculo IN ('0km', 'seminovo')),
  tipo_veiculo VARCHAR(10) NOT NULL CHECK (tipo_veiculo IN ('carro', 'moto', 'caminhao')),
  marca VARCHAR(100) NOT NULL,
  marca_codigo VARCHAR(10) NOT NULL,
  modelo VARCHAR(200) NOT NULL,
  modelo_codigo VARCHAR(10) NOT NULL,
  ano_modelo INTEGER NOT NULL,
  ano_fabricacao INTEGER NOT NULL,
  ano_codigo VARCHAR(10) NOT NULL,
  versao VARCHAR(200),
  transmissao VARCHAR(20),
  combustivel VARCHAR(20) NOT NULL,
  codigo_fipe VARCHAR(20) NOT NULL,
  valor_veiculo DECIMAL(12,2) NOT NULL,
  entrada DECIMAL(12,2) NOT NULL,
  prazo INTEGER NOT NULL,
  
  -- Para concluir
  tempo_fechamento VARCHAR(20),
  viu_pessoalmente VARCHAR(3) CHECK (viu_pessoalmente IN ('sim', 'nao')),
  tipo_vendedor VARCHAR(30),
  
  -- Resultado da simulação
  valor_financiado DECIMAL(12,2) NOT NULL,
  valor_parcela DECIMAL(12,2) NOT NULL,
  taxa_juros DECIMAL(5,2) NOT NULL,
  aprovado BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_simulacoes_user_id ON public.simulacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_simulacoes_created_at ON public.simulacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulacoes_aprovado ON public.simulacoes(aprovado);
CREATE INDEX IF NOT EXISTS idx_simulacoes_tipo_veiculo ON public.simulacoes(tipo_veiculo);
CREATE INDEX IF NOT EXISTS idx_simulacoes_marca ON public.simulacoes(marca);
CREATE INDEX IF NOT EXISTS idx_simulacoes_email ON public.simulacoes(email);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS

-- Política para SELECT: usuários podem ver apenas suas próprias simulações
CREATE POLICY "Users can view own simulacoes" ON public.simulacoes
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT: usuários podem criar simulações para si mesmos
CREATE POLICY "Users can insert own simulacoes" ON public.simulacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários podem atualizar apenas suas próprias simulações
CREATE POLICY "Users can update own simulacoes" ON public.simulacoes
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE: usuários podem deletar apenas suas próprias simulações
CREATE POLICY "Users can delete own simulacoes" ON public.simulacoes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.simulacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Inserir dados de exemplo (opcional - remova se não quiser)
-- INSERT INTO public.simulacoes (
--   user_id, tipo_documento, cpf_cnpj, nome_completo, email, telefone,
--   placa, condicao_veiculo, tipo_veiculo, marca, marca_codigo, modelo, modelo_codigo,
--   ano_modelo, ano_fabricacao, ano_codigo, transmissao, combustivel, codigo_fipe,
--   valor_veiculo, entrada, prazo, tempo_fechamento, viu_pessoalmente, tipo_vendedor,
--   valor_financiado, valor_parcela, taxa_juros, aprovado
-- ) VALUES (
--   auth.uid(), 'pf', '123.456.789-00', 'João Silva', 'joao@email.com', '(11) 99999-9999',
--   'ABC-1234', 'seminovo', 'carro', 'Toyota', '1', 'Corolla', '100',
--   2020, 2020, '2020-1', 'Automático', 'Flex', '001234-5',
--   80000.00, 20000.00, 48, '1-mes', 'sim', 'concessionaria',
--   60000.00, 1500.00, 1.99, true
-- );

-- 8. Verificar se a tabela foi criada corretamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'simulacoes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'simulacoes';

-- Script executado com sucesso!
-- Tabela 'simulacoes' criada com:
-- ✅ Estrutura completa para todos os dados da simulação
-- ✅ Índices para performance
-- ✅ RLS habilitado com políticas de segurança
-- ✅ Trigger para updated_at automático
-- ✅ Constraints de validação
-- ✅ Relacionamento com auth.users 