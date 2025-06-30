"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ArrowLeft,
  Camera,
  User,
  Car,
  Building2,
  BarChart3,
  Plus,
  Loader2,
  Save,
  Crown,
  Star,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  getUserProfile,
  upsertUserProfile,
  checkCpfExists,
  checkCnpjExists,
  type UserProfile,
} from "@/lib/supabase/profiles"
import { uploadProfilePhoto, deleteProfilePhoto } from "@/lib/supabase/profile-storage"
import { useSubscription } from "@/hooks/use-subscription"

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export default function PerfilPage() {
  const [cepLoading, setCepLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [photoUploading, setPhotoUploading] = useState(false)

  const [profileData, setProfileData] = useState({
    nome_completo: "",
    whatsapp: "",
    cpf: "",
    cnpj: "",
    documento: "",
    email: "",
    tipo_usuario: "comprador",
  })

  const [enderecoData, setEnderecoData] = useState({
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  })

  // Estados para faturas pendentes
  const [pendingInvoices, setPendingInvoices] = useState<{
    hasPending: boolean
    count: number
    totalValue: number
    loading: boolean
    hasCustomerId: boolean
  }>({ hasPending: false, count: 0, totalValue: 0, loading: true, hasCustomerId: false })

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { subscriptionStatus } = useSubscription()

  // Verificar usuário e carregar perfil
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/login")
          return
        }

        setUser(user)

        // Carregar perfil do usuário
        const userProfile = await getUserProfile(user.id)

        if (userProfile) {
          setProfile(userProfile)

          // Preencher formulário com dados do perfil
          setProfileData({
            nome_completo: userProfile.nome_completo || "",
            whatsapp: userProfile.whatsapp || "",
            cpf: userProfile.cpf ? formatCpf(userProfile.cpf) : "",
            cnpj: userProfile.cnpj ? formatCnpj(userProfile.cnpj) : "",
            documento: userProfile.documento || "",
            email: userProfile.email || user.email || "",
            tipo_usuario: userProfile.tipo_usuario || "comprador",
          })

          setEnderecoData({
            cep: userProfile.cep || "",
            endereco: userProfile.endereco || "",
            numero: userProfile.numero || "",
            complemento: userProfile.complemento || "",
            bairro: userProfile.bairro || "",
            cidade: userProfile.cidade || "",
            estado: userProfile.estado || "",
          })

          // Verificar faturas pendentes se for vendedor ou agência
          if (userProfile.tipo_usuario === "vendedor" || userProfile.tipo_usuario === "agencia") {
            checkPendingInvoices(user.id)
          } else {
            setPendingInvoices(prev => ({ ...prev, loading: false }))
          }
        } else {
          // Se não existe perfil, criar um básico
          setProfileData((prev) => ({
            ...prev,
            email: user.email || "",
            nome_completo: user.user_metadata?.full_name || "",
            tipo_usuario: "comprador", // Definir comprador como padrão
          }))
          setPendingInvoices(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do usuário.",
        })
        setPendingInvoices(prev => ({ ...prev, loading: false }))
      } finally {
        setProfileLoading(false)
      }
    }

    getUser()
  }, [supabase, router, toast])

  // Verificar faturas pendentes
  const checkPendingInvoices = async (userId: string) => {
    try {
      setPendingInvoices(prev => ({ ...prev, loading: true }))

      // Buscar customer_id do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("asaas_customer_id")
        .eq("id", userId)
        .single()

      if (!profile?.asaas_customer_id) {
        setPendingInvoices({ hasPending: false, count: 0, totalValue: 0, loading: false, hasCustomerId: false })
        return
      }

      // Buscar pagamentos pendentes
      const response = await fetch(`/api/asaas/payments/customer/${profile.asaas_customer_id}`)
      
      if (!response.ok) {
        console.error("❌ [PERFIL] Erro ao buscar pagamentos:", response.status, response.statusText)
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        console.error("❌ [PERFIL] Detalhes do erro:", errorData)
        throw new Error(`Erro ao buscar pagamentos: ${errorData.error || response.statusText}`)
      }

      const paymentsData = await response.json()
      const payments = paymentsData.data || paymentsData || []
      
      // Filtrar apenas pagamentos pendentes ou vencidos
      const pendingPayments = payments.filter((payment: any) => {
        const now = new Date()
        const dueDate = new Date(payment.dueDate)
        
        return (
          payment.status === "PENDING" || 
          payment.status === "AWAITING_PAYMENT" || 
          payment.status === "OVERDUE" ||
          (payment.status === "PENDING" && dueDate < now)
        )
      })

      const totalValue = pendingPayments.reduce((sum: number, payment: any) => sum + (payment.value || 0), 0)

      setPendingInvoices({
        hasPending: pendingPayments.length > 0,
        count: pendingPayments.length,
        totalValue: totalValue,
        loading: false,
        hasCustomerId: true
      })

    } catch (error) {
      console.error("Erro ao verificar faturas pendentes:", error)
      setPendingInvoices({ hasPending: false, count: 0, totalValue: 0, loading: false, hasCustomerId: false })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatCep = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2")
  }

  const formatCpf = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatCnpj = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
  }

  const validateCpf = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, "")

    if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
      return false
    }

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
    }
    let checkDigit = 11 - (sum % 11)
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
    if (checkDigit !== parseInt(cleanCpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
    }
    checkDigit = 11 - (sum % 11)
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
    if (checkDigit !== parseInt(cleanCpf.charAt(10))) return false

    return true
  }

  const buscarCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")

    if (cleanCep.length !== 8) {
      toast({
        variant: "destructive",
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido com 8 dígitos.",
      })
      return
    }

    setCepLoading(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data: ViaCepResponse = await response.json()

      if (data.erro) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "O CEP digitado não foi encontrado.",
        })
        return
      }

      setEnderecoData((prev) => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }))

      toast({
        title: "CEP encontrado!",
        description: "Endereço preenchido automaticamente.",
      })
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Tente novamente.",
      })
    } finally {
      setCepLoading(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    setEnderecoData((prev) => ({ ...prev, cep: formatted }))

    if (formatted.replace(/\D/g, "").length === 8) {
      buscarCep(formatted)
    }
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEnderecoChange = (field: string, value: string) => {
    setEnderecoData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
      })
      return
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
      })
      return
    }

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ""

    // Imediatamente processar a troca da foto
    await handlePhotoUpload(file)
  }

  const handlePhotoUpload = async (file: File) => {
    if (!file || !user?.id) return

    setPhotoUploading(true)

    try {
      // Se já existe uma foto, deletar a anterior
      if (profile?.foto_perfil) {
        console.log("🗑️ Deletando foto anterior:", profile.foto_perfil)
        await deleteProfilePhoto(user.id, profile.foto_perfil)
      }

      // Upload da nova foto
      console.log("📤 Fazendo upload da nova foto...")
      const uploadResult = await uploadProfilePhoto(user.id, file)

      if (uploadResult.success && uploadResult.url) {
        console.log("✅ Upload realizado com sucesso:", uploadResult.url)
        
        // Atualizar perfil com nova foto
        const updatedProfile = await upsertUserProfile(user.id, {
          ...profileData,
          foto_perfil: uploadResult.url,
          cpf: profileData.cpf.replace(/\D/g, ""),
          cnpj: profileData.cnpj.replace(/\D/g, ""),
          whatsapp: profileData.whatsapp.replace(/\D/g, ""),
          ...enderecoData,
          cep: enderecoData.cep.replace(/\D/g, ""),
        })

        if (updatedProfile) {
          setProfile(updatedProfile)

          toast({
            title: "Foto trocada com sucesso!",
            description: "Sua foto de perfil foi substituída automaticamente.",
          })
        }
      } else {
        throw new Error("Falha no upload da foto")
      }
    } catch (error) {
      console.error("❌ Erro ao fazer upload da foto:", error)
      toast({
        variant: "destructive",
        title: "Erro na troca da foto",
        description: "Não foi possível trocar a foto. Tente novamente.",
      })
    } finally {
      setPhotoUploading(false)
    }
  }



  const handleSaveProfile = async () => {
    if (!user?.id) return

    // Validações básicas
    if (!profileData.nome_completo.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "O nome completo é obrigatório.",
      })
      return
    }

    if (!profileData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "O email é obrigatório.",
      })
      return
    }

    // Validar CPF se preenchido
    if (profileData.cpf && !validateCpf(profileData.cpf)) {
      toast({
        variant: "destructive",
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido.",
      })
      return
    }

    setSaveLoading(true)

    try {
      // Verificar se CPF já existe (se foi alterado)
      const cleanCpf = profileData.cpf.replace(/\D/g, "")
      if (cleanCpf && cleanCpf !== profile?.cpf) {
        const cpfExists = await checkCpfExists(cleanCpf, user.id)
        if (cpfExists) {
          toast({
            variant: "destructive",
            title: "CPF já cadastrado",
            description: "Este CPF já está sendo usado por outro usuário.",
          })
          setSaveLoading(false)
          return
        }
      }

      // Verificar se CNPJ já existe (se foi alterado)
      const cleanCnpj = profileData.cnpj.replace(/\D/g, "")
      if (cleanCnpj && cleanCnpj !== profile?.cnpj) {
        const cnpjExists = await checkCnpjExists(cleanCnpj, user.id)
        if (cnpjExists) {
          toast({
            variant: "destructive",
            title: "CNPJ já cadastrado",
            description: "Este CNPJ já está sendo usado por outro usuário.",
          })
          setSaveLoading(false)
          return
        }
      }

      // Salvar perfil
      const updatedProfile = await upsertUserProfile(user.id, {
        ...profileData,
        cpf: cleanCpf,
        cnpj: cleanCnpj,
        whatsapp: profileData.whatsapp.replace(/\D/g, ""),
        ...enderecoData,
        cep: enderecoData.cep.replace(/\D/g, ""),
      })

      if (updatedProfile) {
        setProfile(updatedProfile)
        toast({
          title: "Perfil salvo!",
          description: "Suas informações foram atualizadas com sucesso.",
        })

        // Se mudou para vendedor ou agência, verificar faturas
        if (profileData.tipo_usuario === "vendedor" || profileData.tipo_usuario === "agencia") {
          checkPendingInvoices(user.id)
        }
      }
    } catch (error: any) {
      console.error("❌ [HANDLE_SAVE_PROFILE] Erro ao salvar perfil:", error)
      
      // Extrair mensagem de erro mais específica
      let errorMessage = "Não foi possível salvar o perfil. Tente novamente."
      let errorTitle = "Erro ao salvar"
      
      if (error?.message) {
        if (error.message.includes("Erro de permissão")) {
          errorTitle = "Erro de Permissão"
          errorMessage = "Problema de permissão no banco de dados. Entre em contato com o suporte."
        } else if (error.message.includes("Dados duplicados")) {
          errorTitle = "Dados Duplicados"
          errorMessage = "CPF ou CNPJ já estão sendo usados por outro usuário."
        } else if (error.message.includes("Campos obrigatórios")) {
          errorTitle = "Campos Obrigatórios"
          errorMessage = "Preencha todos os campos obrigatórios."
        } else if (error.message.includes("Erro ao verificar usuário")) {
          errorTitle = "Erro de Conexão"
          errorMessage = "Problema de conexão com o banco de dados. Tente novamente."
        } else {
          // Usar a mensagem de erro customizada se disponível
          errorMessage = error.message
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const accountTypes = [
    {
      id: "comprador",
      title: "Comprador",
      description: "Quero buscar, favoritar e comprar veículos",
      icon: <User className="h-6 w-6 text-blue-500" />,
      color: "border-blue-200 bg-blue-50",
    },
    {
      id: "vendedor",
      title: "Vendedor",
      description: "Quero cadastrar e vender veículos individualmente",
      icon: <Car className="h-6 w-6 text-orange-500" />,
      color: "border-orange-200 bg-orange-50",
    },
    {
      id: "agencia",
      title: "Agência",
      description: "Represento uma agência e gerencio múltiplos vendedores",
      icon: <Building2 className="h-6 w-6 text-green-500" />,
      color: "border-green-200 bg-green-50",
    },
  ]

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Meu Perfil</h1>
          {profile?.perfil_configurado && (
            <div className="ml-auto">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Perfil Configurado</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Layout Grid Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna Principal (Esquerda) - Informações do Perfil */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Photo - Mobile Only */}
            <div className="lg:hidden text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto">
                  <Image
                    src={profile?.foto_perfil || "/placeholder.svg?height=96&width=96&text=Foto+Perfil"}
                    alt="Foto do perfil"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoSelect} 
                  className="hidden" 
                  id="photo-upload-mobile"
                  aria-label="Selecionar foto de perfil"
                />
                <label
                  htmlFor="photo-upload-mobile"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </label>
              </div>

              {photoUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    <p className="text-sm text-gray-600">Trocando foto...</p>
                  </div>
                </div>
              )}

              {!photoUploading && <p className="text-sm text-gray-600 mt-2">Toque na foto para trocar</p>}
            </div>

            {/* Personal Information */}
            <Card>
              <CardContent className="p-4 lg:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="nome_completo" className="text-sm font-medium text-gray-700">
                      Nome completo *
                    </Label>
                    <Input
                      id="nome_completo"
                      type="text"
                      value={profileData.nome_completo}
                      onChange={(e) => handleProfileChange("nome_completo", e.target.value)}
                      className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="mt-1 border-gray-300 bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado aqui</p>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                      Número (Whatsapp) *
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={profileData.whatsapp}
                      onChange={(e) => handleProfileChange("whatsapp", formatPhone(e.target.value))}
                      className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      maxLength={16}
                      placeholder="(00) 0 0000-0000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Digite seu número com DDD</p>
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                      CPF
                    </Label>
                    <Input
                      id="cpf"
                      type="text"
                      value={profileData.cpf}
                      onChange={(e) => handleProfileChange("cpf", formatCpf(e.target.value))}
                      className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      maxLength={14}
                      placeholder="000.000.000-00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Obrigatório para vender veículos</p>
                  </div>

                  {profileData.tipo_usuario === "agencia" && (
                    <div className="md:col-span-2">
                      <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                        CNPJ
                      </Label>
                      <Input
                        id="cnpj"
                        type="text"
                        value={profileData.cnpj}
                        onChange={(e) => handleProfileChange("cnpj", formatCnpj(e.target.value))}
                        className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        maxLength={18}
                        placeholder="00.000.000/0000-00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Obrigatório para agências</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="p-4 lg:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
                      CEP
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="cep"
                        type="text"
                        value={enderecoData.cep}
                        onChange={handleCepChange}
                        placeholder="00000000"
                        className="flex-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        maxLength={8}
                      />
                      <Button
                        type="button"
                        onClick={() => buscarCep(enderecoData.cep)}
                        disabled={cepLoading || enderecoData.cep.length !== 8}
                        className="bg-orange-500 hover:bg-orange-600 px-6"
                      >
                        {cepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Digite apenas números</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                        Endereço
                      </Label>
                      <Input
                        id="endereco"
                        type="text"
                        value={enderecoData.endereco}
                        onChange={(e) => handleEnderecoChange("endereco", e.target.value)}
                        className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Rua, Avenida..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
                        Número
                      </Label>
                      <Input
                        id="numero"
                        type="text"
                        value={enderecoData.numero}
                        onChange={(e) => handleEnderecoChange("numero", e.target.value)}
                        className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="complemento" className="text-sm font-medium text-gray-700">
                      Complemento
                    </Label>
                    <Input
                      id="complemento"
                      type="text"
                      value={enderecoData.complemento}
                      onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
                      className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Apartamento, sala, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro" className="text-sm font-medium text-gray-700">
                      Bairro
                    </Label>
                    <Input
                      id="bairro"
                      type="text"
                      value={enderecoData.bairro}
                      onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
                      className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Centro, Vila..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                        Cidade
                      </Label>
                      <Input
                        id="cidade"
                        type="text"
                        value={enderecoData.cidade}
                        onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
                        className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="São Paulo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                        Estado
                      </Label>
                      <Input
                        id="estado"
                        type="text"
                        value={enderecoData.estado}
                        onChange={(e) => handleEnderecoChange("estado", e.target.value)}
                        className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        maxLength={2}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Type */}
            <Card>
              <CardContent className="p-4 lg:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Tipo de Conta</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Escolha o tipo que melhor descreve como você pretende usar o app
                </p>

                <RadioGroup
                  value={profileData.tipo_usuario}
                  onValueChange={(value) => handleProfileChange("tipo_usuario", value)}
                  className="space-y-3"
                >
                  {accountTypes.map((type) => (
                    <div key={type.id} className="relative">
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          profileData.tipo_usuario === type.id
                            ? `${type.color} border-current`
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">{type.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{type.title}</h3>
                              <RadioGroupItem value={type.id} className="text-orange-500" />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Action Buttons - Mobile */}
            <div className="lg:hidden flex flex-col gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Perfil
                  </>
                )}
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar (Direita) - Foto, Status e Ações */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Photo - Desktop Only */}
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
                      <Image
                        src={profile?.foto_perfil || "/placeholder.svg?height=128&width=128&text=Foto+Perfil"}
                        alt="Foto do perfil"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoSelect} 
                      className="hidden" 
                      id="photo-upload-desktop"
                      aria-label="Selecionar foto de perfil"
                    />
                    <label
                      htmlFor="photo-upload-desktop"
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <Camera className="h-4 w-4 text-gray-600" />
                    </label>
                  </div>

                  {photoUploading && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        <p className="text-sm text-gray-600">Trocando foto...</p>
                      </div>
                    </div>
                  )}

                  {!photoUploading && (
                    <>
                      <h3 className="font-medium text-gray-900 mb-1">{profileData.nome_completo || "Seu Nome"}</h3>
                      <p className="text-sm text-gray-600 mb-3">{profileData.email}</p>
                      <p className="text-xs text-gray-500">Clique na foto para trocar</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Premium Upgrade Card - Only for sellers and agencies without active subscription */}
            {(profileData.tipo_usuario === "vendedor" || profileData.tipo_usuario === "agencia") && 
             !subscriptionStatus.hasAccess && (
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 border-0 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-600/20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                <CardContent className="relative p-4 lg:p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Crown className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="text-base lg:text-lg font-bold">Torne-se Premium</h3>
                        <p className="text-orange-100 text-xs lg:text-sm">Desbloqueie todo o potencial</p>
                      </div>
                    </div>
                    <div className="bg-yellow-400 text-orange-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      🔥 OFERTA
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 lg:mb-6">
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300 fill-current" />
                      <span>Anúncios em destaque</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <Zap className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300" />
                      <span>Estatísticas avançadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300" />
                      <span>Suporte prioritário</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300" />
                      <span>Mais vendas garantidas</span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                    <div className="text-center lg:text-left">
                      <p className="text-orange-100 text-xs line-through">R$ 99,90</p>
                      <p className="text-white font-bold text-sm lg:text-base">
                        A partir de <span className="text-lg lg:text-2xl">R$ 49,90</span>
                        <span className="text-xs lg:text-sm text-orange-100">/mês</span>
                      </p>
                    </div>
                    <Link href="/planos">
                      <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-4 lg:px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm">
                        Ver Planos
                        <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Subscription Card - Only for sellers and agencies with active subscription */}
            {(profileData.tipo_usuario === "vendedor" || profileData.tipo_usuario === "agencia") && 
             subscriptionStatus.hasAccess && (
              <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-0 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-green-500/20 to-emerald-600/20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                <CardContent className="relative p-4 lg:p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Crown className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="text-base lg:text-lg font-bold">Plano Ativo</h3>
                        <p className="text-green-100 text-xs lg:text-sm">
                          {subscriptionStatus.planType?.charAt(0).toUpperCase() + 
                           (subscriptionStatus.planType?.slice(1) || 'Premium')}
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
                      ✅ ATIVO
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 lg:mb-6">
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-300 fill-current" />
                      <span>Todos os recursos liberados</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-green-300" />
                      <span>
                        {subscriptionStatus.expirationDate 
                          ? `Válido até ${subscriptionStatus.expirationDate.toLocaleDateString('pt-BR')}`
                          : 'Plano ativo'
                        }
                      </span>
                    </div>
                    {subscriptionStatus.daysUntilExpiration !== null && subscriptionStatus.daysUntilExpiration > 0 && (
                      <div className="flex items-center gap-2 text-xs lg:text-sm">
                        <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-300" />
                        <span>
                          {subscriptionStatus.daysUntilExpiration} dia(s) restante(s)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                    <div className="text-center lg:text-left">
                      <p className="text-green-100 text-xs">Status da assinatura</p>
                      <p className="text-white font-bold text-sm lg:text-base">
                        {subscriptionStatus.needsRenewal ? (
                          <span className="text-yellow-300">⚠️ Renovação necessária</span>
                        ) : (
                          <span className="text-green-300">✅ Em dia</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/minhas-cobrancas">
                        <Button className="bg-white/20 text-white hover:bg-white/30 font-bold px-4 lg:px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm backdrop-blur-sm">
                          <CreditCard className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                          Cobranças
                        </Button>
                      </Link>
                      {subscriptionStatus.needsRenewal && (
                        <Link href="/checkout?plano=profissional&action=renewal">
                          <Button className="bg-white text-green-600 hover:bg-green-50 font-bold px-4 lg:px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm">
                            Renovar
                            <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Invoices Alert */}
            {(profileData.tipo_usuario === "vendedor" || profileData.tipo_usuario === "agencia") && 
             (pendingInvoices.loading || pendingInvoices.hasCustomerId) && (
              <Card className={`border-2 ${
                pendingInvoices.loading 
                  ? 'border-gray-200 bg-gray-50' 
                  : pendingInvoices.hasPending 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-green-200 bg-green-50'
              }`}>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                      pendingInvoices.loading 
                        ? 'bg-gray-100' 
                        : pendingInvoices.hasPending 
                          ? 'bg-red-100' 
                          : 'bg-green-100'
                    }`}>
                      {pendingInvoices.loading ? (
                        <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 animate-spin" />
                      ) : pendingInvoices.hasPending ? (
                        <AlertCircle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2">
                        {pendingInvoices.loading 
                          ? 'Verificando Faturas...' 
                          : pendingInvoices.hasPending 
                            ? 'Faturas pendentes!' 
                            : 'Faturas em dia!'
                        }
                      </h3>
                      <p className="text-xs lg:text-sm text-gray-600 mb-3">
                        {pendingInvoices.loading 
                          ? 'Aguarde...'
                          : pendingInvoices.hasPending 
                            ? `${pendingInvoices.count} fatura(s) pendente(s) • ${formatPrice(pendingInvoices.totalValue)}`
                            : 'Sem pendências'
                        }
                      </p>
                      
                      {!pendingInvoices.loading && (
                        <Link href="/minhas-cobrancas">
                          <Button 
                            size="sm"
                            className={
                              pendingInvoices.hasPending 
                                ? "bg-red-600 hover:bg-red-700 text-white w-full" 
                                : "bg-green-600 hover:bg-green-700 text-white w-full"
                            }
                          >
                            <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                            {pendingInvoices.hasPending ? 'Pagar Faturas' : 'Ver Cobranças'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions for User Types */}
            {profileData.tipo_usuario === "vendedor" && (
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Dashboard</h3>
                      <p className="text-xs text-gray-600 mb-3">Gerencie vendas</p>
                      <Button size="sm" className="bg-gray-800 hover:bg-gray-900 text-white w-full">
                        <BarChart3 className="h-3 w-3 mr-2" />
                        Acessar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Car className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Vender Veículos</h3>
                      <p className="text-xs text-gray-600 mb-3">Cadastre seus carros</p>
                      <Link href="/cadastro-veiculo">
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                          <Plus className="h-3 w-3 mr-2" />
                          Cadastrar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {profileData.tipo_usuario === "agencia" && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Building2 className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Painel da Agência</h3>
                    <p className="text-xs text-gray-600 mb-3">Gerencie sua agência</p>
                    <Link href="/painel-agencia">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full">
                        <Building2 className="h-3 w-3 mr-2" />
                        Acessar Painel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {profileData.tipo_usuario === "comprador" && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Explorar Veículos</h3>
                    <p className="text-xs text-gray-600 mb-3">Encontre seu carro ideal</p>
                    <Link href="/veiculos">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                        <Car className="h-3 w-3 mr-2" />
                        Ver Veículos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex flex-col gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Perfil
                  </>
                )}
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
