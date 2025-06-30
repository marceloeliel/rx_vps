"use client"
import { useState, useEffect, useMemo } from "react"
import { SubscriptionGuard } from "@/components/subscription-guard"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  Car,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Phone,
  Mail,
  MapPin,
  Plus,
  Settings,
  BarChart3,
  FileText,
  Bell,
  Filter,
  Download,
  Edit,
  Menu,
  X,
  LogOut,
  Home,
  ArrowLeft,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getAgenciaData, type DadosAgencia } from "@/lib/supabase/agencias-local"
import { getVeiculosUsuario, type Veiculo } from "@/lib/supabase/veiculos"

export default function PainelAgenciaPage() {
  const [user, setUser] = useState<any>(null)
  const [agencia, setAgencia] = useState<DadosAgencia | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Dados mockados para demonstração
  // Remover esta linha:
  //const [recentVehicles] = useState([...])

  // Adicionar estes estados:
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loadingVeiculos, setLoadingVeiculos] = useState(false)

  const [recentLeads] = useState([
    {
      id: 1,
      nome: "João Silva",
      telefone: "(11) 99999-9999",
      email: "joao@email.com",
      veiculo: "Toyota Corolla 2022",
      status: "novo",
      data: "2024-01-15",
    },
    {
      id: 2,
      nome: "Maria Santos",
      telefone: "(11) 88888-8888",
      email: "maria@email.com",
      veiculo: "Honda Civic 2021",
      status: "contatado",
      data: "2024-01-14",
    },
    {
      id: 3,
      nome: "Pedro Costa",
      telefone: "(11) 77777-7777",
      email: "pedro@email.com",
      veiculo: "Volkswagen Jetta 2023",
      status: "negociando",
      data: "2024-01-13",
    },
  ])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar o painel.",
          })
          router.push("/login")
          return
        }

        setUser(user)

        // Carregar dados da agência
        const agenciaData = await getAgenciaData(user.id)
        if (!agenciaData) {
          toast({
            variant: "destructive",
            title: "Agência não encontrada",
            description: "Você precisa cadastrar sua agência primeiro.",
          })
          router.push("/cadastro-agencia")
          return
        }

        setAgencia(agenciaData)

        // Carregar veículos da agência
        setLoadingVeiculos(true)
        try {
          const { data: veiculosData, error: veiculosError } = await getVeiculosUsuario()
          if (veiculosError) {
            console.error("Erro ao carregar veículos:", veiculosError)
          } else {
            setVeiculos(veiculosData || [])
          }
        } catch (error) {
          console.error("Erro ao buscar veículos:", error)
        } finally {
          setLoadingVeiculos(false)
        }
      } catch (error) {
        console.error("Erro ao verificar usuário:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do usuário.",
        })
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [supabase, router, toast])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800"
      case "vendido":
        return "bg-blue-100 text-blue-800"
      case "inativo":
        return "bg-gray-100 text-gray-800"
      case "novo":
        return "bg-yellow-100 text-yellow-800"
      case "contatado":
        return "bg-blue-100 text-blue-800"
      case "negociando":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const stats = useMemo(() => {
    const totalVeiculos = veiculos.length
    const veiculosAtivos = veiculos.filter((v) => v.status === "ativo").length
    const veiculosVendidos = veiculos.filter((v) => v.status === "vendido").length
    const faturamentoTotal = veiculos
      .filter((v) => v.status === "vendido")
      .reduce((total, v) => total + (v.preco || 0), 0)

    return {
      totalVeiculos,
      veiculosAtivos,
      veiculosVendidos,
      leads: 156, // Manter mockado por enquanto
      leadsAtivos: 23, // Manter mockado por enquanto
      vendas: veiculosVendidos,
      faturamento: faturamentoTotal,
      visualizacoes: 2340, // Manter mockado por enquanto
    }
  }, [veiculos])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    )
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform">
            <SidebarContent
              agencia={agencia}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setSidebarOpen={setSidebarOpen}
              handleGoHome={handleGoHome}
              isMobile={true}
              user={user}
              router={router}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-white lg:shadow-lg lg:block">
        <SidebarContent
          agencia={agencia}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSidebarOpen={setSidebarOpen}
          handleGoHome={handleGoHome}
          user={user}
          router={router}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <Button variant="ghost" size="sm" className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="hidden lg:block p-2" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {activeTab === "dashboard" && "Dashboard"}
                    {activeTab === "veiculos" && "Veículos"}
                    {activeTab === "leads" && "Leads"}
                    {activeTab === "vendas" && "Vendas"}
                    {activeTab === "relatorios" && "Relatórios"}
                    {activeTab === "configuracoes" && "Configurações"}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Gerencie sua agência</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" className="p-2">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agencia?.logo_url || ""} alt={agencia?.nome_fantasia || ""} />
                        <AvatarFallback className="text-xs">{agencia?.nome_fantasia?.charAt(0) || "A"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{agencia?.nome_fantasia}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {agencia?.email || user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveTab("configuracoes")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8 pb-20 sm:pb-8">
          {activeTab === "dashboard" && (
            <DashboardContent
              stats={stats}
              recentVehicles={veiculos.slice(0, 3)}
              recentLeads={recentLeads}
              loadingVeiculos={loadingVeiculos}
            />
          )}
          {activeTab === "veiculos" && <VeiculosContent vehicles={veiculos} />}
          {activeTab === "leads" && <LeadsContent leads={recentLeads} />}
          {activeTab === "vendas" && <VendasContent />}
          {activeTab === "relatorios" && <RelatoriosContent stats={stats} />}
          {activeTab === "configuracoes" && <ConfiguracoesContent agencia={agencia} />}
        </main>
      </div>
    </div>
  )
}

// Componente da Sidebar
function SidebarContent({
  agencia,
  activeTab,
  setActiveTab,
  setSidebarOpen,
  handleGoHome,
  isMobile = false,
  user,
  router,
}: {
  agencia: DadosAgencia | null
  activeTab: string
  setActiveTab: (tab: string) => void
  setSidebarOpen: (open: boolean) => void
  handleGoHome: () => void
  isMobile?: boolean
  user: any
  router: any
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "veiculos", label: "Veículos", icon: Car },
    { id: "leads", label: "Leads", icon: Users },
    { id: "vendas", label: "Vendas", icon: DollarSign },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Logo e Info da Agência */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {agencia?.logo_url ? (
              <Image
                src={agencia.logo_url || "/placeholder.svg"}
                alt={agencia.nome_fantasia || ""}
                width={32}
                height={32}
                className="w-8 h-8 object-contain rounded"
              />
            ) : (
              <Building2 className="h-6 w-6 text-orange-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {agencia?.razao_social || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
            </h2>
            <p className="text-xs text-gray-600 truncate">
              {agencia?.cidade}, {agencia?.estado}
            </p>
          </div>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
          Agência Verificada
        </Badge>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 p-3 sm:p-4">
        <ul className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2 text-sm font-medium rounded-lg transition-colors touch-manipulation ${
                    activeTab === item.id
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2">
        {isMobile && (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100 py-3 sm:py-2 touch-manipulation"
            onClick={() => {
              router.back()
              setSidebarOpen(false)
            }}
          >
            <ArrowLeft className="h-5 w-5 mr-3 flex-shrink-0" />
            <span>Voltar</span>
          </Button>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100 py-3 sm:py-2 touch-manipulation"
          onClick={handleGoHome}
        >
          <Home className="h-5 w-5 mr-3 flex-shrink-0" />
          <span>Voltar ao Início</span>
        </Button>
      </div>
    </div>
  )
}

// Componente do Dashboard
function DashboardContent({
  stats,
  recentVehicles,
  recentLeads,
  loadingVeiculos = false,
}: {
  stats: any
  recentVehicles: Veiculo[]
  recentLeads: any[]
  loadingVeiculos?: boolean
}) {
  const router = useRouter()
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total de Veículos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalVeiculos}</p>
                <p className="text-xs text-green-600 mt-1">+12% este mês</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Leads Ativos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.leadsAtivos}</p>
                <p className="text-xs text-green-600 mt-1">+8% esta semana</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Vendas do Mês</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.vendas}</p>
                <p className="text-xs text-green-600 mt-1">+25% vs mês anterior</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Faturamento</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.faturamento)}</p>
                <p className="text-xs text-green-600 mt-1">+18% este mês</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Veículos Recentes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-lg">Veículos Recentes</span>
              <Button
                variant="outline"
                size="sm"
                className="self-start sm:self-auto"
                onClick={() => router.push("/cadastro-veiculo")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingVeiculos ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Carregando veículos...</p>
              </div>
            ) : recentVehicles.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <Image
                      src={vehicle.foto_principal || "/placeholder.svg?height=60&width=80"}
                      alt={`${vehicle.marca_nome} ${vehicle.modelo_nome}`}
                      width={60}
                      height={45}
                      className="w-12 h-9 sm:w-15 sm:h-11 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {vehicle.marca_nome} {vehicle.modelo_nome} {vehicle.ano_fabricacao}
                      </p>
                      <p className="text-sm text-gray-600">{formatCurrency(vehicle.preco || 0)}</p>
                      <div className="flex items-center gap-3 sm:gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Eye className="h-3 w-3" />0 {/* Visualizações serão implementadas futuramente */}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />0 leads {/* Leads serão implementados futuramente */}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={`text-xs flex-shrink-0 ${
                          vehicle.status === "ativo"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "vendido"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vehicle.status || "ativo"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => router.push(`/editar-veiculo/${vehicle.id}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">Nenhum veículo cadastrado ainda</p>
                <Button variant="outline" size="sm" onClick={() => router.push("/cadastro-veiculo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Veículo
                </Button>
              </div>
            )}
          </CardContent>
          <div className="pt-3 border-t border-gray-100">
            <Button variant="outline" className="w-full" onClick={() => router.push("/meus-veiculos")}>
              Ver Todos os Veículos
            </Button>
          </div>
        </Card>

        {/* Leads Recentes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Leads Recentes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 sm:space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarFallback className="text-xs">{lead.nome.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.nome}</p>
                    <p className="text-xs text-gray-600 truncate">{lead.veiculo}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs text-gray-500 truncate">{lead.telefone}</span>
                      <Badge
                        className={`text-xs self-start sm:self-auto ${
                          lead.status === "novo"
                            ? "bg-yellow-100 text-yellow-800"
                            : lead.status === "contatado"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="p-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Performance da Agência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Taxa de Conversão</span>
                <span className="text-sm font-bold text-gray-900">14.8%</span>
              </div>
              <Progress value={14.8} className="h-2" />
              <p className="text-xs text-gray-500">Meta: 15%</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Tempo Médio de Venda</span>
                <span className="text-sm font-bold text-gray-900">18 dias</span>
              </div>
              <Progress value={72} className="h-2" />
              <p className="text-xs text-gray-500">Meta: 25 dias</p>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Satisfação do Cliente</span>
                <span className="text-sm font-bold text-gray-900">4.8/5</span>
              </div>
              <Progress value={96} className="h-2" />
              <p className="text-xs text-gray-500">96% de avaliações positivas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Veículos
function VeiculosContent({ vehicles }: { vehicles: any[] }) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h2>
          <p className="text-gray-600">Gerencie seu estoque de veículos</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/cadastro-veiculo")}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Veículo
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Funcionalidade em Desenvolvimento</h3>
            <p className="text-gray-600 mb-4">A gestão completa de veículos estará disponível em breve.</p>
            <Button variant="outline">Solicitar Acesso Antecipado</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Leads
function LeadsContent({ leads }: { leads: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Leads</h2>
          <p className="text-gray-600">Acompanhe e gerencie seus leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de CRM em Desenvolvimento</h3>
            <p className="text-gray-600 mb-4">
              O sistema completo de gestão de leads e CRM estará disponível em breve.
            </p>
            <Button variant="outline">Solicitar Demonstração</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Vendas
function VendasContent() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Vendas</h2>
          <p className="text-gray-600">Acompanhe suas vendas e comissões</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/cadastro-veiculo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo de Vendas em Desenvolvimento</h3>
            <p className="text-gray-600 mb-4">O sistema completo de gestão de vendas estará disponível em breve.</p>
            <Button variant="outline">Solicitar Acesso Beta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Relatórios
function RelatoriosContent({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Analytics</h2>
          <p className="text-gray-600">Análise detalhada do desempenho</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Relatórios Avançados em Desenvolvimento</h3>
            <p className="text-gray-600 mb-4">
              Relatórios detalhados e analytics avançados estarão disponíveis em breve.
            </p>
            <Button variant="outline">Solicitar Preview</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Configurações
function ConfiguracoesContent({ agencia }: { agencia: DadosAgencia | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Agência</h2>
        <p className="text-gray-600">Gerencie as configurações da sua agência</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {agencia?.logo_url ? (
                  <Image
                    src={agencia.logo_url || "/placeholder.svg"}
                    alt={agencia.nome_fantasia || ""}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{agencia?.nome_fantasia}</h3>
                <p className="text-sm text-gray-600">{agencia?.razao_social}</p>
                <p className="text-sm text-gray-600">CNPJ: {agencia?.cnpj}</p>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato e Localização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">{agencia?.telefone_principal}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">{agencia?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {agencia?.cidade}, {agencia?.estado}
              </span>
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Dados
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Edit className="h-6 w-6 mb-2" />
              Editar Perfil
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Configurações
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Documentos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
