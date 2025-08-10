"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { toast } from "sonner"

export function PWAInstallBanner() {
  const {
    showInstallBanner,
    isAndroid,
    isIOS,
    installApp,
    dismissBanner,
    showBannerLater
  } = usePWAInstall()

  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Delay para mostrar a barra após 3 segundos
  useEffect(() => {
    if (showInstallBanner) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, 3000) // Espera 3 segundos após o carregamento da página

      return () => clearTimeout(timer)
    }
  }, [showInstallBanner])

  const handleInstall = async () => {
    if (isIOS) {
      // Para iOS, mostrar instruções manuais
      toast.info(
        "Para instalar: Toque no ícone de compartilhar (↗) no Safari e selecione 'Adicionar à Tela de Início'",
        { duration: 8000 }
      )
      handleDismiss()
      return
    }

    const success = await installApp()
    if (success) {
      toast.success("App instalado com sucesso! 🎉")
      setIsVisible(false)
    } else {
      toast.error("Não foi possível instalar o app")
    }
  }

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      dismissBanner()
    }, 300)
  }

  const handleLater = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      showBannerLater()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay sutil */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleLater}
      />
      
      {/* Barra de instalação */}
      <div 
        className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[60] transition-all duration-500 ease-out ${
          isAnimating 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-full opacity-0 scale-95'
        }`}
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md p-4">
          {/* Header com ícone e título */}
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">
                Instalar RX Autos
              </h3>
              <p className="text-white/80 text-xs">
                Acesso rápido e experiência otimizada
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Benefícios */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <span>Funciona offline</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <span>Notificações de novos veículos</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <span>Acesso com um toque</span>
            </div>
          </div>

          {/* Instruções específicas para iOS */}
          {isIOS && (
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-white text-xs text-center">
                <Smartphone className="w-4 h-4 inline mr-1" />
                Toque em <strong>↗ Compartilhar</strong> e depois <strong>"Adicionar à Tela de Início"</strong>
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-white text-orange-600 hover:bg-gray-100 font-semibold text-sm h-9"
            >
              <Download className="w-4 h-4 mr-2" />
              {isIOS ? "Ver Como" : "Instalar"}
            </Button>
            <Button
              onClick={handleLater}
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 text-sm h-9 px-3"
            >
              Depois
            </Button>
          </div>

          {/* Indicador de plataforma */}
          <div className="flex justify-center mt-3">
            <div className="flex items-center gap-1 text-white/60 text-xs">
              <Smartphone className="w-3 h-3" />
              <span>{isAndroid ? "Android" : isIOS ? "iOS" : "Mobile"}</span>
            </div>
          </div>
        </div>

        {/* Seta indicativa */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rotate-45 border-r border-b border-white/20"></div>
        </div>
      </div>
    </>
  )
}