'use client'

import { useState, useEffect } from 'react'

export interface WhatsAppConfig {
  phoneNumber: string
  defaultMessage: string
  businessHours?: {
    start: string
    end: string
    days: number[] // 0-6 (domingo-sábado)
  }
}

const DEFAULT_CONFIG: WhatsAppConfig = {
  phoneNumber: "5573999377300",
  defaultMessage: "Olá! Gostaria de saber mais informações sobre os veículos da RX Autos.",
  businessHours: {
    start: "08:00",
    end: "18:00",
    days: [1, 2, 3, 4, 5] // Segunda a sexta
  }
}

export function useWhatsApp(customConfig?: Partial<WhatsAppConfig>) {
  const [config, setConfig] = useState<WhatsAppConfig>({
    ...DEFAULT_CONFIG,
    ...customConfig
  })

  const [isBusinessHours, setIsBusinessHours] = useState(true)

  useEffect(() => {
    if (!config.businessHours) {
      setIsBusinessHours(true)
      return
    }

    const checkBusinessHours = () => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = now.getHours() * 100 + now.getMinutes()

      const startTime = parseInt(config.businessHours!.start.replace(':', ''))
      const endTime = parseInt(config.businessHours!.end.replace(':', ''))

      const isWorkingDay = config.businessHours!.days.includes(currentDay)
      const isWorkingTime = currentTime >= startTime && currentTime <= endTime

      setIsBusinessHours(isWorkingDay && isWorkingTime)
    }

    checkBusinessHours()
    const interval = setInterval(checkBusinessHours, 60000) // Verificar a cada minuto

    return () => clearInterval(interval)
  }, [config.businessHours])

  const openWhatsApp = (customMessage?: string) => {
    const cleanPhoneNumber = config.phoneNumber.replace(/\D/g, '')
    const message = customMessage || config.defaultMessage
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const getContextualMessage = (context?: string) => {
    const baseMessage = "Olá! Vim através do site da RX Autos."
    
    switch (context) {
      case 'veiculo':
        return `${baseMessage} Gostaria de saber mais informações sobre um veículo específico.`
      case 'agencia':
        return `${baseMessage} Gostaria de falar sobre parcerias para agências.`
      case 'planos':
        return `${baseMessage} Gostaria de saber mais sobre os planos de assinatura.`
      case 'suporte':
        return `${baseMessage} Preciso de suporte técnico.`
      case 'vendas':
        return `${baseMessage} Gostaria de anunciar meu veículo.`
      default:
        return config.defaultMessage
    }
  }

  const updateConfig = (newConfig: Partial<WhatsAppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }

  return {
    config,
    isBusinessHours,
    openWhatsApp,
    getContextualMessage,
    updateConfig
  }
} 