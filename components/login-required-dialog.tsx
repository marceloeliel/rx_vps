"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, UserPlus, X } from "lucide-react"

interface LoginRequiredDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

export function LoginRequiredDialog({
  isOpen,
  onClose,
  title = "Login necessário",
  description = "Para simular financiamento, você precisa estar logado em sua conta."
}: LoginRequiredDialogProps) {
  const handleLogin = () => {
    window.open('/login', '_blank')
    onClose()
  }

  const handleRegister = () => {
    window.open('/cadastro', '_blank')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <User className="h-4 w-4 mr-2" />
            Fazer Login
          </Button>
          
          <Button 
            onClick={handleRegister}
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Criar Conta
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}