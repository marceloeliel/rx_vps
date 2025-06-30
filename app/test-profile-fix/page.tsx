"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { upsertUserProfile } from "@/lib/supabase/profiles"
import { CheckCircle, AlertTriangle, Loader2, User } from "lucide-react"

export default function TestProfileFixPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)
  const [message, setMessage] = useState<string>("")
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()

  // Carregar usuário automaticamente
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [supabase])

  const testProfileSave = async () => {
    if (!user) {
      setResult('error')
      setMessage("Usuário não logado. Faça login primeiro.")
      return
    }

    setLoading(true)
    setResult(null)
    setMessage("")

    try {
      console.log("🧪 Testando salvamento de perfil...")
      
      const testData = {
        nome_completo: "Teste de Correção",
        email: user.email || "teste@email.com",
        tipo_usuario: "comprador" as "comprador" | "vendedor" | "agencia",
        telefone: "11999999999"
      }

      const result = await upsertUserProfile(user.id, testData)

      if (result) {
        console.log("✅ Teste bem-sucedido!")
        setResult('success')
        setMessage("✅ Perfil salvo com sucesso! O problema foi corrigido.")
      } else {
        setResult('error')
        setMessage("❌ Função retornou null. Verifique os logs do console.")
      }
    } catch (error: any) {
      console.error("❌ Erro no teste:", error)
      setResult('error')
      
      if (error.message.includes("ERRO CRÍTICO")) {
        setMessage(`❌ ${error.message}\n\nExecute o comando SQL no Supabase:\nALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`)
      } else {
        setMessage(`❌ Erro: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔧 Teste de Correção do Perfil</h1>
        <p className="text-gray-600">Verificar se o problema de salvamento foi resolvido</p>
      </div>

      <div className="space-y-6">
        {/* Status do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Status do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-700">Usuário logado</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div><strong>ID:</strong> {user.id}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-700">Nenhum usuário logado</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teste */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Salvamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Este teste tentará salvar um perfil de exemplo para verificar se o problema foi corrigido.
            </p>
            
            <Button 
              onClick={testProfileSave} 
              disabled={loading || !user}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Testando...
                </>
              ) : (
                "🧪 Executar Teste"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Alert className={result === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {result === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Corrigir o Problema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <strong>1. Acesse o Supabase SQL Editor</strong>
              <p className="text-gray-600">Vá para supabase.com → Seu Projeto → SQL Editor</p>
            </div>
            
            <div>
              <strong>2. Execute o comando SQL:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
              </div>
            </div>
            
            <div>
              <strong>3. Teste novamente</strong>
              <p className="text-gray-600">Volte aqui e clique em "Executar Teste"</p>
            </div>
            
            <div className="border-t pt-4">
              <strong>💡 Dica:</strong>
              <p className="text-gray-600">
                Verifique o console do navegador (F12) para logs detalhados durante o teste.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 