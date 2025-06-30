import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Para o ambiente de pré-visualização do v0, usando credenciais diretamente
  // Em produção, use sempre variáveis de ambiente!
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ecdmpndeunbzhaihabvi.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
