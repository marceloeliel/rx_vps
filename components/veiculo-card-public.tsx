"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { type Veiculo } from "@/lib/supabase/veiculos"
import { 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite, 
  createLead 
} from "@/lib/supabase/vehicle-favorites"
import { createClient } from "@/lib/supabase/client"
import { Heart, Calendar, Gauge, Phone, Mail, MapPin, Calculator } from "lucide-react"
import { VeiculoDetalhesModal } from "@/components/veiculo-detalhes-modal"
import { LoginRequiredDialog } from "@/components/login-required-dialog"

interface VeiculoCardPublicProps {
  veiculo: Veiculo
  showFavoriteButton?: boolean
  onFavoriteChange?: () => void
}

export default function VeiculoCardPublic({ 
  veiculo, 
  showFavoriteButton = true,
  onFavoriteChange 
}: VeiculoCardPublicProps) {
  const { toast } = useToast()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && veiculo.id) {
      checkFavoriteStatus()
    }
  }, [user, veiculo.id])

  useEffect(() => {
    const loadAgencyId = async () => {
      if (!veiculo.user_id) return
      
      try {
        // Buscar dados da agência pelo user_id do veículo
        const { data, error } = await supabase
          .from("dados_agencia")
          .select("id")
          .eq("user_id", veiculo.user_id)
          .single()

        if (!error && data) {
          setAgencyId(data.id)
        } else {
          // Se não encontrar na tabela dados_agencia, usar o user_id como fallback
          setAgencyId(veiculo.user_id)
        }
      } catch (error) {
        console.error('Erro ao carregar agency_id:', error)
        setAgencyId(veiculo.user_id) // Fallback
      }
    }

    loadAgencyId()
  }, [veiculo.user_id, supabase])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const checkFavoriteStatus = async () => {
    if (!user || !veiculo.id) return
    
    try {
      console.log('🔍 Verificando status de favorito para:', { userId: user.id, vehicleId: veiculo.id })
      const favorited = await isFavorite(user.id, veiculo.id)
      console.log('❤️ Status de favorito:', favorited)
      setIsFavorited(favorited)
    } catch (error) {
      console.error('Erro ao verificar favorito:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800"
      case "vendido":
        return "bg-blue-100 text-blue-800"
      case "inativo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar veículos",
        variant: "destructive"
      })
      return
    }

    if (!veiculo.id) return

    setFavoriteLoading(true)
    try {
      if (isFavorited) {
        const { error } = await removeFromFavorites(user.id, veiculo.id)
        if (error) throw error
        
        setIsFavorited(false)
        console.log('💔 Veículo removido dos favoritos, isFavorited agora é:', false)
        toast({
          title: "Removido dos favoritos",
          description: "Veículo removido da sua lista de favoritos"
        })
      } else {
        const { error } = await addToFavorites(user.id, veiculo.id)
        if (error) throw error
        
        // Registrar como lead
        if (agencyId) {
          await createLead(user.id, veiculo.id, agencyId, 'favorite')
        }
        
        setIsFavorited(true)
        console.log('❤️ Veículo adicionado aos favoritos, isFavorited agora é:', true)
        toast({
          title: "Adicionado aos favoritos",
          description: "Veículo adicionado à sua lista de favoritos"
        })
      }
      
      onFavoriteChange?.()
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o favorito",
        variant: "destructive"
      })
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleContact = async (type: 'whatsapp' | 'email') => {
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    // Registrar como lead
    if (veiculo.id && agencyId) {
      try {
        const leadType = type === 'whatsapp' ? 'contact_whatsapp' : 'contact_email'
        await createLead(user.id, veiculo.id, agencyId, leadType)
      } catch (error) {
        console.error('❌ [LEADS] Erro ao criar lead de contato:', error)
      }
    }

    // Abrir modal de detalhes que já tem a funcionalidade de contato
    setShowModal(true)
  }

  const handleOpenDetails = () => {
    if (!user) {
      setShowLoginDialog(true)
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
        <div className="relative" onClick={handleOpenDetails}>
          <div className="aspect-video bg-gray-100">
            <Image
              src={veiculo.foto_principal || "/placeholder.svg?height=200&width=300"}
              alt={`${veiculo.marca_nome} ${veiculo.modelo_nome}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Marca d'água */}
            <div className="absolute bottom-2 left-2 opacity-30 pointer-events-none">
              <Image
                src="https://ecdmpndeunbzhaihabvi.supabase.co/storage/v1/object/public/telas//3d%20sem%20fundo.png"
                alt="Marca d'água"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          </div>
          {veiculo.destaque && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
              Destaque
            </Badge>
          )}
          <Badge className={`absolute top-2 right-2 ${getStatusColor(veiculo.status || "ativo")}`}>
            {veiculo.status || "ativo"}
          </Badge>
          
          {/* Botão de favorito */}
          {showFavoriteButton && user && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleFavoriteToggle()
              }}
              disabled={favoriteLoading}
            >
              <Heart 
                className={`h-4 w-4 ${
                  isFavorited 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600 hover:text-red-500'
                }`} 
              />
            </Button>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col" onClick={handleOpenDetails}>
          <div className="space-y-3 flex-1 flex flex-col">
            {/* Título e marca - altura fixa */}
            <div className="min-h-[60px] flex flex-col justify-start">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight">
                {veiculo.titulo || `${veiculo.marca_nome} ${veiculo.modelo_nome}`}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {veiculo.marca_nome} • {veiculo.modelo_nome}
              </p>
            </div>

            {/* Preço - altura fixa */}
            <div className="flex items-center justify-between min-h-[32px]">
              <span className="text-2xl font-bold text-orange-600">
                {formatCurrency(veiculo.preco || 0)}
              </span>
              {veiculo.tipo_preco && veiculo.tipo_preco !== "fixo" && (
                <Badge variant="outline" className="text-xs">
                  {veiculo.tipo_preco}
                </Badge>
              )}
            </div>

            {/* Informações técnicas - altura fixa */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 min-h-[20px]">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {veiculo.ano_fabricacao}/{veiculo.ano_modelo}
                  </span>
                </div>
                {veiculo.quilometragem ? (
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formatNumber(veiculo.quilometragem)} km</span>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              
              {/* Texto negociável abaixo da data */}
              {veiculo.tipo_preco === 'Negociável' && (
                <div className="text-sm text-gray-600">
                  <span>Negociável</span>
                </div>
              )}
              
              {/* Badges de financiamento e troca */}
              <div className="flex gap-1 flex-wrap">
                {veiculo.aceita_financiamento && (
                  <Badge variant="outline" className="text-xs">
                    Financia
                  </Badge>
                )}
                {veiculo.aceita_troca && (
                  <Badge variant="outline" className="text-xs">
                    Troca
                  </Badge>
                )}
              </div>
            </div>

            {/* Spacer para empurrar o footer para baixo */}
            <div className="flex-1"></div>

            {/* Footer - sempre na parte inferior */}
            <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
              {/* Botão de simulação de financiamento */}
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-8 text-xs bg-black hover:bg-gray-800 text-white"
                onClick={async (e) => {
                  e.stopPropagation()
                  
                  // Verificar se o usuário está logado
                  if (!user) {
                    setShowLoginDialog(true)
                    return
                  }
                  
                  // Registrar lead de simulação se usuário estiver logado
                  if (user && veiculo.id && agencyId) {
                    try {
                      await createLead(user.id, veiculo.id, agencyId, 'simulation')
                      console.log('✅ [LEADS] Lead de simulação registrado com sucesso')
                    } catch (error) {
                      console.error('❌ [LEADS] Erro ao registrar lead de simulação:', error)
                    }
                  }
                  
                  const params = new URLSearchParams({
                    veiculo: veiculo.id?.toString() || '',
                    marca: veiculo.marca_nome || '',
                    modelo: veiculo.modelo_nome?.toString() || '',
                    ano: veiculo.ano_modelo?.toString() || '',
                    preco: veiculo.preco?.toString() || '0',
                    combustivel: veiculo.combustivel || '',
                    cambio: veiculo.cambio || '',
                    cor: veiculo.cor || '',
                    km: veiculo.quilometragem?.toString() || '0',
                    tipo: veiculo.tipo_veiculo || '',
                    titulo: `${veiculo.marca_nome || ''} ${veiculo.modelo_nome || ''} ${veiculo.ano_modelo?.toString() || ''}`
                  } as Record<string, string>)
                  window.open(`/simulador?${params.toString()}`, '_blank')
                }}
              >
                <Calculator className="h-3 w-3 mr-1" />
                Simular
              </Button>
              
              {/* Botão de contato rápido */}
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  handleContact('whatsapp')
                }}
              >
                <Phone className="h-3 w-3 mr-1" />
                Contato
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      {showModal && (
        <VeiculoDetalhesModal
          veiculo={veiculo}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
      
      {/* Dialog de login necessário */}
       <LoginRequiredDialog
         isOpen={showLoginDialog}
         onClose={() => setShowLoginDialog(false)}
         title="Login necessário"
         description="Para acessar esta funcionalidade, você precisa estar logado em sua conta. Escolha uma das opções abaixo:"
       />
    </>
  )
}