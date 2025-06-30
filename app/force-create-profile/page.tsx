"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function ForceCreateProfilePage() {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [status, setStatus] = useState<string>("")

  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const forceCreateProfile = async () => {
    if (!currentUser) {
      toast.error("Usuário não autenticado")
      return
    }

    setLoading(true)
    setStatus("Iniciando...")

    try {
      // Usar API route que tem privilégios de servidor
      setStatus("Criando customer no Asaas...")
      
      const response = await fetch("/api/force-create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          name: "MARCELO ELIEL DE SOUZA",
          email: "marcelo@teste.com",
          phone: "61999855068",
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus("✅ Perfil criado com sucesso!")
        toast.success("Perfil criado com sucesso!")
        console.log("Resultado:", result)
      } else {
        setStatus(`❌ Erro: ${result.error}`)
        toast.error(`Erro: ${result.error}`)
      }
    } catch (error: any) {
      setStatus(`❌ Erro inesperado: ${error.message}`)
      toast.error(`Erro inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Forçar Criação de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p><strong>Usuário:</strong> {currentUser.id}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
              </div>

              <Button 
                onClick={forceCreateProfile} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Forçar Criação do Perfil
                  </>
                )}
              </Button>

              {status && (
                <div className={`p-4 rounded-lg ${
                  status.includes("✅") ? "bg-green-50 text-green-800" : 
                  status.includes("❌") ? "bg-red-50 text-red-800" : 
                  "bg-blue-50 text-blue-800"
                }`}>
                  {status}
                </div>
              )}

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Esta página vai:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Usar API route com privilégios de servidor</li>
                  <li>Contornar as políticas RLS</li>
                  <li>Criar o perfil diretamente na tabela</li>
                  <li>Criar customer no Asaas automaticamente</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Usuário não autenticado</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 