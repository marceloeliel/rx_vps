"use client"

import { useState, useEffect } from "react"
import { X, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/hooks/use-subscription"

export function TrialNotificationBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const { subscriptionStatus } = useSubscription()

  // Dados simulados - substituir pelo hook useTrial quando a tabela estiver criada
  const daysRemaining = 15
  const isExpired = daysRemaining <= 0
  const isNearExpiry = daysRemaining <= 3 && daysRemaining > 0
  const isBlocked = false // Será true quando expirado e sem plano ativo
  
  // Só exibir se o usuário tem um plano ativo
  const hasActivePlan = subscriptionStatus.isActive || subscriptionStatus.planType !== null

  // Verificar se o card foi dispensado anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('trial-notification-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('trial-notification-dismissed', 'true')
  }

  // Não mostrar se não tem plano ativo
  if (!hasActivePlan) {
    return null
  }

  // Não mostrar se foi dispensado (exceto se bloqueado)
  if (isDismissed && !isBlocked) {
    return null
  }

  if (!isVisible) {
    return null
  }

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