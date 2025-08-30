"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  X,
  Heart,
  Share2,
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
  Play,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { LoginModal } from "@/components/login-modal"

import type { Veiculo } from "@/lib/supabase/veiculos"
import { createClient } from "@/lib/supabase/client"
import { createLead } from "@/lib/supabase/vehicle-favorites"

interface VeiculoDetalhesModalProps {
  veiculo: Veiculo
  isOpen: boolean
  onClose: () => void
}

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

const formatCnpj = (cnpj?: string) => {
  if (!cnpj) return "Não informado"
  const numbers = cnpj.replace(/\D/g, "")
  if (numbers.length === 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }
  return cnpj
}

const formatPhone = (phone?: string) => {
  if (!phone) return "Não informado"
  const numbers = phone.replace(/\D/g, "")

  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4")
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  return phone
}

const maskPhone = (phone?: string) => {
  if (!phone) return "Não informado"
  const numbers = phone.replace(/\D/g, "")

  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 ****-****")
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) ****-****")
  }
  return "****-****"
}

const maskCnpj = (cnpj?: string) => {
  if (!cnpj) return "Não informado"
  return "**.***.***/****-**"
}

const maskEmail = (email?: string) => {
  if (!email) return "Não informado"
  const [username, domain] = email.split('@')
  if (username && domain) {
    const maskedUsername = username.length > 2 ? username.slice(0, 2) + '*'.repeat(username.length - 2) : '**'
    return `${maskedUsername}@${domain}`
  }
  return "***@***.com"
}

export function VeiculoDetalhesModal({ veiculo, isOpen, onClose }: VeiculoDetalhesModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [dadosAgencia, setDadosAgencia] = useState<DadosAgencia | null>(null)
  const [loadingAgencia, setLoadingAgencia] = useState(true)
  const [isFavorito, setIsFavorito] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()
  const [imagens, setImagens] = useState<string[]>([])
  const [loadingImagens, setLoadingImagens] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const isVeiculoNovo = (dataCadastro?: string) => {
    if (!dataCadastro) return false
    const dataAtual = new Date()
    const dataCadastroVeiculo = new Date(dataCadastro)
    const diferencaEmDias = Math.floor((dataAtual.getTime() - dataCadastroVeiculo.getTime()) / (1000 * 60 * 60 * 24))
    return diferencaEmDias < 7
  }

  useEffect(() => {
    const loadDadosAgencia = async () => {
      if (!veiculo.user_id) {
        setLoadingAgencia(false)
        return
      }

      try {
        const { data, error } = await supabase.from("dados_agencia").select("*").eq("user_id", veiculo.user_id).single()

        if (error) {
          console.error("Erro ao carregar dados da agência:", error)
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", veiculo.user_id)
            .single()

          if (!profileError && profileData) {
            setDadosAgencia({
              id: profileData.id,
              user_id: profileData.id,
              nome_fantasia: profileData.nome || "Vendedor",
              telefone_principal: profileData.telefone,
              email: profileData.email,
              cidade: "Não informado",
              estado: "Não informado",
              created_at: profileData.created_at,
            })
          }
        } else {
          setDadosAgencia(data)
        }
      } catch (error) {
        console.error("Erro inesperado:", error)
      } finally {
        setLoadingAgencia(false)
      }
    }

    const loadImagensVeiculo = async () => {
      try {
        const { data: fotosData, error: fotosError } = await supabase
          .from("veiculo_fotos")
          .select("url_foto")
          .eq("veiculo_id", veiculo.id)
          .order("ordem", { ascending: true })

        const todasFotos: string[] = []

        if (fotosError || !fotosData || fotosData.length === 0) {
          console.log("Usando fotos do campo 'fotos' da tabela veiculos")

          if (veiculo.foto_principal) {
            todasFotos.push(veiculo.foto_principal)
          }

          if (veiculo.fotos && Array.isArray(veiculo.fotos)) {
            veiculo.fotos.forEach((foto) => {
              if (foto && foto !== veiculo.foto_principal) {
                todasFotos.push(foto)
              }
            })
          }
        } else {
          console.log("Usando fotos da tabela veiculo_fotos")

          if (veiculo.foto_principal) {
            const fotoJaExiste = fotosData.some((foto: any) => foto.url_foto === veiculo.foto_principal)
            if (!fotoJaExiste) {
              todasFotos.push(veiculo.foto_principal)
            }
          }

          fotosData.forEach((foto: any) => {
            if (foto.url_foto) {
              todasFotos.push(foto.url_foto)
            }
          })
        }

        if (todasFotos.length === 0) {
          todasFotos.push("/placeholder.svg?height=400&width=600&text=Sem+Foto")
        }

        const fotosUnicas = todasFotos.filter((foto, index) => todasFotos.indexOf(foto) === index)
        setImagens(fotosUnicas)
      } catch (error) {
        console.error("Erro inesperado ao carregar fotos:", error)
        const fallbackFotos = []
        if (veiculo.foto_principal) {
          fallbackFotos.push(veiculo.foto_principal)
        } else {
          fallbackFotos.push("/placeholder.svg?height=400&width=600&text=Sem+Foto")
        }
        setImagens(fallbackFotos)
      } finally {
        setLoadingImagens(false)
      }
    }

    if (isOpen) {
      loadDadosAgencia()
      loadImagensVeiculo()
    }
  }, [veiculo.user_id, isOpen, supabase, veiculo.id, veiculo.foto_principal, veiculo.fotos])

  // Verificar autenticação do usuário
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setIsAuthenticated(false)
      }
    }

    if (isOpen) {
      checkAuth()
    }
  }, [isOpen, supabase])

  useEffect(() => {
    const registerView = async () => {
      if (!isOpen || !veiculo.id || !veiculo.user_id) return
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.log('ℹ️ [LEADS] Usuário não autenticado, pulando criação de lead')
          return
        }
        
        if (user?.id) {
          // Buscar o profile da agência para obter o agency_id correto
          const { data: agencyProfile } = await supabase
            .from('profiles')
            .select('id, agency_id')
            .eq('id', veiculo.user_id)
            .single()
          
          if (agencyProfile) {
            // Usar agency_id se disponível, senão usar o profile.id como fallback
            const agencyId = agencyProfile.agency_id || agencyProfile.id
            const result = await createLead(user.id, veiculo.id, agencyId, 'view_details')
            if (result.error) {
              // Só logar erros que não sejam vazios ou de constraint
              if (result.error.message && !result.error.message.includes('unique') && !result.error.message.includes('duplicate')) {
                console.error('❌ [LEADS] Erro ao criar lead de visualização:', {
                  message: result.error.message,
                  code: result.error.code,
                  vehicleId: veiculo.id,
                  userId: user.id,
                  agencyId: agencyId
                })
              } else {
                console.log('ℹ️ [LEADS] Lead de visualização já existe ou foi processado')
              }
            } else {
              console.log('✅ [LEADS] Lead de visualização criado/atualizado com sucesso')
            }
          } else {
            console.log('ℹ️ [LEADS] Profile da agência não encontrado, pulando criação de lead')
          }
        }
      } catch (error) {
        console.error('❌ [LEADS] Erro inesperado ao registrar visualização:', error)
      }
    }

    if (isOpen && veiculo.user_id) {
      registerView()
    }
  }, [isOpen, veiculo.id, dadosAgencia?.id, supabase])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não informada"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagens.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagens.length) % imagens.length)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/veiculo/${veiculo.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${veiculo.marca_nome} ${veiculo.modelo_nome}`,
          text: `Confira este ${veiculo.marca_nome} ${veiculo.modelo_nome} por ${formatPrice(veiculo.preco || 0)}`,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Erro ao compartilhar:", error)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert("Link copiado para a área de transferência!")
    }
  }

  const handleContact = (type: "phone" | "whatsapp" | "email") => {
    if (!dadosAgencia) return

    // Verificar se o usuário está autenticado para WhatsApp
    if (type === "whatsapp" && !isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    const telefone = dadosAgencia.whatsapp || dadosAgencia.telefone_principal

    switch (type) {
      case "phone":
        if (telefone) window.open(`tel:${telefone}`)
        break
      case "whatsapp":
        if (telefone) {
          const message = `Olá! Tenho interesse no ${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao} por ${formatPrice(veiculo.preco || 0)}`
          window.open(`https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`)
        }
        break
      case "email":
        if (dadosAgencia.email) {
          const subject = `Interesse em ${veiculo.marca_nome} ${veiculo.modelo_nome}`
          const body = `Olá! Tenho interesse no veículo ${veiculo.marca_nome} ${veiculo.modelo_nome} ${veiculo.ano_fabricacao} anunciado por ${formatPrice(veiculo.preco || 0)}. Gostaria de mais informações.`
          window.open(
            `mailto:${dadosAgencia.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
          )
        }
        break
    }
  }

  const handleSimulateFinancing = async () => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && user?.id && veiculo.id && veiculo.user_id) {
        const result = await createLead(user.id, veiculo.id, veiculo.user_id, 'simulation')
        if (result.error && result.error.message && !result.error.message.includes('unique') && !result.error.message.includes('duplicate')) {
          console.error('❌ [LEADS] Erro ao criar lead de simulação:', result.error.message)
        } else if (!result.error) {
          console.log('✅ [LEADS] Lead de simulação registrado com sucesso')
        }
      }
    } catch (error) {
      console.log('ℹ️ [LEADS] Lead de simulação não criado (usuário não autenticado)')
    }

    const params = new URLSearchParams({
      veiculo: veiculo.id?.toString() || '',
      marca: veiculo.marca_nome || '',
      modelo: veiculo.modelo_nome || '',
      ano: veiculo.ano_fabricacao?.toString() || '',
      preco: veiculo.preco?.toString() || '0',
      combustivel: veiculo.combustivel || '',
      cambio: veiculo.cambio || '',
      cor: veiculo.cor || '',
      km: veiculo.quilometragem?.toString() || '0',
      tipo: veiculo.tipo_veiculo || '',
      titulo: `${veiculo.marca_nome || ''} ${veiculo.modelo_nome || ''} ${veiculo.ano_fabricacao?.toString() || ''}`
    } as Record<string, string>)
    
    window.open(`/simulador?${params.toString()}`, '_blank')
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 md:p-3 pb-2 border-b bg-white z-10 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm md:text-lg font-bold leading-tight flex-1 min-w-0">
              <span className="block truncate">
                {veiculo.marca_nome} {veiculo.modelo_nome} {veiculo.ano_fabricacao}
              </span>
            </h2>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorito(!isFavorito)}
                className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${isFavorito ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-500 h-8 w-8 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 sm:gap-4 p-2 sm:p-4 overflow-y-auto flex-1 min-h-0">
          <div className="lg:col-span-3 space-y-2 sm:space-y-4">
            <div className="relative">
              {loadingImagens ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={imagens[currentImageIndex] || "/placeholder.svg"}
                    alt={`${veiculo.marca_nome} ${veiculo.modelo_nome} - Foto ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=400&width=600&text=Erro+ao+carregar"
                    }}
                  />
                  
                  <div className="absolute bottom-4 left-4 opacity-25 pointer-events-none">
                    <Image
                      src="https://ecdmpndeunbzhaihabvi.supabase.co/storage/v1/object/public/telas//3d%20sem%20fundo.png"
                      alt="Marca d'água"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>

                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className="bg-orange-500 text-white text-xs px-2 py-1">DESTAQUE</Badge>
                    {isVeiculoNovo(veiculo.created_at) && (
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1">NOVO</Badge>
                    )}
                    {veiculo.estado_veiculo === "Seminovo" && (
                      <Badge className="bg-blue-500 text-white">SEMINOVO</Badge>
                    )}
                  </div>

                  {imagens.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {imagens.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                            aria-label={`Ir para foto ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {imagens.length}
                    {imagens.length > 1 && <span className="ml-1 text-xs opacity-75">fotos</span>}
                  </div>

                  {veiculo.video && (
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-black/70 text-white flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Vídeo
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {imagens.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                  {imagens.map((imagem, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? "border-orange-500" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={imagem}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=48&width=64&text=Erro"
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Preço</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPrice(veiculo.preco || 0)}
                    </div>
                    {veiculo.aceita_parcelamento && (
                      <div className="text-sm text-gray-600">
                        ou {veiculo.parcelas_maximas || 60}x de{" "}
                        {formatPrice((veiculo.preco || 0) / (veiculo.parcelas_maximas || 60))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t my-4"></div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Ano:</span>
                    <span className="font-medium">{veiculo.ano_fabricacao}/{veiculo.ano_modelo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">KM:</span>
                    <span className="font-medium">
                      {veiculo.quilometragem ? veiculo.quilometragem.toLocaleString() : "0"} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Combustível:</span>
                    <span className="font-medium">{veiculo.combustivel || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Câmbio:</span>
                    <span className="font-medium">{veiculo.cambio || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Cor:</span>
                    <span className="font-medium">{veiculo.cor || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Portas:</span>
                    <span className="font-medium">{veiculo.portas || "Não informado"}</span>
                  </div>
                </div>

                {veiculo.observacoes && (
                  <>
                    <div className="border-t my-4"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{veiculo.observacoes}</p>
                    </div>
                  </>
                )}

                <div className="border-t my-4"></div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Estado:</span>
                    <Badge variant="secondary">{veiculo.estado_veiculo || "Usado"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Anunciado em:</span>
                    <span className="font-medium">{formatDate(veiculo.created_at)}</span>
                  </div>
                </div>

                {veiculo.aceita_parcelamento && (
                  <>
                    <div className="border-t my-4"></div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Aceita Financiamento</span>
                      </div>
                      <div className="text-sm text-green-700">
                        <div>Parcelas: até {veiculo.parcelas_maximas || 60}x</div>
                        {veiculo.entrada_minima && (
                          <div>Entrada mínima: {formatPrice(veiculo.entrada_minima)}</div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {veiculo.aceita_troca && (
                  <div className="bg-blue-50 p-3 rounded-lg mt-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Aceita Troca</span>
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      Consulte condições com o vendedor
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 mb-4">
                  {dadosAgencia?.logo_url ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={dadosAgencia.logo_url}
                        alt="Logo da agência"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=48&width=48&text=Logo"
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {dadosAgencia?.nome_fantasia || dadosAgencia?.razao_social || "Vendedor"}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {dadosAgencia?.avaliacao || "4.8"}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({dadosAgencia?.total_avaliacoes || "127"} avaliações)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {dadosAgencia?.telefone_principal && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-medium">
                        {isAuthenticated ? formatPhone(dadosAgencia.telefone_principal) : maskPhone(dadosAgencia.telefone_principal)}
                      </span>
                    </div>
                  )}
                  {dadosAgencia?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-xs">
                        {isAuthenticated ? dadosAgencia.email : maskEmail(dadosAgencia.email)}
                      </span>
                    </div>
                  )}
                  {dadosAgencia?.cidade && dadosAgencia?.estado && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Localização:</span>
                      <span className="font-medium">
                        {dadosAgencia.cidade}, {dadosAgencia.estado}
                      </span>
                    </div>
                  )}
                  {dadosAgencia?.site && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Site:</span>
                      <a
                        href={dadosAgencia.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline text-xs"
                      >
                        {dadosAgencia.site}
                      </a>
                    </div>
                  )}
                  {dadosAgencia?.cnpj && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">CNPJ:</span>
                      <span className="font-medium text-xs">
                        {isAuthenticated ? formatCnpj(dadosAgencia.cnpj) : maskCnpj(dadosAgencia.cnpj)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t my-4"></div>

                <div className="space-y-2">
                  {!isAuthenticated && (
                    <div className="bg-orange-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800 text-sm">Faça login para ver os contatos</span>
                      </div>
                      <p className="text-xs text-orange-700">
                        Entre na sua conta para visualizar telefone, email e entrar em contato com o vendedor.
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => handleContact("whatsapp")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={!dadosAgencia?.whatsapp && !dadosAgencia?.telefone_principal}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowLoginModal(true)
                          return
                        }
                        handleContact("phone")
                      }}
                      disabled={!dadosAgencia?.telefone_principal}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Ligar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowLoginModal(true)
                          return
                        }
                        handleContact("email")
                      }}
                      disabled={!dadosAgencia?.email}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Simular Financiamento
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Calcule as parcelas e veja as melhores condições para financiar este veículo.
                </p>
                <Button onClick={handleSimulateFinancing} className="w-full bg-blue-600 hover:bg-blue-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Simular Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        message="Faça login para acessar as informações de contato e funcionalidades completas."
      />
    </div>
  )
}
