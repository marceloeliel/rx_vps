"use client"
import { useState } from "react"
import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Toast de início do processo
    toast({
      title: "Criando sua conta...",
      description: "Por favor, aguarde enquanto processamos seu cadastro.",
    })

    // Validações
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro na confirmação de senha",
        description: "As senhas não coincidem. Verifique e tente novamente.",
      })
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Termos não aceitos",
        description: "Você deve aceitar os Termos de Serviço e a Política de Privacidade para continuar.",
      })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 6 caracteres.",
      })
      setLoading(false)
      return
    }

    if (name.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Nome inválido",
        description: "Por favor, digite seu nome completo.",
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Email já cadastrado",
            description: "Este email já está cadastrado. Tente fazer login ou use outro email.",
          })
        } else if (error.message.includes("Invalid email")) {
          toast({
            variant: "destructive",
            title: "Email inválido",
            description: "Por favor, digite um email válido.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: error.message,
          })
        }
      } else {
        // Verificar se precisa de confirmação de email
        if (data.user && !data.user.email_confirmed_at) {
          toast({
            title: "🎉 Cadastro realizado com sucesso!",
            description: "Verifique seu email para confirmar sua conta antes de fazer login.",
          })
        } else {
          toast({
            title: "🎉 Cadastro realizado com sucesso!",
            description: "Sua conta foi criada. Redirecionando para o login...",
          })
        }

        // Aguardar um pouco para o usuário ver a mensagem
        setTimeout(() => {
          // Verificar se há uma URL de redirecionamento salva para preservar no login
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
          if (redirectUrl) {
            // Manter a URL salva para após o login
            router.push("/login")
          } else {
            router.push("/login")
          }
        }, 2000)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)

    toast({
      title: "Redirecionando para Google...",
      description: "Você será redirecionado para fazer login com sua conta Google.",
    })

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro com Google",
          description: error.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar se cadastrar com Google.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden relative">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent px-6 py-4">
        <div className="flex items-center">
          <Link href="/" className="inline-flex items-center text-gray-800 hover:text-gray-600 lg:text-white lg:hover:text-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex-1 flex flex-col justify-center px-6 pt-20 pb-6 lg:px-8 max-h-screen overflow-y-auto">

          {/* Title and subtitle */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Crie sua conta</h1>
            <p className="text-gray-600 text-sm">Cadastre-se para encontrar e comprar o veículo dos seus sonhos</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-3 max-w-sm mx-auto w-full">
            {/* Nome completo */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium text-gray-900">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="johnsmith@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                required
                disabled={loading}
              />
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium text-gray-900">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 pr-9"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-900">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 pr-9"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-2 pt-1">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5 h-3.5 w-3.5 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                disabled={loading}
              />
              <Label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                Ao continuar, você concorda com nossos{" "}
                <Link href="#" className="text-orange-500 hover:text-orange-600">
                  Termos de Serviço
                </Link>{" "}
                e{" "}
                <Link href="#" className="text-orange-500 hover:text-orange-600">
                  Política de Privacidade
                </Link>
              </Label>
            </div>

            {/* Create account button */}
            <Button
              type="submit"
              className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm mt-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Google signup */}
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              variant="outline"
              className="w-full h-9 border-gray-200 bg-gray-100 text-gray-400 font-medium text-sm cursor-not-allowed"
              disabled={true}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar com Google
            </Button>

            {/* Login link */}
            <div className="text-center pt-2">
              <span className="text-gray-600 text-xs">Já tem uma conta? </span>
              <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium text-xs">
                Entre aqui
              </Link>
            </div>
          </form>
          </div>
        </div>

        {/* Right side - Image (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://ecdmpndeunbzhaihabvi.supabase.co/storage/v1/object/public/telas//Toyota%20Corolla%20em%20Showroom%20Moderno.png"
          alt="Toyota Corolla em showroom moderno"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-6 right-6 text-white text-right">
          <h2 className="text-2xl font-bold mb-1">Encontre seu carro dos sonhos</h2>
          <p className="text-base opacity-90">Milhares de veículos verificados esperando por você</p>
        </div>
        </div>
      </div>
    </div>
  )
}
