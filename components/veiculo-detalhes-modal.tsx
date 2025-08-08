"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

// Funções de formatação
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

export function VeiculoDetalhesModal({ veiculo, isOpen, onClose }: VeiculoDetalhesModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [dadosAgencia, setDadosAgencia] = useState<DadosAgencia | null>(null)
  const [loadingAgencia, setLoadingAgencia] = useState(true)
  const [isFavorito, setIsFavorito] = useState(false)
  const supabase = createClient()
  const [imagens, setImagens] = useState<string[]>([])
  const [loadingImagens, setLoadingImagens] = useState(true)

  // Remover esta linha:
  // const imagens = [veiculo.foto_principal || "/placeholder.svg?height=400&width=600&text=Sem+Foto", ...]

  // Simular múltiplas imagens (na prática, viriam do banco)
  // const imagens = [
  //   veiculo.foto_principal || "/placeholder.svg?height=400&width=600&text=Sem+Foto",
  //   "/placeholder.svg?height=400&width=600&text=Foto+2",
  //   "/placeholder.svg?height=400&width=600&text=Foto+3",
  //   "/placeholder.svg?height=400&width=600&text=Foto+4",
  // ].filter(Boolean)

  // Função para verificar se o veículo é novo (menos de 7 dias)
  const isVeiculoNovo = (dataCadastro?: string) => {
    if (!dataCadastro) return false
    const dataAtual = new Date()
    const dataCadastroVeiculo = new Date(dataCadastro)
    const diferencaEmDias = Math.floor((dataAtual.getTime() - dataCadastroVeiculo.getTime()) / (1000 * 60 * 60 * 24))
    return diferencaEmDias < 7
  }

  // Carregar dados da agência
  useEffect(() => {
    const loadDadosAgencia = async () => {
      if (!veiculo.user_id) {
        setLoadingAgencia(false)
        return
      }

      try {
        // Buscar dados da agência pelo user_id do veículo
        const { data, error } = await supabase.from("dados_agencia").select("*").eq("user_id", veiculo.user_id).single()

        if (error) {
          console.error("Erro ao carregar dados da agência:", error)
          // Se não encontrar na tabela dados_agencia, buscar dados básicos do perfil
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", veiculo.user_id)
            .single()

          if (!profileError && profileData) {
            // Criar objeto compatível com DadosAgencia usando dados do perfil
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

    // Modificar a função loadImagensVeiculo para usar o campo 'fotos' existente como fallback

    const loadImagensVeiculo = async () => {
      try {
        // Primeiro, tentar buscar da nova tabela veiculo_fotos
        const { data: fotosData, error: fotosError } = await supabase
          .from("veiculo_fotos")
          .select("url_foto")
          .eq("veiculo_id", veiculo.id)
          .order("ordem", { ascending: true })

        const todasFotos: string[] = []

        // Se a tabela veiculo_fotos não existir ou não tiver dados, usar o campo 'fotos' existente
        if (fotosError || !fotosData || fotosData.length === 0) {
          console.log("Usando fotos do campo 'fotos' da tabela veiculos")

          // Adicionar foto principal primeiro se existir
          if (veiculo.foto_principal) {
            todasFotos.push(veiculo.foto_principal)
          }

          // Adicionar fotos do array 'fotos' se existir
          if (veiculo.fotos && Array.isArray(veiculo.fotos)) {
            veiculo.fotos.forEach((foto) => {
              if (foto && foto !== veiculo.foto_principal) {
                todasFotos.push(foto)
              }
            })
          }
        } else {
          // Usar dados da tabela veiculo_fotos
          console.log("Usando fotos da tabela veiculo_fotos")

          // Adicionar foto principal primeiro se existir e não estiver nas fotos
          if (veiculo.foto_principal) {
            const fotoJaExiste = fotosData.some((foto: any) => foto.url_foto === veiculo.foto_principal)
            if (!fotoJaExiste) {
              todasFotos.push(veiculo.foto_principal)
            }
          }

          // Adicionar fotos da tabela
          fotosData.forEach((foto: any) => {
            if (foto.url_foto) {
              todasFotos.push(foto.url_foto)
            }
          })
        }

        // Se não houver fotos, usar placeholder
        if (todasFotos.length === 0) {
          todasFotos.push("/placeholder.svg?height=400&width=600&text=Sem+Foto")
        }

        // Remover duplicatas mantendo a ordem
        const fotosUnicas = todasFotos.filter((foto, index) => todasFotos.indexOf(foto) === index)

        setImagens(fotosUnicas)
      } catch (error) {
        console.error("Erro inesperado ao carregar fotos:", error)
        // Fallback final: usar apenas foto principal ou placeholder
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

  // Registrar visualização quando o modal é aberto
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
          // Usar veiculo.user_id como agency_id (referência à tabela profiles)
          await createLead(user.id, veiculo.id, veiculo.user_id, 'view_details')
        }
      } catch (error) {
        // Silenciar erro para usuários não autenticados
        console.log('ℹ️ [LEADS] Lead não criado (usuário não autenticado)')
      }
    }

    // Só executar quando o modal estiver aberto E veiculo.user_id estiver disponível
    if (isOpen && veiculo.user_id) {
      registerView()
    }
  }, [isOpen, veiculo.id, dadosAgencia?.id, supabase])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
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
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(shareUrl)
      alert("Link copiado para a área de transferência!")
    }
  }

  const handleContact = (type: "phone" | "whatsapp" | "email") => {
    if (!dadosAgencia) return

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
            `mailto:${dadosAgencia.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          )
        }
        break
    }
  }

  const handleSimulateFinancing = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && user?.id && veiculo.id && veiculo.user_id) {
        await createLead(user.id, veiculo.id, veiculo.user_id, 'simulation')
        console.log('✅ [LEADS] Lead de simulação registrado com sucesso')
      }
    } catch (error) {
      console.log('ℹ️ [LEADS] Lead de simulação não criado (usuário não autenticado)')
    }

    // Construir URL com parâmetros completos do veículo
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
    
    // Abrir simulador em nova aba
    window.open(`/simulador?${params.toString()}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[95vh] sm:max-h-screen p-0 overflow-y-auto">
        <div className="flex flex-col">
          {/* Header */}
          <DialogHeader className="p-2 md:p-3 pb-2 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-sm md:text-lg font-bold leading-tight flex-1 min-w-0">
                <span className="block truncate">
                  {veiculo.marca_nome} {veiculo.modelo_nome} {veiculo.ano_fabricacao}
                </span>
              </DialogTitle>
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
          </DialogHeader>

          {/* Conteúdo principal sem ScrollArea */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 sm:gap-4 p-2 sm:p-4">
            {/* Coluna Principal - Imagens e Detalhes */}
            <div className="lg:col-span-3 space-y-2 sm:space-y-4">
              {/* Galeria de Imagens */}
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

                    {/* Badges sobre a imagem */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className="bg-orange-500 text-white text-xs px-2 py-1">DESTAQUE</Badge>
                      {isVeiculoNovo(veiculo.created_at) && (
                        <Badge className="bg-green-500 text-white text-xs px-2 py-1">NOVO</Badge>
                      )}
                      {veiculo.estado_veiculo === "Seminovo" && (
                        <Badge className="bg-blue-500 text-white">SEMINOVO</Badge>
                      )}
                    </div>

                    {/* Navegação das imagens */}
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

                        {/* Indicadores */}
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

                    {/* Contador de fotos */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {imagens.length}
                      {imagens.length > 1 && <span className="ml-1 text-xs opacity-75">fotos</span>}
                    </div>

                    {/* Badge de vídeo se houver */}
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

                {/* Thumbnails */}
                {imagens.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {imagens.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? "border-orange-500" : "border-gray-200"
                        }`}
                        aria-label={`Ver foto ${index + 1}`}
                      >
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Informações Principais */}
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 leading-tight">
                        {veiculo.titulo || `${veiculo.marca_nome} ${veiculo.modelo_nome}`}
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {veiculo.marca_nome} • {veiculo.modelo_nome}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">{formatPrice(veiculo.preco || 0)}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span>1.2k visualizações</span>
                      </div>
                    </div>
                  </div>

                  {/* Características Principais */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{veiculo.ano_fabricacao}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-gray-400" />
                      <span>{veiculo.quilometragem?.toLocaleString() || "0"} km</span>
                    </div>
                    {veiculo.combustivel && (
                      <div className="flex items-center gap-2 text-sm">
                        <Fuel className="h-4 w-4 text-gray-400" />
                        <span>{veiculo.combustivel}</span>
                      </div>
                    )}
                    {veiculo.cambio && (
                      <div className="flex items-center gap-2 text-sm">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span>{veiculo.cambio}</span>
                      </div>
                    )}
                  </div>

                  {/* Opções de Negociação */}
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {veiculo.aceita_financiamento && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-2 py-1">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Aceita Financiamento
                      </Badge>
                    )}
                    {veiculo.aceita_troca && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs px-2 py-1">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Aceita Troca
                      </Badge>
                    )}
                    {veiculo.aceita_parcelamento && (
                      <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs px-2 py-1">
                        <Banknote className="h-3 w-3 mr-1" />
                        Aceita Parcelamento
                      </Badge>
                    )}
                  </div>

                  {/* Descrição */}
                  {veiculo.descricao && (
                    <div>
                      <h3 className="font-semibold mb-2">Descrição</h3>
                      <p className="text-gray-700 leading-relaxed">{veiculo.descricao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Especificações Técnicas */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base mb-3">Especificações Técnicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Marca:</span>
                        <span className="font-medium">{veiculo.marca_nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Modelo:</span>
                        <span className="font-medium">{veiculo.modelo_nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ano:</span>
                        <span className="font-medium">{veiculo.ano_fabricacao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quilometragem:</span>
                        <span className="font-medium">{veiculo.quilometragem?.toLocaleString() || "0"} km</span>
                      </div>
                      {veiculo.cor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cor:</span>
                          <span className="font-medium flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            {veiculo.cor}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {veiculo.combustivel && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Combustível:</span>
                          <span className="font-medium">{veiculo.combustivel}</span>
                        </div>
                      )}
                      {veiculo.cambio && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Câmbio:</span>
                          <span className="font-medium">{veiculo.cambio}</span>
                        </div>
                      )}
                      {veiculo.estado_veiculo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span className="font-medium">{veiculo.estado_veiculo}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          {veiculo.tipo_veiculo || "Carro"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Anunciado em:</span>
                        <span className="font-medium">{formatDate(veiculo.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Informações da Agência */}
            <div className="lg:col-span-2 space-y-2 sm:space-y-4">
              {/* Informações da Agência */}
              <Card className="lg:sticky lg:top-6">
                <CardContent className="p-3 sm:p-4">
                  {loadingAgencia ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : dadosAgencia ? (
                    <div className="space-y-4">
                      {/* Header da Agência */}
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {dadosAgencia.logo_url ? (
                            <Image
                              src={dadosAgencia.logo_url || "/placeholder.svg"}
                              alt={`Logo ${dadosAgencia.nome_fantasia}`}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{dadosAgencia.nome_fantasia}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{dadosAgencia.avaliacao || "4.8"}</span>
                            <span>({dadosAgencia.total_avaliacoes || "127"} avaliações)</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificada
                        </Badge>
                      </div>

                      <Separator />

                      {/* Informações de Contato */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>
                            {dadosAgencia.cidade}, {dadosAgencia.estado}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Responde em até 2 horas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span>Agência desde {new Date(dadosAgencia.created_at).getFullYear()}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Botões de Contato */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleContact("whatsapp")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2"
                        >
                          <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
                          WhatsApp
                        </Button>
                        <div className="grid grid-cols-2 gap-1 sm:gap-2">
                          <Button variant="outline" onClick={() => handleContact("phone")} className="flex-1 text-xs sm:text-sm py-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Ligar
                          </Button>
                          <Button variant="outline" onClick={() => handleContact("email")} className="flex-1 text-xs sm:text-sm py-2">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Email
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Informações Adicionais */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">CNPJ:</span>
                          <span className="font-medium">{formatCnpj(dadosAgencia.cnpj)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telefone:</span>
                          <span className="font-medium">
                            {formatPhone(dadosAgencia.telefone_principal || dadosAgencia.whatsapp)}
                          </span>
                        </div>
                        {dadosAgencia.site && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Site:</span>
                            <a
                              href={dadosAgencia.site}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-orange-600 hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              Visitar
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Informações da agência não disponíveis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Calculadora de Financiamento */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    Simular Financiamento
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Valor do veículo</label>
                      <div className="text-base font-bold text-gray-900">{formatPrice(veiculo.preco || 0)}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Entrada (30%)</label>
                      <div className="text-base font-bold text-orange-600">
                        {formatPrice((veiculo.preco || 0) * 0.3)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Parcelas estimadas (48x)</label>
                      <div className="text-base font-bold text-gray-900">
                        {formatPrice(((veiculo.preco || 0) * 0.7 * 1.15) / 48)}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleSimulateFinancing}>
                      Simular Financiamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
