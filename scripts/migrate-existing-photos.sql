-- Migrar fotos existentes do campo 'fotos' para a nova tabela veiculo_fotos
INSERT INTO veiculo_fotos (veiculo_id, url_foto, ordem)
SELECT 
    v.id as veiculo_id,
    unnest(v.fotos) as url_foto,
    generate_series(1, array_length(v.fotos, 1)) as ordem
FROM veiculos v
WHERE v.fotos IS NOT NULL 
AND array_length(v.fotos, 1) > 0
ON CONFLICT DO NOTHING;

-- Inserir foto principal como primeira foto se não existir
INSERT INTO veiculo_fotos (veiculo_id, url_foto, ordem)
SELECT 
    v.id as veiculo_id,
    v.foto_principal as url_foto,
    0 as ordem
FROM veiculos v
WHERE v.foto_principal IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM veiculo_fotos vf 
    WHERE vf.veiculo_id = v.id 
    AND vf.url_foto = v.foto_principal
)
ON CONFLICT DO NOTHING;
