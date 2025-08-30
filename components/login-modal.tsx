"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, User, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

export function LoginModal({ isOpen, onClose, title = "Login necessário", message = "Para acessar esta funcionalidade, você precisa estar logado em sua conta. Escolha uma das opções abaixo:" }: LoginModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    router.push('/login')
    onClose()
  }

  const handleSignup = () => {
    router.push('/cadastro')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-600 text-sm mb-6">
            {message}
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <User className="h-4 w-4 mr-2" />
              Fazer Login
            </Button>
            
            <Button
              onClick={handleSignup}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              size="lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Conta
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}