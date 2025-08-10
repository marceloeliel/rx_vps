'use client'

import { useEffect, useState } from 'react'
import { Loader2, Car, Zap } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  progress?: number
  showProgress?: boolean
  variant?: 'default' | 'minimal' | 'detailed'
}

export function LoadingScreen({ 
  message = 'Carregando...', 
  progress = 0,
  showProgress = false,
  variant = 'default'
}: LoadingScreenProps) {
  const [dots, setDots] = useState('')
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCurrentMessage(message)
  }, [message])

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">{currentMessage}</span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <Car className="h-16 w-16 text-blue-600 mx-auto animate-bounce" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              RX Veículos
            </h3>
            
            <p className="text-gray-600 mb-4">
              {currentMessage}{dots}
            </p>
            
            {showProgress && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
            
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full bg-blue-600 animate-pulse`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="relative mb-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
      
      <p className="text-gray-600 text-center">
        {currentMessage}{dots}
      </p>
      
      {showProgress && (
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar estados de loading com mensagens dinâmicas
export function useLoadingState() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Carregando...')
  const [progress, setProgress] = useState(0)

  const startLoading = (initialMessage = 'Carregando...') => {
    setLoading(true)
    setMessage(initialMessage)
    setProgress(0)
  }

  const updateProgress = (newProgress: number, newMessage?: string) => {
    setProgress(newProgress)
    if (newMessage) setMessage(newMessage)
  }

  const stopLoading = () => {
    setLoading(false)
    setProgress(0)
  }

  return {
    loading,
    message,
    progress,
    startLoading,
    updateProgress,
    stopLoading,
    setMessage
  }
}