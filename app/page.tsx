"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Car,
  Building2,
  Handshake,
  Settings,
  Menu,
  X,
  Star,
  Users,
  TrendingUp,
  CheckCircle,
  Heart,
  Eye,
  MapPin,
  Fuel,
  User,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getImagensCarrossel, type ImagemCarrossel } from "@/lib/supabase/carrossel"
import { getVeiculosPublicos, type Veiculo } from "@/lib/supabase/veiculos"
import { VeiculoDetalhesModal } from "@/components/veiculo-detalhes-modal"
import { LocationBadge } from "@/components/location-badge"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [carouselImages, setCarouselImages] = useState<ImagemCarrossel[]>([])
  const [loadingCarousel, setLoadingCarousel] = useState(true)
  const [veiculosDestaque, setVeiculosDestaque] = useState<Veiculo[]>([])
  const [loadingVeiculos, setLoadingVeiculos] = useState(true)
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Função para verificar se o veículo é novo (menos de 7 dias)
  const isVeiculoNovo = (dataCadastro: string | undefined) => {
    if (!dataCadastro) return false
    const dataAtual = new Date()
    const dataCadastroVeiculo = new Date(dataCadastro)
    const diferencaEmDias = Math.floor((dataAtual.getTime() - dataCadastroVeiculo.getTime()) / (1000 * 60 * 60 * 24))
    return diferencaEmDias < 7
  }

  // Imagens de fallback caso não haja no banco
  const fallbackImages: ImagemCarrossel[] = [
    {
      id: "fallback-1",
      url: "/images/luxury-car-1.png",
      titulo: "Ferrari 488 GTB",
      descricao: "Ferrari 488 GTB vermelha em estrada de montanha",
      ordem: 1,
      ativo: true,
    },
    {
      id: "fallback-2",
      url: "/images/luxury-car-2.png",
      titulo: "Lamborghini Huracan",
      descricao: "Lamborghini Huracan amarela em cidade moderna",
      ordem: 2,
      ativo: true,
    },
    {
      id: "fallback-3",
      url: "/images/luxury-car-3.png",
      titulo: "Porsche 911 Turbo S",
      descricao: "Porsche 911 Turbo S prata em pista de corrida",
      ordem: 3,
      ativo: true,
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Carrossel automático
  useEffect(() => {
    if (carouselImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1))
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [carouselImages.length])

  // Verificar sessão do usuário
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Erro ao obter usuário:", error)
      } finally {
        setLoadingUser(false)
      }
    }

    getUser()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoadingUser(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao sair",
          description: error.message,
        })
      } else {
        toast({
          title: "Logout realizado com sucesso",
          description: "Você foi desconectado da sua conta.",
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar sair.",
      })
    }
  }

  // Carregar imagens do carrossel
  useEffect(() => {
    const loadCarouselImages = async () => {
      try {
        console.log("🎠 Carregando imagens do carrossel da tabela 'carrossel'...")
        const images = await getImagensCarrossel()

        if (images.length > 0) {
          console.log(`✅ ${images.length} imagens carregadas da tabela carrossel`)
          setCarouselImages(images)
        } else {
          console.log("⚠️ Nenhuma imagem na tabela carrossel, usando fallback")
          setCarouselImages(fallbackImages)
        }
      } catch (error) {
        console.error("❌ Erro ao carregar imagens do carrossel:", error)
        console.log("🔄 Usando imagens de fallback devido ao erro")
        setCarouselImages(fallbackImages)
      } finally {
        setLoadingCarousel(false)
      }
    }

    loadCarouselImages()
  }, [])

  // Carregar veículos em destaque
  useEffect(() => {
    const loadVeiculosDestaque = async () => {
      try {
        console.log("🚗 Carregando veículos em destaque...")
        const { data: veiculos, error } = await getVeiculosPublicos()

        if (error) {
          console.error("❌ Erro ao carregar veículos:", error)
          return
        }

        // Filtrar apenas veículos em destaque
        const veiculosComDestaque = veiculos?.filter((veiculo) => veiculo.destaque === true) || []

        console.log(`✅ ${veiculosComDestaque.length} veículos em destaque encontrados`)
        setVeiculosDestaque(veiculosComDestaque.slice(0, 6)) // Máximo 6 veículos
      } catch (error) {
        console.error("❌ Erro inesperado ao carregar veículos:", error)
      } finally {
        setLoadingVeiculos(false)
      }
    }

    loadVeiculosDestaque()
  }, [])

  const handleVerDetalhes = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 text-white px-4 py-4 transition-all duration-300 ${
          isScrolled ? "bg-black shadow-lg" : "bg-black lg:bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/rx_branco.png"
              alt="RX Autos Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="hover:text-orange-500 transition-colors">
              Início
            </a>
            <Link href="/veiculos" className="hover:text-orange-500 transition-colors">
              Veículos
            </Link>
            <Link href="/simulador" className="hover:text-orange-500 transition-colors">
              Simular
            </Link>
          </nav>

          {/* Location Badge (Desktop) */}
          <div className="hidden lg:block">
            <LocationBadge variant="navbar" />
          </div>

          {/* Desktop Buttons / User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {!loadingUser && user ? (
              <>
                <Link href="/perfil">
                  <Button
                    variant="outline"
                    size="sm"
                    className="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-black transition-colors p-2"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-black transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-black transition-colors"
                  >
                    Entrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black border-t border-gray-700">
            <nav className="flex flex-col p-4 space-y-4">
              <a href="#" className="hover:text-orange-500 transition-colors py-2">
                Início
              </a>
              <Link href="/veiculos" className="hover:text-orange-500 transition-colors py-2">
                Veículos
              </Link>
              <Link href="/simulador" className="hover:text-orange-500 transition-colors py-2">
                Simular
              </Link>
              
              {/* Location Badge (Mobile) */}
              <div className="py-2">
                <LocationBadge variant="sidebar" />
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
                {!loadingUser && user ? (
                  <>
                    <Link href="/perfil">
                      <Button
                        variant="outline"
                        className="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-black transition-colors w-full"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-black transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-black transition-colors w-full"
                      >
                        Entrar
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative h-[400px] sm:h-[500px] overflow-hidden pt-20">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {loadingCarousel ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-20">
              <div className="text-center">
                {/* Skeleton Loading */}
                <div className="relative w-full h-[400px] sm:h-[500px] bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full animate-shimmer"></div>
                  
                  {/* Content Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      {/* RX Autos Logo */}
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xl">RX</span>
                        </div>
                        <div className="text-white">
                          <div className="text-2xl font-bold">RX Autos</div>
                          <div className="text-xs text-white/70">Marketplace de Veículos</div>
                        </div>
                      </div>
                      
                      {/* Text Skeletons */}
                      <div className="space-y-4">
                        <div className="h-10 bg-white/20 rounded-lg w-96 mx-auto animate-pulse"></div>
                        <div className="h-6 bg-white/15 rounded-lg w-80 mx-auto animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded-lg w-64 mx-auto animate-pulse"></div>
                      </div>
                      
                      {/* Loading Indicator */}
                      <div className="flex items-center justify-center gap-3 mt-8">
                        <div className="flex space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-white/80 text-sm font-medium">Carregando carrossel...</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-48 h-1 bg-white/20 rounded-full mx-auto mt-4 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            carouselImages.map((image, index) => (
              <div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.descricao || image.titulo}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=500&width=1200&text=Erro+ao+carregar+imagem"
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Encontre o seu veículo perfeito na RX Autos
              </h1>
              <p className="text-base sm:text-lg text-white/90 drop-shadow-md mb-6">
                Navegue por milhares de veículos de qualidade de agências confiáveis em todo o país.
              </p>
              {!user && (
                <Link href="/cadastro">
                  <Button 
                    size="lg" 
                    className="group relative bg-gradient-to-r from-orange-500/90 via-orange-600/90 to-red-500/90 hover:from-orange-600/95 hover:via-orange-700/95 hover:to-red-600/95 text-white font-medium text-base lg:text-lg px-8 lg:px-10 py-3 lg:py-4 rounded-lg shadow-xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 border-0 overflow-hidden backdrop-blur-sm"
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Content */}
                    <div className="relative">
                      Cadastre-se
                    </div>
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-orange-500/20 to-red-400/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>


      </section>

      {/* Agency Registration Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

            <CardContent className="relative p-6 sm:p-8 lg:p-16">
              <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                {/* Left Content */}
                <div className="text-white text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start items-center gap-2 mb-4">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      🚀 Oportunidade Exclusiva
                    </Badge>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                    Expanda seu negócio com a<span className="block text-yellow-300">RX Autos</span>
                  </h2>

                  <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 lg:mb-8 leading-relaxed text-left lg:text-left">
                    Cadastre sua agência e destaque seus veículos para milhares de compradores potenciais. Junte-se à
                    nossa rede de parceiros de sucesso.
                  </p>

                  {/* Benefits */}
                  <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                    <div className="flex items-center gap-3 justify-start lg:justify-start">
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-300 flex-shrink-0" />
                      <span className="text-white/90 text-sm lg:text-base">
                        30 dias gratuitos com todos os benefícios
                      </span>
                    </div>
                    <div className="flex items-center gap-3 justify-start lg:justify-start">
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-300 flex-shrink-0" />
                      <span className="text-white/90 text-sm lg:text-base">
                        Alcance milhares de compradores qualificados
                      </span>
                    </div>
                    <div className="flex items-center gap-3 justify-start lg:justify-start">
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-300 flex-shrink-0" />
                      <span className="text-white/90 text-sm lg:text-base">Ferramentas profissionais de gestão</span>
                    </div>
                    <div className="flex items-center gap-3 justify-start lg:justify-start">
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-300 flex-shrink-0" />
                      <span className="text-white/90 text-sm lg:text-base">Suporte especializado 24/7</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex justify-center lg:justify-start">
                    <Link href="/cadastro-agencia">
                      <Button
                        size="lg"
                        className="group relative bg-white text-orange-600 hover:bg-gray-50 font-bold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 w-full sm:w-auto"
                      >
                        <div className="flex items-center gap-2 lg:gap-3">
                          <Building2 className="h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="hidden sm:inline">Começar Teste Gratuito</span>
                          <span className="sm:hidden">Teste Gratuito</span>
                          <div className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            30 DIAS
                          </div>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </Button>
                    </Link>
                  </div>

                  <p className="text-xs lg:text-sm text-white/70 mt-4 text-center lg:text-left">
                    ✨ Sem compromisso • Cancele quando quiser • Suporte incluído
                  </p>
                </div>

                {/* Right Content - Stats (Hidden on mobile, shown on desktop) */}
                <div className="hidden lg:block lg:text-right">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                      <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">89+</div>
                      <div className="text-white/80 text-sm">Agências Parceiras</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                      <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">342</div>
                      <div className="text-white/80 text-sm">Vendas Realizadas</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                      <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">4.9</div>
                      <div className="text-white/80 text-sm">Avaliação Média</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                      <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">1.2K+</div>
                      <div className="text-white/80 text-sm">Veículos Ativos</div>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-300 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/90 text-sm italic mb-3">
                      "Em 30 dias vendemos 15 carros através da plataforma. O ROI foi incrível!"
                    </p>
                    <p className="text-white/70 text-xs">- Carlos Silva, Auto Premium SP</p>
                  </div>
                </div>

                {/* Mobile Stats - Only visible on mobile */}
                <div className="lg:hidden mt-8">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                      <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white mb-1">89+</div>
                      <div className="text-white/80 text-xs">Agências</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                      <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white mb-1">342</div>
                      <div className="text-white/80 text-xs">Vendas</div>
                    </div>
                  </div>

                  {/* Mobile Testimonial */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-300 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/90 text-sm italic mb-2">"ROI incrível em 30 dias!"</p>
                    <p className="text-white/70 text-xs">- Auto Premium SP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-[0]">
          <div className="flex items-center font-sans justify-center py-4">
            <div className="flex items-center gap-8">
              <button className="text-orange-500 font-medium border-b-2 border-orange-500 pb-2">Comprar carros</button>
              <button className="text-gray-600 hover:text-orange-500 font-medium pb-2">Comprar motos</button>
              <Link href="/cadastro-veiculo">
                <button className="text-gray-600 hover:text-orange-500 font-medium pb-2">Quero vender</button>
              </Link>
              <button className="text-gray-600 hover:text-orange-500 font-medium pb-2">Quero financiar</button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <button className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">Todos</button>
              <button className="text-gray-600 hover:text-orange-500 px-4 py-2 rounded-full text-sm font-medium">
                Novos
              </button>
              <button className="text-gray-600 hover:text-orange-500 px-4 py-2 rounded-full text-sm font-medium">
                Usados
              </button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Digite marca ou modelo do carro"
                  className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 font-medium">
                VER OFERTAS (377.294)
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 sm:mb-12 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Veículos em destaque</h2>
            <p className="text-gray-600">Encontre o veículo perfeito para você</p>
          </div>

          {loadingVeiculos ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando veículos em destaque...</p>
              </div>
            </div>
          ) : veiculosDestaque.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {veiculosDestaque.map((veiculo) => (
                <Card key={veiculo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={veiculo.foto_principal || "/placeholder.svg?height=200&width=300&text=Sem+Foto"}
                      alt={`${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao}`}
                      width={300}
                      height={200}
                      className="w-full h-28 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300&text=Erro+ao+carregar"
                      }}
                    />

                    {/* Badges */}
                    <div className="absolute top-1 left-1 flex flex-col gap-1">
                      <Badge className="bg-orange-500 text-white text-xs px-1 py-0">DESTAQUE</Badge>
                      {isVeiculoNovo(veiculo.created_at) && (
                        <Badge className="bg-green-500 text-white text-xs px-1 py-0">NOVO</Badge>
                      )}
                      {veiculo.estado_veiculo === "Seminovo" && (
                        <Badge className="bg-blue-500 text-white text-xs px-1 py-0">SEMINOVO</Badge>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-1 right-1 flex gap-1">
                      <Button size="sm" variant="secondary" className="h-5 w-5 p-0 bg-white/80 hover:bg-white">
                        <Heart className="h-2.5 w-2.5" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-5 w-5 p-0 bg-white/80 hover:bg-white">
                        <Eye className="h-2.5 w-2.5" />
                      </Button>
                    </div>

                    {/* Video badge if has video */}
                    {veiculo.video && (
                      <div className="absolute bottom-1 right-1">
                        <Badge variant="secondary" className="bg-black/70 text-white text-xs px-1 py-0">
                          Vídeo
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm truncate leading-tight">
                        {veiculo.titulo || `${veiculo.marca_nome} ${veiculo.modelo_nome}`}
                      </h3>
                      <span className="text-orange-500 font-bold text-xs ml-1 flex-shrink-0">
                        {veiculo.ano_fabricacao}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-1 truncate">
                      {veiculo.marca_nome} • {veiculo.modelo_nome}
                    </p>

                    <div className="text-base font-bold text-gray-900 mb-2">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(veiculo.preco || 0)}
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Settings className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate">
                          {veiculo.quilometragem
                            ? `${new Intl.NumberFormat("pt-BR").format(veiculo.quilometragem)} km`
                            : "0 km"}
                        </span>
                        {veiculo.combustivel && (
                          <>
                            <Fuel className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
                            <span className="truncate">{veiculo.combustivel}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate">São Paulo, SP</span>
                        <Badge
                          variant="outline"
                          className="ml-1 text-green-600 border-green-600 text-xs px-1 py-0 flex-shrink-0"
                        >
                          ✓
                        </Badge>
                      </div>
                    </div>

                    {/* Additional info badges */}
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {veiculo.aceita_financiamento && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Financia
                        </Badge>
                      )}
                      {veiculo.aceita_troca && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Troca
                        </Badge>
                      )}
                      {veiculo.aceita_parcelamento && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Parcela
                        </Badge>
                      )}
                    </div>

                    <Button
                      onClick={() => handleVerDetalhes(veiculo)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-xs py-1.5 h-auto"
                    >
                      Ver detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Car className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum veículo em destaque</h3>
              <p className="text-gray-600 mb-6">Não há veículos marcados como destaque no momento.</p>
              <Link href="/veiculos">
                <Button className="bg-orange-500 hover:bg-orange-600">Ver todos os veículos</Button>
              </Link>
            </div>
          )}

          {/* Link para ver mais */}
          {veiculosDestaque.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/veiculos">
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Ver todos os veículos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Soluções RX Autos */}
      <section className="leading-3 leading-7 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Soluções RX Autos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Car className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Carros por assinatura</h3>
                <p className="text-gray-600 text-sm flex-1">Compre e encontre as melhores ofertas.</p>
                <Badge className="bg-red-500 text-white text-xs mt-2 w-fit">NOVO</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Serviços automotivos</h3>
                <p className="text-gray-600 text-sm flex-1">Funilaria, manutenção e mais em oficinas perto de você.</p>
                <Badge className="bg-red-500 text-white text-xs mt-2 w-fit">NOVO</Badge>
              </CardContent>
            </Card>

            <Link href="/cadastro-veiculo" className="h-full">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Vender</h3>
                  <p className="text-gray-600 text-sm flex-1">
                    Venda fácil e rápido. Anuncie para milhões e feche a melhor negócio.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Handshake className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Financiamento</h3>
                <p className="text-gray-600 text-sm flex-1">
                  Aprove milhares de crédito com parcelas que cabem no seu bolso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Marcas Oficiais */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Marcas Oficiais</h2>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {[
              { name: "BYD", logo: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fbr.pinterest.com%2Fpin%2F92464598593321108%2F&psig=AOvVaw3j6cO3QHim29PavbSXANdE&ust=1750559986021000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOiS9KG-gY4DFQAAAAAdAAAAABAE" },
              { name: "Volkswagen", logo: "https://logospng.org/wp-content/uploads/volkswagen.png" },
              { name: "Hyundai", logo: "https://cdn.mos.cms.futurecdn.net/b4VFMLdjLx3TudR9xCMeDT.jpg" },
              { name: "Fiat", logo: "https://w7.pngwing.com/pngs/511/875/png-transparent-fiat-automobiles-fiat-500l-car-fiat-500-topolino-fiat-emblem-trademark-logo.png" },
              { name: "Toyota", logo: "https://www.milework.com/images/thumbnails/1715/1500/detailed/12/88595658.jpg" },
              { name: "Mercedes", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/2048px-Mercedes-Logo.svg.png" },
            ].map((brand) => (
              <div
                key={brand.name}
                className="bg-transparent rounded-full w-20 h-20 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={`Logo ${brand.name}`}
                  width={50}
                  height={50}
                  className="object-contain w-12 h-12"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=40&width=40&text=" + brand.name
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Categorias</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "Carros elétricos", image: "/placeholder.svg?height=200&width=300&text=Carros+Elétricos" },
              { name: "Hatches", image: "/placeholder.svg?height=200&width=300&text=Hatches" },
              { name: "Picapes", image: "/placeholder.svg?height=200&width=300&text=Picapes" },
              { name: "Sedans", image: "/placeholder.svg?height=200&width=300&text=Sedans" },
              { name: "SUVs", image: "/placeholder.svg?height=200&width=300&text=SUVs" },
            ].map((category) => (
              <div key={category.name} className="relative rounded-lg overflow-hidden cursor-pointer group">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carros mais buscados */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Carros mais buscados</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[
              { brand: "HONDA", model: "CIVIC", image: "https://www.pngkey.com/png/full/872-8726768_the-honda-summer-rollout-sales-event-honda-civic.png" },
              { brand: "TOYOTA", model: "COROLLA", image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiKNowgBLlcTMxKwzkoiaPj14EZKcliGB86Xsfx8GBafj1zmcpWQAM9QHMj2FVMPuLOeDRNro7LYa9Cj3m1QyIhVTwmPPdsdturycsLTpmxLB-D4ZU_Bb6yU5TVhD1YgZYklKXLzzLh07Hn/s1600/20160425_gli_ubp.jpg" },
              { brand: "HONDA", model: "FIT", image: "https://production.autoforce.com/uploads/version/profile_image/5648/comprar-ex_caf6a84fe7.png" },
              { brand: "VOLKSWAGEN", model: "GOL", image: "https://d3a74cgiihgn4m.cloudfront.net/2020/volkswagen/gol/high_res/1080238508177.png" },
              { brand: "VOLKSWAGEN", model: "GOLF", image: "https://clickpetroleoegas.com.br/wp-content/uploads/2024/11/volkswagen-golf-Comfortline-carro-usado.png" },
              { brand: "VOLKSWAGEN", model: "JETTA", image: "https://volkswagenpampa.com.br/wp-content/uploads/2023/01/VW_Novos_Jetta_GLI.png" },
            ].map((car, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium text-gray-900">{car.brand}</div>
                    <div className="text-lg font-bold text-red-600">{car.model}</div>
                  </div>
                  <Image
                    src={car.image || "/placeholder.svg"}
                    alt={`${car.brand} ${car.model}`}
                    width={200}
                    height={150}
                    className="w-full h-24 object-contain rounded"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Notícias */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Notícias</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Japão 7 já pode ter blindagem certificado",
                category: "Últimas notícias",
                author: "Roberto Dutra",
                image: "/placeholder.svg?height=200&width=300&text=Notícia+Blindagem",
              },
              {
                title: "5 dicas do Fusca que servem até para os elétricos",
                category: "Dicas",
                author: "Evandro Knabben",
                image: "/placeholder.svg?height=200&width=300&text=Dicas+Fusca",
              },
              {
                title: "Baterias de carros elétricos ganham 'segunda vida'",
                category: "Últimas notícias",
                author: "Roberto Dutra",
                image: "/placeholder.svg?height=200&width=300&text=Baterias+Elétricas",
              },
              {
                title: "Audi do R$ 2 milhões desembarca no Brasil",
                category: "Últimas notícias",
                author: "Roberto Dutra",
                image: "/placeholder.svg?height=200&width=300&text=Audi+Luxo",
              },
              {
                title: "Novo Hyundai HB20 deve ser lançado em outubro",
                category: "Últimas notícias",
                author: "André Deliberato",
                image: "/placeholder.svg?height=200&width=300&text=Hyundai+HB20",
              },
              {
                title: "Depois de um longo tempo, Suzuki aponta para cima",
                category: "Motos",
                author: "Roberto Dutra",
                image: "/placeholder.svg?height=200&width=300&text=Suzuki+Motos",
              },
            ].map((news, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <Image
                    src={news.image || "/placeholder.svg"}
                    alt={news.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-red-600 text-white text-xs">{news.category}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 line-clamp-2">{news.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                    <span>por {news.author}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Na RX Autos - Footer Services */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Na RX Autos</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Financiamento", color: "bg-red-600", href: "#" },
              { name: "Vender carro", color: "bg-red-600", href: "/cadastro-veiculo" },
              { name: "Catálogo 0km", color: "bg-red-600", href: "#" },
              { name: "Seguro veículo", color: "bg-red-600", href: "#" },
              { name: "Tabela FIPE", color: "bg-red-600", href: "#" },
              { name: "Notícias RXI", color: "bg-red-600", href: "#" },
            ].map((service) =>
              service.href === "/cadastro-veiculo" ? (
                <Link key={service.name} href={service.href}>
                  <Button
                    className={`${service.color} hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg w-full`}
                  >
                    {service.name}
                  </Button>
                </Link>
              ) : (
                <Button
                  key={service.name}
                  className={`${service.color} hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg`}
                >
                  {service.name}
                </Button>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <Image src="/images/rx_branco.png" alt="RX Autos Logo" width={120} height={40} className="h-8 w-auto" />
              </Link>
              <p className="text-gray-300 text-sm">
                Encontre o veículo perfeito para suas necessidades com a melhor experiência de compra.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Navegação</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Início
                  </a>
                </li>
                <li>
                  <Link href="/veiculos" className="hover:text-orange-500 transition-colors">
                    Veículos
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Categorias</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/veiculos" className="hover:text-orange-500 transition-colors">
                    Carros
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Motos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Caminhões
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Elétricos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contato</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Av. Paulista, 1000</p>
                <p>São Paulo, SP</p>
                <p>contato@rxautos.com.br</p>
                <p>(11) 3000-0000</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm text-gray-400">
            <p>© 2025 RX Autos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      {/* Modal de Detalhes do Veículo */}
      {selectedVeiculo && (
        <VeiculoDetalhesModal
          veiculo={selectedVeiculo}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedVeiculo(null)
          }}
        />
      )}
    </div>
  )
}
