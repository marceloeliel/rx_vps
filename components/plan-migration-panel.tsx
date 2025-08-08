'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Database, CheckCircle, XCircle, Play, TestTube } from 'lucide-react'
import { 
  setupPlanControlSystem, 
  testPlanSystem,
  createPlanControlTables,
  insertPlanConfigurations,
  createPlanFunctions
} from '@/lib/supabase/plan-migrations'
import { useUser } from '@/lib/contexts/user-context'

interface MigrationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'success' | 'error'
  error?: string
}

export function PlanMigrationPanel() {
  const { user } = useUser()
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<MigrationStep[]>([
    {
      id: 'tables',
      name: 'Criar Tabelas',
      description: 'Criação das tabelas plan_configurations, user_plan_usage e user_usage_history',
      status: 'pending'
    },
    {
      id: 'configurations',
      name: 'Inserir Configurações',
      description: 'Inserção das configurações dos planos (Básico, Profissional, Empresarial, Ilimitado)',
      status: 'pending'
    },
    {
      id: 'functions',
      name: 'Criar Funções',
      description: 'Criação das funções can_add_vehicle e can_feature_vehicle',
      status: 'pending'
    }
  ])
  const [testResult, setTestResult] = useState<any>(null)
  const [showTest, setShowTest] = useState(false)

  const updateStepStatus = (stepId: string, status: MigrationStep['status'], error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, error }
        : step
    ))
  }

  const runMigrations = async () => {
    setIsRunning(true)
    setTestResult(null)
    
    try {
      // Reset all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, error: undefined })))
      
      // Step 1: Create Tables
      updateStepStatus('tables', 'running')
      const tablesResult = await createPlanControlTables()
      if (tablesResult.success) {
        updateStepStatus('tables', 'success')
      } else {
        updateStepStatus('tables', 'error', 'Erro ao criar tabelas')
        return
      }
      
      // Step 2: Insert Configurations
      updateStepStatus('configurations', 'running')
      const configResult = await insertPlanConfigurations()
      if (configResult.success) {
        updateStepStatus('configurations', 'success')
      } else {
        updateStepStatus('configurations', 'error', 'Erro ao inserir configurações')
        return
      }
      
      // Step 3: Create Functions
      updateStepStatus('functions', 'running')
      const functionsResult = await createPlanFunctions()
      if (functionsResult.success) {
        updateStepStatus('functions', 'success')
      } else {
        updateStepStatus('functions', 'error', 'Erro ao criar funções')
        return
      }
      
    } catch (error) {
      console.error('Erro durante as migrações:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const runTest = async () => {
    if (!user?.id) {
      setTestResult({ error: 'Usuário não encontrado' })
      return
    }
    
    setShowTest(true)
    const result = await testPlanSystem(user.id)
    setTestResult(result)
  }

  const getStatusIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: MigrationStep['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      case 'running':
        return <Badge variant="default">Executando...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
    }
  }

  const allStepsCompleted = steps.every(step => step.status === 'success')
  const hasErrors = steps.some(step => step.status === 'error')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sistema de Controle de Planos
          </CardTitle>
          <CardDescription>
            Configure o sistema de controle de planos no Supabase. Este processo criará as tabelas, 
            configurações e funções necessárias para gerenciar os limites de cada plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Migration Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{step.name}</h4>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.error && (
                    <p className="text-sm text-red-500 mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={runMigrations} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? 'Executando...' : 'Executar Migrações'}
            </Button>
            
            {allStepsCompleted && (
              <Button 
                variant="outline" 
                onClick={runTest}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Testar Sistema
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {allStepsCompleted && !hasErrors && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Sistema de controle de planos configurado com sucesso! 
                Agora você pode testar o sistema ou começar a usar as funcionalidades.
              </AlertDescription>
            </Alert>
          )}

          {hasErrors && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                ❌ Ocorreram erros durante a configuração. Verifique os logs e tente novamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {showTest && testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Resultado dos Testes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Todos os testes passaram! O sistema está funcionando corretamente.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  ❌ Alguns testes falharam. Verifique o console para mais detalhes.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações dos Planos</CardTitle>
          <CardDescription>
            Resumo dos limites e recursos de cada plano que será configurado:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-600">Básico</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Até 5 veículos</li>
                <li>• 1 destaque</li>
                <li>• Anúncios básicos</li>
                <li>• Suporte por email</li>
                <li>• Estatísticas básicas</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-600">Profissional</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Até 30 veículos</li>
                <li>• 3 destaques</li>
                <li>• Anúncios destacados</li>
                <li>• Suporte prioritário</li>
                <li>• Estatísticas avançadas</li>
                <li>• Painel administrativo</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-purple-600">Empresarial</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Até 400 veículos</li>
                <li>• 40 destaques</li>
                <li>• Anúncios premium</li>
                <li>• Suporte 24/7</li>
                <li>• Relatórios completos</li>
                <li>• Acesso à API</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-orange-600">Ilimitado</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Veículos ilimitados</li>
                <li>• 100 destaques</li>
                <li>• Todos os recursos</li>
                <li>• Consultoria dedicada</li>
                <li>• API ilimitada</li>
                <li>• Suporte premium</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}