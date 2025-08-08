'use client'

import { PlanMigrationPanel } from '@/components/plan-migration-panel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Database, Settings } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PlanSetupPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configuração do Sistema de Planos
              </h1>
              <p className="text-gray-600">
                Configure o sistema de controle de planos e limites de usuários
              </p>
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Settings className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> Esta é uma página administrativa. As operações aqui realizadas 
            afetarão diretamente o banco de dados do Supabase. Execute apenas se você tem certeza 
            do que está fazendo.
          </AlertDescription>
        </Alert>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Instruções de Configuração
            </CardTitle>
            <CardDescription>
              Siga os passos abaixo para configurar o sistema de controle de planos:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Criar Tabelas</h4>
                  <p className="text-sm text-muted-foreground">
                    Criação das tabelas necessárias para armazenar configurações de planos, 
                    uso atual dos usuários e histórico de ações.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Inserir Configurações</h4>
                  <p className="text-sm text-muted-foreground">
                    Inserção das configurações dos 4 planos (Básico, Profissional, Empresarial, Ilimitado) 
                    com seus respectivos limites e recursos.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Criar Funções</h4>
                  <p className="text-sm text-muted-foreground">
                    Criação das funções PostgreSQL para verificar permissões de adição de veículos 
                    e destaques baseadas no plano do usuário.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Testar Sistema</h4>
                  <p className="text-sm text-muted-foreground">
                    Após a configuração, teste o sistema para garantir que todas as funções 
                    estão funcionando corretamente.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migration Panel */}
        <PlanMigrationPanel />

        {/* Additional Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>
              Após a configuração bem-sucedida do sistema:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">
                    <strong>Painel da Agência:</strong> O dashboard já está configurado para exibir 
                    informações do plano e limites de uso.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">
                    <strong>Cadastro de Veículos:</strong> A página de cadastro já possui verificação 
                    de permissões baseada no plano.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">
                    <strong>Hooks Personalizados:</strong> Use os hooks <code>usePlanControl</code> e 
                    <code>usePlanPermissions</code> para verificar permissões em outras partes do sistema.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">
                    <strong>Componentes de Proteção:</strong> Use o <code>PlanPermissionGuard</code> 
                    para proteger recursos baseados no plano do usuário.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}