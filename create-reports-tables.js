const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecdmpndeunbzhaihabvi.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTEwNywiZXhwIjoyMDYxNTA3MTA3fQ.2CdNPp5I8RVsIqU1IJH3T_OHZDnveO7ZOZt4bn9QVn0'