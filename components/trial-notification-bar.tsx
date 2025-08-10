"use client"

import { useState, useEffect } from "react"
import { X, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

// Componente interno que renderiza o conteúdo baseado no estado do trial
function TrialNotificationContentRenderer({ 
  subscription, 
  trial, 
  isVisible, 
  setIsVisible, 
  isDismissed, 
  setIsDismissed,
  isExpired,
  isNearExpiry,
  isBlocked,
  daysRemaining,
  handleClose
}: any) {
  if (isExpired && isBlocked) {
    return (
      <Card className="fixed bottom-4 left-4 z-50 w-96 bg-red-50 border-red-200 shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Período de teste expirado
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Acesso bloqueado. Assine um plano para continuar usando o sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (isExpired) {
    return (
      <Card className="fixed bottom-4 left-4 z-50 w-96 bg-orange-50 border-orange-200 shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  Período de teste expirado
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Assine um plano para continuar com todas as funcionalidades.
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleClose} className="text-orange-600 hover:bg-orange-100 p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (isNearExpiry) {
    return (
      <Card className="fixed bottom-4 left-4 z-50 w-96 bg-yellow-50 border-yellow-200 shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Período de teste expira em {daysRemaining} {daysRemaining.toString() === '1' ? 'dia' : 'dias'}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Assine um plano para não perder o acesso.
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleClose} className="text-yellow-600 hover:bg-yellow-100 p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center mt-3">
            <Badge variant="outline" className="border-yellow-300 text-yellow-700">
              {daysRemaining} {daysRemaining.toString() === '1' ? 'dia' : 'dias'}
            </Badge>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 bg-blue-50 border-blue-200 shadow-lg">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Período de teste: {daysRemaining} {daysRemaining.toString() === '1' ? 'dia restante' : 'dias restantes'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Aproveite para explorar todas as funcionalidades.
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleClose} className="text-blue-600 hover:bg-blue-100 p-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center mt-3">
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            {daysRemaining} {daysRemaining.toString() === '1' ? 'dia' : 'dias'}
          </Badge>
        </div>
      </div>
    </Card>
  )
}

// Componente principal que gerencia o estado e lógica
export function TrialNotificationBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [trialData, setTrialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()
  
  const loadTrialData = async () => {
    try {
      setLoading(true)
      
      // Verificar se há usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setLoading(false)
        return
      }
      
      // Buscar dados do trial
      const { data: trialPeriod, error: trialError } = await supabase
        .from('trial_periods')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (trialError && trialError.code !== 'PGRST116') {
        console.error('Erro ao buscar trial:', trialError)
        setLoading(false)
        return
      }
      
      if (trialPeriod) {
        const now = new Date()
        const endDate = new Date(trialPeriod.end_date)
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        setTrialData({
          isInTrial: true,
          daysRemaining: Math.max(0, daysRemaining),
          endDate: trialPeriod.end_date
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados do trial:', error)
      setLoading(false)
    }
  }

  // Aguardar montagem do componente
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Verificar se o card foi dispensado anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('trial-notification-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      setIsVisible(false)
    }
  }, [])
  
  // Carregar dados do trial
  useEffect(() => {
    loadTrialData()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('trial-notification-dismissed', 'true')
  }
  
  // Não renderizar até estar montado ou se ainda está carregando
  if (!mounted || loading || !trialData) {
    return null
  }
  
  const { daysRemaining } = trialData
  
  // Calcular estados baseados nos dados reais do trial
  const isExpired = daysRemaining <= 0
  const isNearExpiry = daysRemaining <= 3 && daysRemaining > 0
  const isBlocked = isExpired // Assumindo que trial expirado bloqueia acesso
  
  // Não mostrar se foi dispensado (exceto se bloqueado)
  if (isDismissed && !isBlocked) {
    return null
  }

  if (!isVisible) {
    return null
  }

  // Calcular estados para renderização
  const renderProps = {
    subscription: { subscriptionStatus: { isActive: false } },
    trial: trialData,
    isVisible,
    setIsVisible,
    isDismissed,
    setIsDismissed,
    isExpired,
    isNearExpiry,
    isBlocked,
    daysRemaining,
    handleClose
  }

  return <TrialNotificationContentRenderer {...renderProps} />
}