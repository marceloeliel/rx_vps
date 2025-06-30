"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VeiculoDetalhesModal } from "@/components/veiculo-detalhes-modal"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Heart,
  Eye,
  Fuel,
  Settings,
  Filter,
  Grid3X3,
  List,
  Search,
  Car,
  Bike,
  Truck,
  Tractor,
  Loader2,
} from "lucide-react"
import {
  getVeiculosPublicos,
  type Veiculo,
  TIPOS_VEICULO,
  MARCAS_VEICULOS,
  COMBUSTIVEIS,
  CAMBIOS,
  CORES,
  ESTADOS_VEICULO,
} from "@/lib/supabase/veiculos"

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePages, setHasMorePages] = useState(false)
  const itemsPerPage = 12
  
  // Estados para o modal de detalhes do veículo
  const [selectedVehicle, setSelectedVehicle] = useState<Veiculo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Estados dos filtros
  const [expandedFilters, setExpandedFilters] = useState<string[]>([
    "tipo",
    "categoria",
    "preco",
    "marca",
    "combustivel",
    "cambio",
  ])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedVehicleType, setSelectedVehicleType] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedFuels, setSelectedFuels] = useState<string[]>([])
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [searchModelInput, setSearchModelInput] = useState("")
  const [searchModel, setSearchModel] = useState("")
  const [yearRange, setYearRange] = useState([2000, 2025])
  
  // Debounce para busca por modelo
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchModel(searchModelInput)
    }, 500) // 500ms de delay
    
    return () => clearTimeout(timer)
  }, [searchModelInput])

  // Carregar veículos
  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async (page = 1, resetResults = true) => {
    try {
      if (resetResults) {
        setLoading(true)
        setError(null)
      }

      console.log(`🚗 Carregando veículos da tabela 'veiculos' (página ${page})...`)

      const filters = {
        tipo_veiculo: selectedVehicleType.length > 0 ? selectedVehicleType[0] : undefined,
        marca: selectedBrands.length > 0 ? selectedBrands[0] : undefined,
        modelo: searchModel || undefined,
        preco_min: priceRange[0],
        preco_max: priceRange[1],
        ano_min: yearRange[0],
        ano_max: yearRange[1],
        combustivel: selectedFuels.length > 0 ? selectedFuels[0] : undefined,
        cambio: selectedTransmissions.length > 0 ? selectedTransmissions[0] : undefined,
        estado: selectedStates.length > 0 ? selectedStates[0] : undefined,
        page: page,
        limit: itemsPerPage
      }

      const { data, error, count } = await getVeiculosPublicos(filters)

      if (error) {
        console.error("❌ Erro ao buscar veículos:", error)
        setError("Erro ao carregar veículos. Tente novamente.")
        return
      }

      if (data && data.length > 0) {
        console.log(`✅ ${data.length} veículos carregados (total: ${count})`)
        
        if (resetResults) {
          setVehicles(data)
        } else {
          setVehicles(prev => [...prev, ...data])
        }
        
        setTotalCount(count)
        setCurrentPage(page)
        setHasMorePages(count > page * itemsPerPage)
      } else {
        console.log("📭 Nenhum veículo encontrado")
        if (resetResults) {
          setVehicles([])
        }
        setTotalCount(count || 0)
        setHasMorePages(false)
      }
    } catch (err) {
      console.error("❌ Erro inesperado:", err)
      setError("Erro inesperado ao carregar veículos.")
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    // Resetar para a primeira página quando os filtros mudam
    loadVehicles(1, true)
  }, [
    selectedVehicleType,
    selectedBrands,
    selectedFuels,
    selectedTransmissions,
    selectedColors,
    selectedStates,
    searchModel,
    priceRange,
    yearRange,
  ])
  
  // Função para carregar mais veículos (paginação)
  const loadMoreVehicles = () => {
    if (hasMorePages && !loading) {
      loadVehicles(currentPage + 1, false)
    }
  }
  
  // Função para abrir o modal de detalhes do veículo
  const handleVerDetalhes = (vehicle: Veiculo) => {
    setSelectedVehicle(vehicle)
    setIsModalOpen(true)
  }

  const toggleFilter = (filterId: string) => {
    setExpandedFilters((prev) => (prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "carro":
        return <Car className="h-4 w-4" />
      case "moto":
        return <Bike className="h-4 w-4" />
      case "caminhao":
        return <Truck className="h-4 w-4" />
      case "maquina_pesada":
        return <Tractor className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  const getVehicleTypeLabel = (type: string) => {
    const tipoEncontrado = TIPOS_VEICULO.find((t) => t.value === type)
    return tipoEncontrado?.label || "Veículo"
  }

  const getBadgeForVehicle = (vehicle: Veiculo) => {
    if (vehicle.destaque) return "DESTAQUE"
    if (vehicle.estado_veiculo === "Novo") return "NOVO"
    if (vehicle.estado_veiculo === "Seminovo") return "SEMINOVO"
    return ""
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "DESTAQUE":
        return "bg-orange-500 text-white"
      case "NOVO":
        return "bg-green-500 text-white"
      case "SEMINOVO":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // Componente de filtros reutilizável
  const FiltersContent = () => (
    <div className="space-y-4">
      {/* Busca por modelo */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-2 block">Buscar modelo</Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Digite o modelo do veículo"
            value={searchModelInput}
            onChange={(e) => setSearchModelInput(e.target.value)}
            className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Tipo de Veículo */}
      <div className="border-b border-gray-200 pb-4">
        <button onClick={() => toggleFilter("tipo")} className="flex items-center justify-between w-full text-left">
          <Label className="text-sm font-medium text-gray-900">Tipo de veículo</Label>
          {expandedFilters.includes("tipo") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedFilters.includes("tipo") && (
          <div className="mt-3 space-y-2">
            {TIPOS_VEICULO.map((tipo) => (
              <div key={tipo.value} className="flex items-center space-x-2">
                <Checkbox
                  id={tipo.value}
                  checked={selectedVehicleType.includes(tipo.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedVehicleType([tipo.value]) // Apenas um tipo por vez
                    } else {
                      setSelectedVehicleType([])
                    }
                  }}
                />
                <Label htmlFor={tipo.value} className="text-sm text-gray-700 flex items-center gap-2">
                  {getVehicleIcon(tipo.value)}
                  {tipo.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Faixa de Preço */}
      <div className="border-b border-gray-200 pb-4">
        <button onClick={() => toggleFilter("preco")} className="flex items-center justify-between w-full text-left">
          <Label className="text-sm font-medium text-gray-900">Faixa de preço</Label>
          {expandedFilters.includes("preco") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedFilters.includes("preco") && (
          <div className="mt-3 space-y-3">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={500000}
                min={0}
                step={5000}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{formatPrice(priceRange[0])}</span>
              <span>-</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        )}
      </div>

      {/* Marca */}
      <div className="border-b border-gray-200 pb-4">
        <button onClick={() => toggleFilter("marca")} className="flex items-center justify-between w-full text-left">
          <Label className="text-sm font-medium text-gray-900">Marca</Label>
          {expandedFilters.includes("marca") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedFilters.includes("marca") && (
          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {/* Mostrar marcas baseadas no tipo selecionado */}
            {Array.from(new Set(
              selectedVehicleType.length > 0
              ? MARCAS_VEICULOS[selectedVehicleType[0] as keyof typeof MARCAS_VEICULOS] || []
              : Object.values(MARCAS_VEICULOS).flat()
            )).map((marca) => (
              <div key={marca} className="flex items-center space-x-2">
                <Checkbox
                  id={marca}
                  checked={selectedBrands.includes(marca)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands([...selectedBrands, marca])
                    } else {
                      setSelectedBrands(selectedBrands.filter((b) => b !== marca))
                    }
                  }}
                />
                <Label htmlFor={marca} className="text-sm text-gray-700">
                  {marca}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Combustível */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilter("combustivel")}
          className="flex items-center justify-between w-full text-left"
        >
          <Label className="text-sm font-medium text-gray-900">Combustível</Label>
          {expandedFilters.includes("combustivel") ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedFilters.includes("combustivel") && (
          <div className="mt-3 space-y-2">
            {Array.from(new Set(
              selectedVehicleType.length > 0
              ? COMBUSTIVEIS[selectedVehicleType[0] as keyof typeof COMBUSTIVEIS] || []
              : Object.values(COMBUSTIVEIS).flat()
            )).map((combustivel) => (
              <div key={combustivel} className="flex items-center space-x-2">
                <Checkbox
                  id={combustivel}
                  checked={selectedFuels.includes(combustivel)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFuels([...selectedFuels, combustivel])
                    } else {
                      setSelectedFuels(selectedFuels.filter((f) => f !== combustivel))
                    }
                  }}
                />
                <Label htmlFor={combustivel} className="text-sm text-gray-700">
                  {combustivel}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Câmbio */}
      <div className="border-b border-gray-200 pb-4">
        <button onClick={() => toggleFilter("cambio")} className="flex items-center justify-between w-full text-left">
          <Label className="text-sm font-medium text-gray-900">Câmbio</Label>
          {expandedFilters.includes("cambio") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedFilters.includes("cambio") && (
          <div className="mt-3 space-y-2">
            {Array.from(new Set(
              selectedVehicleType.length > 0
              ? CAMBIOS[selectedVehicleType[0] as keyof typeof CAMBIOS] || []
              : Object.values(CAMBIOS).flat()
            )).map((cambio) => (
              <div key={cambio} className="flex items-center space-x-2">
                <Checkbox
                  id={cambio}
                  checked={selectedTransmissions.includes(cambio)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTransmissions([...selectedTransmissions, cambio])
                    } else {
                      setSelectedTransmissions(selectedTransmissions.filter((t) => t !== cambio))
                    }
                  }}
                />
                <Label htmlFor={cambio} className="text-sm text-gray-700">
                  {cambio}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ano */}
      <div className="border-b border-gray-200 pb-4">
        <button onClick={() => toggleFilter("ano")} className="flex items-center justify-between w-full text-left">
          <Label className="text-sm font-medium text-gray-900">Ano</Label>
          {expandedFilters.includes("ano") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedFilters.includes("ano") && (
          <div className="mt-3 space-y-3">
            <div className="px-2">
              <Slider
                value={yearRange}
                onValueChange={setYearRange}
                max={2025}
                min={2000}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{yearRange[0]}</span>
              <span>-</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cor */}
      <div className="border-b border-gray-200 pb-4">
        <button onClick={() => toggleFilter("cor")} className="flex items-center justify-between w-full text-left">
          <Label className="text-sm font-medium text-gray-900">Cor</Label>
          {expandedFilters.includes("cor") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedFilters.includes("cor") && (
          <div className="mt-3 space-y-2">
            {CORES.map((cor) => (
              <div key={cor} className="flex items-center space-x-2">
                <Checkbox
                  id={cor}
                  checked={selectedColors.includes(cor)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedColors([...selectedColors, cor])
                    } else {
                      setSelectedColors(selectedColors.filter((c) => c !== cor))
                    }
                  }}
                />
                <Label htmlFor={cor} className="text-sm text-gray-700">
                  {cor}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estado do Veículo */}
      <div className="border-b border-gray-200 pb-4">
        <button onClick={() => toggleFilter("estado")} className="flex items-center justify-between w-full text-left">
          <Label className="text-sm font-medium text-gray-900">Estado</Label>
          {expandedFilters.includes("estado") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedFilters.includes("estado") && (
          <div className="mt-3 space-y-2">
            {ESTADOS_VEICULO.map((estado) => (
              <div key={estado} className="flex items-center space-x-2">
                <Checkbox
                  id={estado}
                  checked={selectedStates.includes(estado)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedStates([...selectedStates, estado])
                    } else {
                      setSelectedStates(selectedStates.filter((s) => s !== estado))
                    }
                  }}
                />
                <Label htmlFor={estado} className="text-sm text-gray-700">
                  {estado}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
)

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white px-4 py-4">
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
          <Link href="/" className="text-gray-300 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-500">
              Home
            </Link>
            <span className="mx-2">{">"}</span>
            <span className="text-gray-900">Veículos</span>
          </nav>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-white py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            Carros, motos, caminhões e máquinas pesadas
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            {loading ? "Carregando..." : `${totalCount.toLocaleString()} anúncios encontrados`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="lg:flex lg:gap-6">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
              </div>
              <FiltersContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 lg:mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:w-80 p-0">
                      <SheetHeader className="p-6 pb-4 border-b">
                        <SheetTitle className="flex items-center gap-2">
                          <Filter className="h-5 w-5 text-orange-500" />
                          Filtros
                        </SheetTitle>
                      </SheetHeader>
                      <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                        <FiltersContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <span className="text-sm text-gray-600 hidden sm:block">
                    <strong>{totalCount.toLocaleString()}</strong> anúncios
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="hidden sm:flex items-center border border-gray-200 rounded-lg">
                    <button
                      title="Visualização em grade"
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${
                        viewMode === "grid" ? "bg-orange-500 text-white" : "text-gray-600 hover:text-orange-500"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      title="Visualização em lista"
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${
                        viewMode === "list" ? "bg-orange-500 text-white" : "text-gray-600 hover:text-orange-500"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Carregando veículos...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
                <Button onClick={() => loadVehicles()} variant="outline" className="mt-2">
                  Tentar novamente
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && vehicles.length === 0 && (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo encontrado</h3>
                <p className="text-gray-600 mb-4">Tente ajustar os filtros ou remover algumas opções de busca.</p>
                <Button
                  onClick={() => {
                    setSelectedVehicleType([])
                    setSelectedBrands([])
                    setSelectedFuels([])
                    setSelectedTransmissions([])
                    setSelectedColors([])
                    setSelectedStates([])
                    setSearchModelInput("")
                    setSearchModel("")
                    setPriceRange([0, 500000])
                    setYearRange([2000, 2025])
                    // Carregar veículos sem filtros
                    loadVehicles(1, true)
                  }}
                  variant="outline"
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Vehicle Grid */}
            {!loading && !error && vehicles.length > 0 && (
              <div
                className={`grid gap-4 lg:gap-6 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={vehicle.foto_principal || "/placeholder.svg?height=200&width=300&text=Sem+Foto"}
                        alt={`${vehicle.marca_nome} ${vehicle.modelo_nome}`}
                        width={300}
                        height={200}
                        className="w-full h-40 sm:h-48 object-cover"
                        loading="lazy"
                        priority={false}
                        onError={(e) => {
                          // Fallback para imagem padrão em caso de erro
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg?height=200&width=300&text=Sem+Foto";
                        }}
                      />
                      {getBadgeForVehicle(vehicle) && (
                        <Badge
                          className={`absolute top-2 left-2 text-xs ${getBadgeColor(getBadgeForVehicle(vehicle))}`}
                        >
                          {getBadgeForVehicle(vehicle)}
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                      {/* Tipo do veículo badge */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-orange-500 text-white text-xs flex items-center gap-1">
                          {getVehicleIcon(vehicle.tipo_veiculo || "carro")}
                          {getVehicleTypeLabel(vehicle.tipo_veiculo || "carro")}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-3 sm:p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base lg:text-lg text-gray-900 truncate">
                            {vehicle.marca_nome} {vehicle.modelo_nome}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{vehicle.titulo}</p>
                        </div>
                        <span className="text-orange-500 font-bold text-sm ml-2">{vehicle.ano_fabricacao}</span>
                      </div>

                      <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{vehicle.quilometragem?.toLocaleString() || "0"} km</span>
                          </div>
                          {vehicle.combustivel && (
                            <div className="flex items-center gap-1">
                              <Fuel className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{vehicle.combustivel}</span>
                            </div>
                          )}
                        </div>
                        {vehicle.cambio && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{vehicle.cambio}</span>
                          </div>
                        )}
                        {vehicle.cor && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border border-gray-300" />
                            <span>{vehicle.cor}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                        {formatPrice(vehicle.preco)}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          onClick={() => handleVerDetalhes(vehicle)}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-sm sm:text-base"
                        >
                          Ver oferta
                        </Button>
                        <Link href={`/simulador?veiculo=${vehicle.id}&marca=${encodeURIComponent(vehicle.marca_nome || '')}&modelo=${encodeURIComponent(vehicle.modelo_nome || '')}&ano=${vehicle.ano_fabricacao}&preco=${vehicle.preco}&combustivel=${encodeURIComponent(vehicle.combustivel || '')}&cambio=${encodeURIComponent(vehicle.cambio || '')}&cor=${encodeURIComponent(vehicle.cor || '')}&km=${vehicle.quilometragem || 0}&tipo=${vehicle.tipo_veiculo || 'carro'}&titulo=${encodeURIComponent(vehicle.titulo || '')}`}>
                          <Button 
                            variant="outline"
                            className="w-full sm:w-auto border-orange-500 text-orange-500 hover:bg-orange-50 text-sm sm:text-base whitespace-nowrap"
                          >
                            Simular
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginação - Botão Carregar Mais */}
            {!error && vehicles.length > 0 && (
              <div className="mt-6 lg:mt-8 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-600 mb-3">
                  Mostrando {vehicles.length} de {totalCount} veículos
                </div>
                
                {hasMorePages && (
                  <Button 
                    onClick={loadMoreVehicles} 
                    variant="outline" 
                    className="min-w-[200px]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      "Carregar mais veículos"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* Modal de Detalhes do Veículo */}
    {selectedVehicle && (
      <VeiculoDetalhesModal
        veiculo={selectedVehicle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedVehicle(null)
        }}
      />
    )}
  </>
)
}
