"use client"

import { useState, useEffect } from "react"
import { useTrial } from "@/hooks/use-trial"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Crown, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TrialCounterProps {
  variant?: "banner" | "badge" | "card"
  className?: string
  showUpgradeButton?: boolean
}

export function TrialCounter({ 
  variant = "banner", 
  className,
  showUpgradeButton = true 
}: TrialCounterProps) {
  const [mounted, setMounted] = useState(false)
  const { isInTrial, daysRemaining, loading, trialPeriod } = useTrial()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Não renderizar até estar montado
  if (!mounted) {
    return null
  }

  // Não exibir se não estiver carregando e não estiver em trial
  if (loading || !isInTrial || daysRemaining === null) {
    return null
  }

  const isExpiringSoon = daysRemaining <= 3
  const planName = trialPeriod?.plan_type === 'basico' ? 'Básico' : 
                   trialPeriod?.plan_type === 'premium' ? 'Premium' : 'Premium Plus'

  if (variant === "badge") {
    return (
      <Badge 
        variant="outline"
        className={cn(
          "flex items-center gap-1 text-xs px-2 py-1 border-gray-300 text-gray-600 bg-gray-50/50",
          isExpiringSoon && "border-orange-300 text-orange-700 bg-orange-50/50",
          className
        )}
      >
        <Clock className="h-3 w-3" />
        {daysRemaining}d
      </Badge>
    )
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "rounded-lg border p-4 space-y-3",
        isExpiringSoon ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50",
        className
      )}>
        <div className="flex items-center gap-2">
          <Crown className={cn(
            "h-5 w-5",
            isExpiringSoon ? "text-red-600" : "text-orange-600"
          )} />
          <h3 className={cn(
            "font-semibold",
            isExpiringSoon ? "text-red-900" : "text-orange-900"
          )}>
            Plano {planName} - Trial
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className={cn(
            "h-4 w-4",
            isExpiringSoon ? "text-red-600" : "text-orange-600"
          )} />
          <span className={cn(
            "text-sm",
            isExpiringSoon ? "text-red-700" : "text-orange-700"
          )}>
            {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
          </span>
        </div>

        {isExpiringSoon && (
          <p className="text-sm text-red-700">
            Seu período de teste está expirando em breve!
          </p>
        )}

        {showUpgradeButton && (
          <Link href="/planos">
            <Button 
              size="sm" 
              className={cn(
                "w-full",
                isExpiringSoon ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
              )}
            >
              <Zap className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </Link>
        )}
      </div>
    )
  }

  // Variant "banner" (padrão)
  return (
    <Alert className={cn(
      "border-l-4",
      isExpiringSoon 
        ? "border-l-red-500 bg-red-50 border-red-200" 
        : "border-l-orange-500 bg-orange-50 border-orange-200",
      className
    )}>
      <Crown className={cn(
        "h-4 w-4",
        isExpiringSoon ? "text-red-600" : "text-orange-600"
      )} />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium",
            isExpiringSoon ? "text-red-900" : "text-orange-900"
          )}>
            Plano {planName} - Trial:
          </span>
          <span className={cn(
            "flex items-center gap-1",
            isExpiringSoon ? "text-red-700" : "text-orange-700"
          )}>
            <Clock className="h-3 w-3" />
            {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
          </span>
        </div>
        
        {showUpgradeButton && (
          <Link href="/planos">
            <Button 
              size="sm" 
              variant="outline"
              className={cn(
                "ml-4",
                isExpiringSoon 
                  ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white" 
                  : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
              )}
            >
              <Zap className="h-3 w-3 mr-1" />
              Fazer Upgrade
            </Button>
          </Link>
        )}
      </AlertDescription>
    </Alert>
  )
}