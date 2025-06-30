"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  User,
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Search,
  Shield,
} from "lucide-react"

export default function DebugProfilesPage() {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileExists, setProfileExists] = useState<any>(null)
  const [profilesCount, setProfilesCount] = useState<any>(null)
  const [rlsStatus, setRlsStatus] = useState<any>(null)
  
  const supabase = createClient()

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        await checkProfileExists(user.id)
        await getProfilesCount()
        await checkRlsStatus()
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const checkProfileExists = async (userId: string) => {
    try {
      console.log("🔍 Verificando se perfil existe para:", userId)
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      console.log("📊 Resultado da busca:", { data, error })
      
      setProfileExists({ data, error })
    } catch (error) {
      console.error("Erro ao verificar perfil:", error)
      setProfileExists({ data: null, error })
    }
  }

  const getProfilesCount = async () => {
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      const { count: withCustomerIdCount, error: customerIdError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("asaas_customer_id", "is", null)

      setProfilesCount({
        total: totalCount,
        withCustomerId: withCustomerIdCount,
        totalError,
        customerIdError
      })
    } catch (error) {
      console.error("Erro ao contar perfis:", error)
    }
  }

  const checkRlsStatus = async () => {
    try {
      // Esta query pode falhar se não tiver permissões de admin
      const { data, error } = await supabase
        .rpc("check_rls_status", { table_name: "profiles" })
        .single()

      setRlsStatus({ data, error })
    } catch (error) {
      console.log("Não foi possível verificar RLS (normal):", error)
      setRlsStatus({ data: null, error: "Sem permissões para verificar RLS" })
    }
  }

  const createProfile = async () => {
    if (!currentUser) {
      toast.error("Usuário não encontrado")
      return
    }

    setLoading(true)
    try {
      console.log("🔨 Criando perfil para:", currentUser.id)
      
      const profileData = {
        id: currentUser.id,
        nome_completo: "MARCELO ELIEL DE SOUZA",
        email: currentUser.email || "marcelo@teste.com",
        whatsapp: "61999855068",
        tipo_usuario: "cliente",
        perfil_configurado: true,
        asaas_customer_id: "cus_000006799498", // Customer ID mais recente dos logs
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileData)
        .select()
        .single()

      if (error) {
        console.error("❌ Erro ao criar perfil:", error)
        toast.error(`Erro ao criar perfil: ${error.message}`)
      } else {
        console.log("✅ Perfil criado com sucesso:", data)
        toast.success("Perfil criado com sucesso!")
        await checkProfileExists(currentUser.id)
        await getProfilesCount()
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado:", error)
      toast.error(`Erro inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const updateCustomerId = async () => {
    if (!currentUser) {
      toast.error("Usuário não encontrado")
      return
    }

    setLoading(true)
    try {
      console.log("🔨 Atualizando customer_id para:", currentUser.id)
      
      const { data, error } = await supabase
        .from("profiles")
        .update({
          asaas_customer_id: "cus_000006799498",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id)
        .select()

      if (error) {
        console.error("❌ Erro ao atualizar customer_id:", error)
        toast.error(`Erro ao atualizar: ${error.message}`)
      } else {
        console.log("✅ Customer_id atualizado:", data)
        toast.success("Customer ID atualizado com sucesso!")
        await checkProfileExists(currentUser.id)
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado:", error)
      toast.error(`Erro inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug - Tabela Profiles</h1>
        <p className="text-gray-600">Diagnóstico completo do problema do customer_id</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuário Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Usuário Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {currentUser.id}</div>
                <div><strong>Email:</strong> {currentUser.email}</div>
                <div><strong>Criado:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</div>
                <Badge variant="outline" className="text-green-600 border-green-600 mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Autenticado
                </Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">Usuário não encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status do Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileExists ? (
              <div className="space-y-2">
                {profileExists.data ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {profileExists.data.nome_completo}</div>
                    <div><strong>Email:</strong> {profileExists.data.email}</div>
                    <div><strong>WhatsApp:</strong> {profileExists.data.whatsapp}</div>
                    <div><strong>Customer ID:</strong> {profileExists.data.asaas_customer_id || "NÃO DEFINIDO"}</div>
                    <Badge variant="outline" className="text-green-600 border-green-600 mt-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Perfil Existe
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 mb-2">Perfil não encontrado</p>
                    {profileExists.error && (
                      <p className="text-xs text-gray-500">
                        Erro: {profileExists.error.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Verificando...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas da Tabela */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profilesCount ? (
              <div className="space-y-2 text-sm">
                <div><strong>Total de perfis:</strong> {profilesCount.total || 0}</div>
                <div><strong>Com Customer ID:</strong> {profilesCount.withCustomerId || 0}</div>
                <div><strong>Sem Customer ID:</strong> {(profilesCount.total || 0) - (profilesCount.withCustomerId || 0)}</div>
                
                {profilesCount.totalError && (
                  <p className="text-red-500 text-xs mt-2">
                    Erro ao contar total: {profilesCount.totalError.message}
                  </p>
                )}
                {profilesCount.customerIdError && (
                  <p className="text-red-500 text-xs">
                    Erro ao contar customer_id: {profilesCount.customerIdError.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Carregando...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RLS Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Row Level Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rlsStatus ? (
              <div className="space-y-2 text-sm">
                {typeof rlsStatus.error === "string" ? (
                  <p className="text-yellow-600">{rlsStatus.error}</p>
                ) : rlsStatus.data ? (
                  <div>
                    <div><strong>RLS Ativo:</strong> {rlsStatus.data.rls_enabled ? "Sim" : "Não"}</div>
                    <div><strong>Force RLS:</strong> {rlsStatus.data.force_rls ? "Sim" : "Não"}</div>
                  </div>
                ) : (
                  <p className="text-gray-500">RLS não verificado</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Verificando...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ações de Correção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={createProfile} 
                disabled={loading || !currentUser}
                className="w-full"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Criar/Atualizar Perfil
              </Button>
              
              <Button 
                onClick={updateCustomerId} 
                disabled={loading || !currentUser || !profileExists?.data}
                variant="outline"
                className="w-full"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                Atualizar Customer ID
              </Button>
            </div>
            
            <Button 
              onClick={loadInitialData} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Dados
            </Button>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 text-sm space-y-2">
            <div>1. <strong>Se o perfil não existir:</strong> Clique em "Criar/Atualizar Perfil"</div>
            <div>2. <strong>Se existir sem Customer ID:</strong> Clique em "Atualizar Customer ID"</div>
            <div>3. <strong>Teste o pagamento:</strong> Vá para /checkout e crie uma cobrança</div>
            <div>4. <strong>Verifique o resultado:</strong> Vá para /minhas-cobrancas</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 