"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Heart,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Palette,
  Car,
  Shield,
  CreditCard,
  RefreshCw,
  Banknote,
  Star,
  Clock,
  Building2,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
  CheckCircle,
  AlertCircle,
  // Removed duplicate User import since it's already imported from @supabase/supabase-js
  UserPlus,
  Gift,
  TrendingUp,
  Users,
} from "lucide-react"
import type { Veiculo } from "@/lib/supabase/veiculos"
import { createClient } from "@/lib/supabase/client"
import { createLead } from "@/lib/supabase/vehicle-favorites"
import type { User } from "@supabase/supabase-js"

interface DadosAgencia {
  id: string
  user_id: string
  nome_fantasia?: string
  razao_social?: string
  cnpj?: string
  telefone_principal?: string
  whatsapp?: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  logo_url?: string
  site?: string
  avaliacao?: string
  total_avaliacoes?: string
  created_at: string
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("pt-BR").format(num)
}

const formatCnpj = (cnpj?: string) => {
  if (!cnpj) return ""
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

const formatPhone = (phone?: string) => {
  if (!phone) return ""
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  return phone
}

const maskPhone = (phone?: string) => {
  if (!phone) return ""
  const formatted = formatPhone(phone)
  // Formato: (73) 9xxxx-8182
  return formatted.replace(/^(\(\d{2}\) \d)\d{4}/, "$1xxxx")
}

const maskEmail = (email?: string) => {
  if (!email) return ""
  // Formato: alexxxxxxxx967@gmail.com
  const [username, domain] = email.split("@")
  if (!username || !domain) return email
  
  const firstChar = username.charAt(0)
  const lastThreeChars = username.slice(-3)
  const maskedPart = "x".repeat(username.length - 4)
  
  return `${firstChar}${maskedPart}${lastThreeChars}@${domain}`
}

export default function VeiculoPage() {
  const params = useParams()
  const router = useRouter()
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null)
  const [dadosAgencia, setDadosAgencia] = useState<DadosAgencia | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorito, setIsFavorito] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingContactType, setPendingContactType] = useState<"phone" | "whatsapp" | "email" | null>(null)

  const vehicleId = params.id as string

  useEffect(() => {
    if (vehicleId) {
      loadVehicleData()
    }
    checkUser()
  }, [vehicleId])

  const checkUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error("Erro ao verificar usuário:", error)
    }
  }

  const loadVehicleData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Buscar dados do veículo
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("veiculos")
        .select("*")
        .eq("id", vehicleId)
        .single()

      if (vehicleError) {
        throw new Error("Veículo não encontrado")
      }

      setVeiculo(vehicleData)

      // Buscar dados da agência
      if (vehicleData.user_id) {
        const { data: agencyData, error: agencyError } = await supabase
          .from("dados_agencia")
          .select("*")
          .eq("user_id", vehicleData.user_id)
          .single()

        if (agencyData) {
          setDadosAgencia(agencyData)
        } else {
          // Fallback para dados do profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", vehicleData.user_id)
            .single()

          if (profileData) {
            const dadosAgenciaFromProfile: DadosAgencia = {
              id: profileData.id,
              user_id: profileData.id,
              nome_fantasia: profileData.nome_completo || profileData.email,
              telefone_principal: profileData.telefone,
              whatsapp: profileData.telefone,
              email: profileData.email,
              cidade: profileData.cidade,
              estado: profileData.estado,
              created_at: profileData.created_at,
            }
            setDadosAgencia(dadosAgenciaFromProfile)
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados do veículo:", err)
      setError("Erro ao carregar dados do veículo")
    } finally {
      setLoading(false)
    }
  }

  const handleContact = async (type: "phone" | "whatsapp" | "email") => {
    if (!dadosAgencia) return

    // Verificar se o usuário está logado
    if (!user) {
      setPendingContactType(type)
      setShowAuthModal(true)
      return
    }

    // Criar lead quando usuário faz contato
    try {
      if (veiculo && user) {
        await createLead(
          user.id,
          veiculo?.id || '',
          veiculo.user_id || '',
          type === 'phone' ? 'contact_whatsapp' : // Usando contact_whatsapp para chamadas telefônicas também
          type === 'whatsapp' ? 'contact_whatsapp' :
          'contact_email',
          {
            marca: veiculo.marca_nome,
            modelo: veiculo.modelo_nome,
            ano: veiculo.ano_fabricacao,
            preco: veiculo.preco
          }
        )
      }
    } catch (error) {
      console.error("Erro ao criar lead:", error)
    }

    const telefone = dadosAgencia.whatsapp || dadosAgencia.telefone_principal

    switch (type) {
      case "phone":
        if (telefone && typeof window !== 'undefined') window.open(`tel:${telefone}`)
        break
      case "whatsapp":
        if (telefone) {
          const message = `Olá! Vi o ${veiculo?.marca_nome} ${veiculo?.modelo_nome} ${veiculo?.ano_fabricacao} no site e gostaria de mais informações.`
          const whatsappUrl = `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
          if (typeof window !== 'undefined') window.open(whatsappUrl, "_blank")
        }
        break
      case "email":
        if (dadosAgencia.email) {
          const subject = `Interesse em ${veiculo?.marca_nome} ${veiculo?.modelo_nome}`
          const body = `Olá! Vi o ${veiculo?.marca_nome} ${veiculo?.modelo_nome} ${veiculo?.ano_fabricacao} no site e gostaria de mais informações.`
          if (typeof window !== 'undefined') window.open(`mailto:${dadosAgencia.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
        }
        break
    }
  }

  const nextImage = () => {
    if (veiculo?.fotos) {
      setCurrentImageIndex((prev) => (prev + 1) % (veiculo.fotos?.length || 1))
    }
  }

  const prevImage = () => {
    if (veiculo?.fotos) {
      setCurrentImageIndex((prev) => (prev - 1 + (veiculo.fotos?.length || 1)) % (veiculo.fotos?.length || 1))
    }
  }

  const handleAuthModalClose = () => {
    setShowAuthModal(false)
    setPendingContactType(null)
  }

  const handleLoginSuccess = () => {
    setShowAuthModal(false)
    // Recarregar dados do usuário
    checkUser()
    // Se havia um tipo de contato pendente, executar após o login
    if (pendingContactType) {
      setTimeout(() => {
        handleContact(pendingContactType)
        setPendingContactType(null)
      }, 1000)
    }
  }

  const redirectToLogin = () => {
    // Salvar a URL atual para retornar após o login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.href)
    }
    router.push('/login')
  }

  const redirectToRegister = () => {
    // Salvar a URL atual para retornar após o cadastro
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.href)
    }
    router.push('/cadastro')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-12 w-12 mx-auto mb-4 text-orange-500 animate-pulse" />
          <p className="text-gray-600">Carregando veículo...</p>
        </div>
      </div>
    )
  }

  if (error || !veiculo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Veículo não encontrado</h1>
          <p className="text-gray-600 mb-4">O veículo que você está procurando não foi encontrado.</p>
          <Link href="/veiculos">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Ver todos os veículos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const imagens = veiculo.fotos || []

  return (
    <>
      <Head>
        <title>{veiculo.marca_nome} {veiculo.modelo_nome} {veiculo.ano_fabricacao} - {formatPrice(veiculo.preco || 0)}</title>
        <meta name="description" content={`${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao} por ${formatPrice(veiculo.preco || 0)}. ${veiculo.descricao || ''}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao}`} />
        <meta property="og:description" content={`${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao} por ${formatPrice(veiculo.preco || 0)}. ${veiculo.quilometragem ? `${formatNumber(veiculo.quilometragem)} km` : ''} ${veiculo.combustivel || ''}`} />
        {imagens.length > 0 && <meta property="og:image" content={imagens[0]} />}
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao}`} />
        <meta name="twitter:description" content={`${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao} por ${formatPrice(veiculo.preco || 0)}`} />
        {imagens.length > 0 && <meta name="twitter:image" content={imagens[0]} />}
        
        {/* WhatsApp */}
        {imagens.length > 0 && <meta property="og:image:width" content="1200" />}
        {imagens.length > 0 && <meta property="og:image:height" content="630" />}
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header Profissional */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {veiculo.marca_nome} {veiculo.modelo_nome} {veiculo.ano_fabricacao}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatPrice(veiculo.preco || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFavorito(!isFavorito)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Heart className={`h-4 w-4 ${isFavorito ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Galeria de Imagens */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  {imagens.length > 0 ? (
                    <div className="relative">
                      <div className="aspect-video relative bg-gray-100">
                        <Image
                          src={imagens[currentImageIndex]}
                          alt={`${veiculo.marca_nome} ${veiculo.modelo_nome}`}
                          fill
                          className="object-cover"
                          priority
                        />
                        
                        {/* Marca d'água */}
                        <div className="absolute bottom-4 left-4 opacity-25 pointer-events-none">
                          <Image
                            src="https://ecdmpndeunbzhaihabvi.supabase.co/storage/v1/object/public/telas//3d%20sem%20fundo.png"
                            alt="Marca d'água"
                            width={60}
                            height={60}
                            className="object-contain"
                          />
                        </div>
                        {imagens.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      {imagens.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto">
                          {imagens.map((img, index) => (
                            <button
                              title={`Ver imagem ${index + 1}`}
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                                index === currentImageIndex ? "border-orange-500" : "border-gray-200"
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`Miniatura ${index + 1}`}
                                width={64}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detalhes do Veículo */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Detalhes do Veículo</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Ano</p>
                        <p className="font-medium">{veiculo.ano_fabricacao}/{veiculo.ano_modelo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Quilometragem</p>
                        <p className="font-medium">{formatNumber(veiculo.quilometragem || 0)} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Combustível</p>
                        <p className="font-medium">{veiculo.combustivel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Câmbio</p>
                        <p className="font-medium">{veiculo.cambio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Cor</p>
                        <p className="font-medium">{veiculo.cor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="font-medium">{veiculo.tipo_veiculo}</p>
                      </div>
                    </div>
                  </div>

                  {(veiculo as any).observacoes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="font-medium mb-2">Observações</h3>
                        <p className="text-gray-600 text-sm">{(veiculo as any).observacoes}</p>
                      </div>
                    </>
                  )}

                  {/* Opcionais */}
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-2">
                    {veiculo.aceita_financiamento && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Aceita Financiamento
                      </Badge>
                    )}
                    {veiculo.aceita_troca && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Aceita Troca
                      </Badge>
                    )}
                    {veiculo.aceita_parcelamento && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" />
                        Aceita Parcelamento
                      </Badge>
                    )}
                    {(veiculo as any).ipva_pago && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        IPVA Pago
                      </Badge>
                    )}
                    {(veiculo as any).licenciado && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Licenciado
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Informações da Agência e Contato */}
            <div className="lg:col-span-1 space-y-6">
              {/* Card de Preço */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {formatPrice(veiculo.preco || 0)}
                    </div>
                    {(veiculo as any).preco_promocional && (veiculo as any).preco_promocional < veiculo.preco && (
                      <div className="text-sm text-gray-500 line-through">
                        De: {formatPrice(veiculo.preco)}
                      </div>
                    )}
                  </div>

                  {dadosAgencia && (
                    <>
                      <Separator className="mb-6" />
                      <div className="text-center mb-6">
                        {dadosAgencia.logo_url ? (
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100">
                            <Image
                              src={dadosAgencia.logo_url}
                              alt={dadosAgencia.nome_fantasia || "Logo"}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-orange-600" />
                          </div>
                        )}
                        <h3 className="font-semibold text-lg">
                          {dadosAgencia.nome_fantasia || dadosAgencia.razao_social}
                        </h3>
                        {dadosAgencia.cidade && dadosAgencia.estado && (
                          <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {dadosAgencia.cidade}, {dadosAgencia.estado}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {user ? (
                          <>
                            <Button
                              onClick={() => handleContact("whatsapp")}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleContact("phone")}
                              className="w-full"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Ligar
                            </Button>
                            {dadosAgencia.email && (
                              <Button
                                variant="outline"
                                onClick={() => handleContact("email")}
                                className="w-full"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                E-mail
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            onClick={redirectToRegister}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Cadastre-se
                          </Button>
                        )}
                      </div>

                      {(dadosAgencia.telefone_principal || dadosAgencia.whatsapp) && (
                        <>
                          <Separator className="my-4" />
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2 mb-1">
                              <Phone className="h-3 w-3" />
                              <span>
                                {user 
                                  ? formatPhone(dadosAgencia.telefone_principal || dadosAgencia.whatsapp)
                                  : maskPhone(dadosAgencia.telefone_principal || dadosAgencia.whatsapp)
                                }
                              </span>
                            </div>
                            {dadosAgencia.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">
                                  {user 
                                    ? dadosAgencia.email
                                    : maskEmail(dadosAgencia.email)
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Card de Incentivo ao Cadastro (apenas para usuários não logados) */}
              {!user && (
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-500 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-orange-900 mb-2">
                        Crie sua conta gratuita!
                      </h3>
                      <p className="text-sm text-orange-700 mb-4">
                        Tenha acesso completo a todos os recursos e entre em contato direto com as agências.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <CheckCircle className="h-4 w-4 text-orange-500" />
                          <span>Contato direto com agências</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <span>Histórico de veículos visualizados</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <Heart className="h-4 w-4 text-orange-500" />
                          <span>Favoritar veículos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span>Receber ofertas personalizadas</span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2">
                        <Button
                          onClick={redirectToRegister}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Criar Conta Grátis
                        </Button>
                        <Button
                          onClick={redirectToLogin}
                          variant="outline"
                          className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Já tenho conta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Autenticação */}
      <Dialog open={showAuthModal} onOpenChange={handleAuthModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-orange-500" />
              Entre em contato com a agência
            </DialogTitle>
            <DialogDescription>
              Para entrar em contato com a agência e demonstrar seu interesse neste veículo, você precisa estar logado em sua conta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 mb-1">Por que fazer login?</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• A agência poderá entrar em contato com você</li>
                    <li>• Você receberá atualizações sobre o veículo</li>
                    <li>• Histórico de veículos visualizados</li>
                    <li>• Favoritar veículos de interesse</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={redirectToLogin}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Fazer Login
              </Button>
              <Button
                onClick={redirectToRegister}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleAuthModalClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}