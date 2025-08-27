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
import { HydrationSafeWrapper } from "@/components/hydration-safe-wrapper"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Toast de início do processo
    toast({
      title: "Fazendo login...",
      description: "Verificando suas credenciais, aguarde um momento.",
    })

    // Validações básicas
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Por favor, digite seu email.",
      })
      setLoading(false)
      return
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Senha obrigatória",
        description: "Por favor, digite sua senha.",
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message === "Invalid login credentials") {
          toast({
            variant: "destructive",
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
          })
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email não confirmado",
            description: "Verifique seu email e clique no link de confirmação antes de fazer login.",
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
            title: "Erro no login",
            description: error.message,
          })
        }
      } else {
        toast({
          title: "🎉 Login realizado com sucesso!",
          description: `Bem-vindo de volta, ${data.user?.user_metadata?.full_name || "usuário"}!`,
        })

        // Aguardar um pouco para mostrar o toast antes de redirecionar
        setTimeout(async () => {
          try {
            // Verificar se o usuário é administrador
            const { data: adminData } = await supabase
              .from('adm')
              .select('usuario')
              .eq('email', email)
              .eq('usuario', true)
              .single()

            if (adminData) {
              // Usuário é administrador ativo, redirecionar para painel admin
              router.push("/admin/dashboard")
              return
            }
          } catch (error) {
            // Se houver erro na verificação de admin, continuar com fluxo normal
            console.log('Usuário não é administrador, seguindo fluxo normal')
          }

          // Verificar se há uma URL de redirecionamento salva
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
          if (redirectUrl) {
            sessionStorage.removeItem('redirectAfterLogin')
            window.location.href = redirectUrl
          } else {
            router.push("/")
          }
        }, 1000)
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

  const handleGoogleSignIn = async () => {
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
          title: "Erro no login com Google",
          description: error.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login com Google.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <HydrationSafeWrapper>
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
             <div className="mb-6 text-center">
               <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
               <p className="text-gray-600 text-sm lg:text-base">
                 Entre na sua conta para continuar navegando pelos melhores veículos
               </p>
             </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4 max-w-sm mx-auto w-full">
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
                className="h-10 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500"
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
                  className="h-10 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 pr-10"
                  required
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
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="h-4 w-4 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  disabled={loading}
                />
                <Label htmlFor="remember" className="text-xs text-gray-600">
                  Lembrar-me
                </Label>
              </div>
              <Link href="#" className="text-xs text-orange-500 hover:text-orange-600">
                Esqueci a senha
              </Link>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
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

            {/* Google login */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-10 border-gray-200 bg-gray-100 text-gray-400 font-medium text-sm cursor-not-allowed"
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

            {/* Register link */}
            <div className="text-center pt-2">
              <span className="text-gray-600 text-sm">Não tem uma conta? </span>
              <Link href="/cadastro" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>

        {/* Right side - Image (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://ecdmpndeunbzhaihabvi.supabase.co/storage/v1/object/public/telas//Mulher%20no%20Showroom%20de%20Carros.png"
          alt="Mulher no Showroom de Carros"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-6 right-6 text-white text-right">
          <h2 className="text-2xl font-bold mb-1">Bem-vindo de volta</h2>
          <p className="text-base opacity-90">Continue sua jornada em busca do veículo perfeito</p>
        </div>
        </div>
      </div>
      </div>
    </HydrationSafeWrapper>
  )
}
