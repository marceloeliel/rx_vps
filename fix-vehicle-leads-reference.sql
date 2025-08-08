-- Script para corrigir as referências das tabelas de leads e reports
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Corrigir tabela vehicle_leads
ALTER TABLE IF EXISTS vehicle_leads 
DROP CONSTRAINT IF EXISTS vehicle_leads_agency_id_fkey;

ALTER TABLE IF EXISTS vehicle_leads 
ADD CONSTRAINT vehicle_leads_agency_id_fkey 
FOREIGN KEY (agency_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. Corrigir tabela lead_sources
ALTER TABLE IF EXISTS lead_sources 
DROP CONSTRAINT IF EXISTS lead_sources_agency_id_fkey;

ALTER TABLE IF EXISTS lead_sources 
ADD CONSTRAINT lead_sources_agency_id_fkey 
FOREIGN KEY (agency_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Adicionar constraint UNIQUE necessária para ON CONFLICT
ALTER TABLE IF EXISTS lead_sources 
ADD CONSTRAINT IF NOT EXISTS lead_sources_agency_source_unique 
UNIQUE (agency_id, source_name);

-- 3. Corrigir tabela performance_metrics
ALTER TABLE IF EXISTS performance_metrics 
DROP CONSTRAINT IF EXISTS performance_metrics_agency_id_fkey;

ALTER TABLE IF EXISTS performance_metrics 
ADD CONSTRAINT performance_metrics_agency_id_fkey 
FOREIGN KEY (agency_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. Corrigir tabela customer_satisfaction
ALTER TABLE IF EXISTS customer_satisfaction 
DROP CONSTRAINT IF EXISTS customer_satisfaction_agency_id_fkey;

ALTER TABLE IF EXISTS customer_satisfaction 
ADD CONSTRAINT customer_satisfaction_agency_id_fkey 
FOREIGN KEY (agency_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. Corrigir tabela lead_tracking
ALTER TABLE IF EXISTS lead_tracking 
DROP CONSTRAINT IF EXISTS lead_tracking_agency_id_fkey;

ALTER TABLE IF EXISTS lead_tracking 
ADD CONSTRAINT lead_tracking_agency_id_fkey 
FOREIGN KEY (agency_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 6. Criar tabelas se não existirem com as referências corretas
CREATE TABLE IF NOT EXISTS vehicle_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lead_type TEXT NOT NULL CHECK (lead_type IN ('favorite', 'contact_whatsapp', 'contact_email', 'view_details')),
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, vehicle_id)
);

CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    lead_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(agency_id, source_name)
);