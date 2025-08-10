"use client"

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // Detectar plataforma
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    const isAndroidDevice = /android/.test(userAgent)
    
    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)

    // Verificar se já está instalado
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    setIsInstalled(isRunningStandalone || isInWebAppiOS)

    // Event listener para o prompt de instalação
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPromptEvent(e)
      setCanInstall(true)
      
      // Verificar se é primeira visita
      const hasSeenInstallPrompt = localStorage.getItem('pwa-install-prompt-seen')
      const lastDismissed = localStorage.getItem('pwa-install-dismissed')
      const now = Date.now()
      const oneDayAgo = now - (24 * 60 * 60 * 1000) // 24 horas
      
      // Mostrar se nunca viu o prompt OU se dispensou há mais de 24h
      if (!hasSeenInstallPrompt || (lastDismissed && parseInt(lastDismissed) < oneDayAgo)) {
        setShowInstallBanner(true)
      }
    }

    // Event listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setShowInstallBanner(false)
      localStorage.removeItem('pwa-install-prompt-seen')
      localStorage.removeItem('pwa-install-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPromptEvent) return false

    try {
      await installPromptEvent.prompt()
      const choiceResult = await installPromptEvent.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBanner(false)
        setCanInstall(false)
        localStorage.setItem('pwa-install-accepted', Date.now().toString())
        return true
      } else {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
        return false
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }

  const dismissBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-prompt-seen', 'true')
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const showBannerLater = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-prompt-seen', 'true')
    // Não salva dismissed, então vai aparecer na próxima visita
  }

  return {
    canInstall: canInstall && !isInstalled,
    isInstalled,
    isIOS,
    isAndroid,
    showInstallBanner: showInstallBanner && !isInstalled && (isAndroid || canInstall),
    installApp,
    dismissBanner,
    showBannerLater
  }
}