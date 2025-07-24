-- Verificar se a tabela user_subscriptions existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'user_subscriptions';

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_subscriptions';

-- Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_subscriptions'; 