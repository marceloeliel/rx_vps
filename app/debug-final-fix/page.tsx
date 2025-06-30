"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  RefreshCw,
  Plus,
  Search,
} from "lucide-react"

interface UserProfile {
  id: string
  nome_completo?: string
  email?: string
  whatsapp?: string
  asaas_customer_id?: string
  created_at: string
  updated_at: string
}

export default function DebugFinalFixPage() {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([])
  const [authLoading, setAuthLoading] = useState(true)
  const [fixAttempts, setFixAttempts] = useState(0)

  const supabase = createClient()

  // Carregar usuário atual
  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error("Erro ao carregar usuário:", error)
        toast.error("Erro ao carregar usuário autenticado")
        return
      }

      setCurrentUser(user)
      console.log("🔑 Usuário autenticado:", user?.id)
      
      if (user) {
        await checkProfile(user.id)
        await loadAllProfiles()
      }
    } catch (error) {
      console.error("Erro inesperado:", error)
    } finally {
      setAuthLoading(false)
    }
  }

  // Verificar se perfil existe
  const checkProfile = async (userId: string) => {
    try {
      console.log("🔍 Verificando perfil para userId:", userId)
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle() // Use maybeSingle() ao invés de single()

      if (error) {
        console.error("❌ Erro ao verificar perfil:", error)
        setProfile(null)
        return
      }

      if (data) {
        console.log("✅ Perfil encontrado:", data)
        setProfile(data)
      } else {
        console.log("⚠️ Perfil não encontrado")
        setProfile(null)
      }
    } catch (error) {
      console.error("Erro inesperado ao verificar perfil:", error)
      setProfile(null)
    }
  }

  // Carregar todos os perfis para debug
  const loadAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome_completo, email, whatsapp, asaas_customer_id, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Erro ao carregar perfis:", error)
        return
      }

      setAllProfiles(data || [])
      console.log("📋 Total de perfis encontrados:", data?.length || 0)
    } catch (error) {
      console.error("Erro inesperado ao carregar perfis:", error)
    }
  }

  // Criar perfil automaticamente
  const createProfile = async () => {
    if (!currentUser) {
      toast.error("Usuário não autenticado")
      return
    }

    setLoading(true)
    setFixAttempts(prev => prev + 1)

    try {
      console.log("🛠️ Criando perfil para userId:", currentUser.id)
      
      const profileData = {
        id: currentUser.id,
        nome_completo: "MARCELO ELIEL DE SOUZA",
        email: "marcelo@teste.com",
        whatsapp: "61999855068",
        tipo_usuario: "cliente",
        perfil_configurado: false,
        asaas_customer_id: "cus_000006799511",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" })
        .select("*")

      if (error) {
        console.error("❌ Erro ao criar perfil:", error)
        toast.error(`Erro ao criar perfil: ${error.message}`)
        return
      }

      console.log("✅ Perfil criado com sucesso:", data)
      toast.success("Perfil criado com sucesso!")
      
      // Recarregar dados
      await checkProfile(currentUser.id)
      await loadAllProfiles()
      
    } catch (error: any) {
      console.error("Erro inesperado ao criar perfil:", error)
      toast.error(`Erro inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar customer_id
  const updateCustomerId = async () => {
    if (!currentUser || !profile) {
      toast.error("Perfil não encontrado")
      return
    }

    setLoading(true)

    try {
      const customerId = "cus_000006799511" // Customer ID mais recente dos logs
      
      console.log("💾 Atualizando customer_id para:", customerId)
      
      const { data, error } = await supabase
        .from("profiles")
        .update({
          asaas_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id)
        .select("*")

      if (error) {
        console.error("❌ Erro ao atualizar customer_id:", error)
        toast.error(`Erro: ${error.message}`)
        return
      }

      console.log("✅ Customer_id atualizado:", data)
      toast.success("Customer ID atualizado com sucesso!")
      
      // Recarregar perfil
      await checkProfile(currentUser.id)
      
    } catch (error: any) {
      console.error("Erro inesperado:", error)
      toast.error(`Erro inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Testar criação de customer no Asaas
  const testAsaasCustomer = async () => {
    if (!currentUser) {
      toast.error("Usuário não autenticado")
      return
    }

    setLoading(true)

    try {
      console.log("🚀 Testando criação de customer no Asaas...")
      
      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "MARCELO ELIEL DE SOUZA",
          email: "marcelo@teste.com",
          phone: "61999855068",
          mobilePhone: "61999855068", 
          cpfCnpj: "11144477735",
          userId: currentUser.id,
        }),
      })

      const result = await response.json()
      
      if (response.ok && result.data) {
        console.log("✅ Customer criado:", result.data)
        toast.success(`Customer criado: ${result.data.id}`)
        
        // Recarregar perfil para ver se customer_id foi salvo
        setTimeout(() => {
          checkProfile(currentUser.id)
        }, 1000)
      } else {
        console.error("❌ Erro na API:", result)
        toast.error(`Erro: ${result.error || "Falha na API"}`)
      }
      
    } catch (error: any) {
      console.error("Erro inesperado:", error)
      toast.error(`Erro inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔧 Diagnóstico Final - Customer ID</h1>
        <p className="text-gray-600">Resolver de vez o problema do customer_id</p>
      </div>

      {/* Status do Usuário Autenticado */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status do Usuário Autenticado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Usuário autenticado</span>
              </div>
              <div><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{currentUser.id}</code></div>
              <div><strong>Email:</strong> {currentUser.email}</div>
              <div><strong>Nome:</strong> {currentUser.user_metadata?.full_name || "Não informado"}</div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Usuário não autenticado</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status do Perfil */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Perfil na Tabela Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Perfil encontrado</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                <div><strong>Nome:</strong> {profile.nome_completo || "Não informado"}</div>
                <div><strong>Email:</strong> {profile.email || "Não informado"}</div>
                <div><strong>WhatsApp:</strong> {profile.whatsapp || "Não informado"}</div>
                <div>
                  <strong>Customer ID:</strong>{" "}
                  {profile.asaas_customer_id ? (
                    <Badge variant="default" className="ml-2">{profile.asaas_customer_id}</Badge>
                  ) : (
                    <Badge variant="destructive" className="ml-2">Não definido</Badge>
                  )}
                </div>
                <div><strong>Criado em:</strong> {new Date(profile.created_at).toLocaleString("pt-BR")}</div>
                <div><strong>Atualizado:</strong> {new Date(profile.updated_at).toLocaleString("pt-BR")}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Perfil NÃO encontrado</span>
              </div>
              <p className="text-gray-600">
                Este é o problema! O usuário autenticado não tem registro na tabela `profiles`.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🛠️ Ações de Correção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Botão para criar perfil */}
            {!profile && (
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">1. Criar Perfil</h4>
                <p className="text-orange-700 text-sm mb-3">
                  Criar registro na tabela profiles com os dados do usuário autenticado.
                </p>
                <Button 
                  onClick={createProfile} 
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Criar Perfil
                </Button>
              </div>
            )}

            {/* Botão para atualizar customer_id */}
            {profile && !profile.asaas_customer_id && (
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">2. Definir Customer ID</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Adicionar o customer_id do Asaas mais recente: <code>cus_000006799511</code>
                </p>
                <Button 
                  onClick={updateCustomerId} 
                  disabled={loading}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Definir Customer ID
                </Button>
              </div>
            )}

            {/* Botão para testar criação no Asaas */}
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">3. Testar Integração Asaas</h4>
              <p className="text-green-700 text-sm mb-3">
                Criar customer no Asaas e salvar automaticamente no perfil.
              </p>
              <Button 
                onClick={testAsaasCustomer} 
                disabled={loading || !currentUser}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Testar Asaas
              </Button>
            </div>

            {/* Botão para recarregar */}
            <Button 
              onClick={() => {
                if (currentUser) {
                  checkProfile(currentUser.id)
                  loadAllProfiles()
                }
              }} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug: Todos os Perfis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Debug: Últimos Perfis na Tabela ({allProfiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allProfiles.length > 0 ? (
            <div className="space-y-2">
              {allProfiles.map((prof) => (
                <div 
                  key={prof.id} 
                  className={`p-3 rounded border text-sm ${
                    prof.id === currentUser?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{prof.nome_completo || "Sem nome"}</strong>
                      {prof.id === currentUser?.id && (
                        <Badge className="ml-2 bg-blue-600">Você</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(prof.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-xs">
                    <div><strong>ID:</strong> <code>{prof.id.slice(0, 8)}...</code></div>
                    <div><strong>Email:</strong> {prof.email || "N/A"}</div>
                    <div>
                      <strong>Customer:</strong>{" "}
                      {prof.asaas_customer_id ? (
                        <code className="bg-green-100 px-1 rounded">{prof.asaas_customer_id}</code>
                      ) : (
                        <span className="text-red-500">Não definido</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum perfil encontrado na tabela.</p>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {fixAttempts > 0 && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Tentativas de correção: <strong>{fixAttempts}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 