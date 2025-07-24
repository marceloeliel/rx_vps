'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWhatsApp, type WhatsAppConfig } from '@/hooks/use-whatsapp'

interface WhatsAppFloatButtonProps {
  phoneNumber?: string
  message?: string
  className?: string
  context?: 'veiculo' | 'agencia' | 'planos' | 'suporte' | 'vendas'
  customConfig?: Partial<WhatsAppConfig>
  showBusinessHours?: boolean
}

export function WhatsAppFloatButton({ 
  phoneNumber = "5573999377300", 
  message,
  className,
  context,
  customConfig,
  showBusinessHours = true
}: WhatsAppFloatButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const { config, isBusinessHours, openWhatsApp, getContextualMessage } = useWhatsApp({
    phoneNumber,
    defaultMessage: message,
    ...customConfig
  })

  useEffect(() => {
    // Mostrar o botão após um pequeno delay para melhor UX
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    // Mostrar tooltip automaticamente após 3 segundos
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(tooltipTimer)
    }
  }, [])

  const handleWhatsAppClick = () => {
    const contextMessage = message || getContextualMessage(context)
    openWhatsApp(contextMessage)
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
      "sm:bottom-6 sm:right-6",
      className
    )}>
      {/* Tooltip/Mensagem */}
      <div className={cn(
        "absolute bottom-full right-0 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg",
        "text-sm text-gray-700 whitespace-nowrap transition-all duration-300",
        "border border-gray-200 max-w-xs",
        (isHovered || showTooltip) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}>
        <div className="flex items-center gap-2">
          <span>💬</span>
          <div className="flex flex-col">
            <span className="font-medium">Precisa de ajuda? Fale conosco!</span>
            {showBusinessHours && (
              <div className="flex items-center gap-1 text-xs mt-1">
                {isBusinessHours ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Online agora</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-600">Fora do horário comercial</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Seta do tooltip */}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
      </div>

      {/* Botão Principal */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full",
          "shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-4 focus:ring-green-300/50",
          "transform hover:scale-110 active:scale-95",
          !isBusinessHours && showBusinessHours ? "animate-pulse" : ""
        )}
        aria-label="Abrir WhatsApp"
        title="Falar no WhatsApp"
      >
        {/* Ícone do WhatsApp */}
        <MessageCircle 
          className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" 
        />
        
        {/* Efeito de ondas quando online */}
        {isBusinessHours && (
          <>
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </button>

      {/* Indicador de status */}
      {showBusinessHours && (
        <div className={cn(
          "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
          isBusinessHours ? "bg-green-500" : "bg-orange-500"
        )} />
      )}
    </div>
  )
}

// Versão compacta para mobile ou casos específicos
export function WhatsAppFloatButtonCompact({ 
  phoneNumber = "5573999377300",
  message = "Olá! Gostaria de mais informações.",
  className,
  context
}: WhatsAppFloatButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { openWhatsApp, getContextualMessage } = useWhatsApp({ phoneNumber, defaultMessage: message })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleWhatsAppClick = () => {
    const contextMessage = message || getContextualMessage(context)
    openWhatsApp(contextMessage)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleWhatsAppClick}
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "w-12 h-12 bg-[#25D366] hover:bg-[#20BA5A] rounded-full",
        "shadow-md hover:shadow-lg transition-all duration-300",
        "flex items-center justify-center",
        "focus:outline-none focus:ring-3 focus:ring-green-300/50",
        "transform hover:scale-105 active:scale-95",
        "sm:w-14 sm:h-14",
        className
      )}
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-white sm:w-7 sm:h-7" />
    </button>
  )
}

// Botão inline para usar dentro de cards ou seções específicas
export function WhatsAppInlineButton({
  phoneNumber = "5573999377300",
  message = "Olá! Gostaria de mais informações.",
  className,
  children,
  context,
  variant = "default"
}: WhatsAppFloatButtonProps & { 
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
}) {
  const { openWhatsApp, getContextualMessage } = useWhatsApp({ phoneNumber, defaultMessage: message })

  const handleWhatsAppClick = () => {
    const contextMessage = message || getContextualMessage(context)
    openWhatsApp(contextMessage)
  }

  const variants = {
    default: "bg-[#25D366] hover:bg-[#20BA5A] text-white",
    outline: "border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white",
    ghost: "text-[#25D366] hover:bg-[#25D366]/10"
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium",
        "transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-green-300/50",
        variants[variant],
        className
      )}
    >
      <MessageCircle className="w-5 h-5" />
      {children || "WhatsApp"}
    </button>
  )
} 