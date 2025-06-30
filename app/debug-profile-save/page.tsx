"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { upsertUserProfile } from "@/lib/supabase/profiles"
import { toast } from "sonner"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function DebugProfileSavePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()

  // Dados de teste
  const [testData, setTestData] = useState({
    nome_completo: "João da Silva Teste",
    email: "joao.teste@email.com",
    telefone: "11999999999",
    cpf: "11144477735",
    tipo_usuario: "vendedor" as "comprador" | "vendedor" | "agencia"
  })

  // Carregar usuário atual
  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user?.email) {
      setTestData(prev => ({ ...prev, email: user.email! }))
    }
  }

  // Teste 1: UPSERT direto no Supabase
  const testDirectUpsert = async () => {
    if (!user) {
      toast.error("Faça login primeiro!")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🧪 [TEST] Testando UPSERT direto...")
      
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          nome_completo: testData.nome_completo,
          email: testData.email,
          telefone: testData.telefone,
          cpf: testData.cpf?.replace(/\D/g, ""),
          tipo_usuario: testData.tipo_usuario,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "id"
        })
        .select()
        .single()

      if (error) {
        console.error("❌ [TEST] Erro no UPSERT direto:", error)
        setError(`Erro UPSERT: ${JSON.stringify(error, null, 2)}`)
      } else {
        console.log("✅ [TEST] UPSERT direto funcionou!")
        setResult(data)
        toast.success("UPSERT direto funcionou!")
      }
    } catch (err: any) {
      console.error("❌ [TEST] Erro inesperado:", err)
      setError(`Erro inesperado: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Teste 2: Função upsertUserProfile
  const testUpsertFunction = async () => {
    if (!user) {
      toast.error("Faça login primeiro!")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🧪 [TEST] Testando função upsertUserProfile...")
      
      const result = await upsertUserProfile(user.id, testData)

      if (result) {
        console.log("✅ [TEST] Função upsertUserProfile funcionou!")
        setResult(result)
        toast.success("Função funcionou!")
      } else {
        setError("Função retornou null")
      }
    } catch (err: any) {
      console.error("❌ [TEST] Erro na função:", err)
      setError(`Erro na função: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug: Salvamento de Perfil</h1>
        <p className="text-gray-600">Página para testar e debugar problemas de salvamento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Controles */}
        <div className="space-y-4">
          {/* Status do usuário */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={loadUser} variant="outline" className="w-full">
                  Carregar Usuário Atual
                </Button>
                {user ? (
                  <div className="text-sm space-y-1">
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum usuário carregado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dados de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={testData.nome_completo}
                  onChange={(e) => setTestData(prev => ({ ...prev, nome_completo: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={testData.email}
                  onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={testData.telefone}
                  onChange={(e) => setTestData(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </div>
              <div>
                <Label>CPF</Label>
                <Input
                  value={testData.cpf}
                  onChange={(e) => setTestData(prev => ({ ...prev, cpf: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Testes */}
          <Card>
            <CardHeader>
              <CardTitle>Testes de Salvamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={testDirectUpsert} 
                disabled={loading || !user}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                1. Teste UPSERT Direto
              </Button>
              
              <Button 
                onClick={testUpsertFunction} 
                disabled={loading || !user}
                className="w-full"
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                2. Teste Função upsertUserProfile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-4">
          {/* Resultado */}
          {result && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="font-semibold text-green-800 mb-2">✅ Sucesso!</div>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {/* Erro */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="font-semibold text-red-800 mb-2">❌ Erro</div>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                  {error}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>1. Primeiro, carregue o usuário atual</div>
              <div>2. Execute os testes na ordem para identificar onde está o problema</div>
              <div>3. Se todos falharem, execute o script SQL de emergência</div>
              <div>4. Verifique o console do navegador para logs detalhados</div>
            </CardContent>
          </Card>

          {/* Script SQL */}
          <Card>
            <CardHeader>
              <CardTitle>Script SQL de Emergência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs bg-gray-100 p-2 rounded">
                <div>Execute no Supabase SQL Editor:</div>
                <code className="block mt-1">
                  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 