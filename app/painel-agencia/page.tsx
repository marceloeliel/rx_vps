"use client"
import { useState, useEffect, useMemo, memo } from "react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
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
  Heart,
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
  Calendar,
  Target,
  Activity,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner"
import { formatCnpj } from "@/lib/utils/masks"
import { getAgenciaData, type DadosAgencia } from "@/lib/supabase/agencias-local"
import { getVeiculosUsuario, type Veiculo } from "@/lib/supabase/veiculos"
import { getUserProfile } from "@/lib/supabase/profiles"
import { AgencyLeads } from "@/components/agency-leads"
import { getAgencySalesStats, getAgencySales, type VehicleSale, type SalesStats } from "@/lib/supabase/sales"
import { 
  getLeadSources, 
  getPerformanceMetrics, 
  getAgencySatisfactionAverage,
  calculatePerformanceMetrics,
  getCalculatedPerformanceMetrics,
  type LeadSource,
  type PerformanceMetric,
  type CalculatedPerformanceMetrics 
} from "@/lib/supabase/reports"
import { getAgencyLeads } from "@/lib/supabase/vehicle-favorites"
import { PlanUsageDashboard } from "@/components/plan-usage-dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts"

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
  
  // Estados para relatórios
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null)
  const [vendas, setVendas] = useState<VehicleSale[]>([])
  const [loadingSalesData, setLoadingSalesData] = useState(false)
  const [reportsPeriod, setReportsPeriod] = useState('30') // dias
  
  // Estados para dados reais dos relatórios
  const [leadsBySource, setLeadsBySource] = useState<LeadSource[]>([])
  const [satisfactionAverage, setSatisfactionAverage] = useState<number>(0)
  const [isLoadingReports, setIsLoadingReports] = useState(true)
  const [performanceMetrics, setPerformanceMetrics] = useState<CalculatedPerformanceMetrics | null>(null)
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  
  // Estados para leads reais
  const [realLeadsData, setRealLeadsData] = useState({
    totalLeads: 0,
    leadsAtivos: 0,
    leadsConvertidos: 0,
    loading: true
  })

  // Estado para leads recentes reais
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [loadingRecentLeads, setLoadingRecentLeads] = useState(true)
  
  // Estados para métricas de veículos (visualizações e favoritos)
  const [vehicleMetrics, setVehicleMetrics] = useState<{[key: string]: {views: number, favorites: number}}>({})
  const [loadingVehicleMetrics, setLoadingVehicleMetrics] = useState(false)

  // Função para carregar métricas de veículos
  const loadVehicleMetrics = async (agencyId: string) => {
    setLoadingVehicleMetrics(true)
    try {
      // Buscar todos os leads da agência para calcular visualizações e favoritos
      const { data: leads, error } = await getAgencyLeads(agencyId)
      
      if (leads && !error) {
        const metrics: {[key: string]: {views: number, favorites: number}} = {}
        
        leads.forEach(lead => {
          const vehicleId = lead.vehicle_id
          if (!metrics[vehicleId]) {
            metrics[vehicleId] = { views: 0, favorites: 0 }
          }
          
          if (lead.lead_type === 'view_details') {
            metrics[vehicleId].views++
          } else if (lead.lead_type === 'favorite') {
            metrics[vehicleId].favorites++
          }
        })
        
        setVehicleMetrics(metrics)
      }
    } catch (error) {
      console.error('Erro ao carregar métricas de veículos:', error)
    } finally {
      setLoadingVehicleMetrics(false)
    }
  }

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

        // Carregar dados da agência (crítico - deve ser primeiro)
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
        
        // Verificar se o usuário tem um plano ativo
        const userProfile = await getUserProfile(user.id)
        if (!userProfile || !userProfile.plano_atual) {
          toast({
            variant: "destructive",
            title: "Plano necessário",
            description: "Você precisa escolher um plano para acessar o painel da agência.",
          })
          router.push("/planos")
          return
        }
        
        // Carregar dados essenciais em paralelo para acelerar o carregamento
        const loadEssentialData = async () => {
          setLoadingVeiculos(true)
          
          try {
            // Executar chamadas críticas em paralelo
            const [veiculosResult] = await Promise.allSettled([
              getVeiculosUsuario()
            ])
            
            // Processar resultado dos veículos
            if (veiculosResult.status === 'fulfilled') {
              const { data: veiculosData, error: veiculosError } = veiculosResult.value
              if (veiculosError) {
                console.error("Erro ao carregar veículos:", veiculosError)
              } else {
                setVeiculos(veiculosData || [])
              }
            }
          } catch (error) {
            console.error("Erro ao buscar dados essenciais:", error)
          } finally {
            setLoadingVeiculos(false)
          }
        }
        
        // Carregar dados de relatórios de forma assíncrona (não bloqueia a UI)
        const loadReportsData = async () => {
          setIsLoadingReports(true)
          
          try {
            // Executar chamadas de relatórios em paralelo
            const [leadsResult, satisfactionResult, metricsResult] = await Promise.allSettled([
              getLeadSources(agenciaData.id.toString()),
              getAgencySatisfactionAverage(agenciaData.id.toString()),
              getCalculatedPerformanceMetrics(agenciaData.id.toString())
            ])
            
            // Processar leads
            if (leadsResult.status === 'fulfilled') {
              const { data: leadsData, error: leadsError } = leadsResult.value
              if (leadsData && leadsData.length > 0) {
                setLeadsBySource(leadsData)
              } else {
                // Usar dados simulados
                const simulatedLeads: LeadSource[] = [
                  { id: '1', agency_id: agenciaData.id.toString(), source_name: 'Site', lead_count: 45, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                  { id: '2', agency_id: agenciaData.id.toString(), source_name: 'WhatsApp', lead_count: 32, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                  { id: '3', agency_id: agenciaData.id.toString(), source_name: 'Indicação', lead_count: 28, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                  { id: '4', agency_id: agenciaData.id.toString(), source_name: 'Redes Sociais', lead_count: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                ]
                setLeadsBySource(simulatedLeads)
              }
            }
            
            // Processar satisfação
            if (satisfactionResult.status === 'fulfilled') {
              const { data: satisfaction } = satisfactionResult.value
              setSatisfactionAverage(satisfaction !== null && satisfaction !== undefined ? satisfaction : 4.2)
            } else {
              setSatisfactionAverage(4.2)
            }
            
            // Processar métricas de performance
            if (metricsResult.status === 'fulfilled') {
              const { data: metrics } = metricsResult.value
              if (metrics) {
                setPerformanceMetrics(metrics)
              }
            }
            
          } catch (error) {
            console.error('Erro ao carregar dados dos relatórios:', error)
            // Usar dados simulados em caso de erro
            const simulatedLeads: LeadSource[] = [
              { id: '1', agency_id: agenciaData.id.toString(), source_name: 'Site', lead_count: 45, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: '2', agency_id: agenciaData.id.toString(), source_name: 'WhatsApp', lead_count: 32, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: '3', agency_id: agenciaData.id.toString(), source_name: 'Indicação', lead_count: 28, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: '4', agency_id: agenciaData.id.toString(), source_name: 'Redes Sociais', lead_count: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            ]
            setLeadsBySource(simulatedLeads)
            setSatisfactionAverage(4.2)
          } finally {
            setIsLoadingReports(false)
            setIsLoadingPerformance(false)
          }
        }
        
        // Carregar métricas de veículos de forma lazy (só quando necessário)
        const loadVehicleMetricsLazy = async () => {
          // Aguardar um pouco para não sobrecarregar o carregamento inicial
          setTimeout(() => {
            loadVehicleMetrics(agenciaData.id.toString())
          }, 1000)
        }
        
        // Executar carregamentos em paralelo
        await Promise.all([
          loadEssentialData(),
          loadReportsData(),
          loadVehicleMetricsLazy()
        ])
        
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

  // Função para carregar dados de vendas e estatísticas
  const loadSalesData = async () => {
    if (!agencia?.id) return
    
    setLoadingSalesData(true)
    try {
      // Carregar estatísticas de vendas
      const statsResult = await getAgencySalesStats(agencia.id.toString())
      if (statsResult.data) {
        setSalesStats(statsResult.data)
      }
      
      // Carregar vendas recentes
      const salesResult = await getAgencySales(agencia.id.toString())
      if (salesResult.data) {
        setVendas(salesResult.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de vendas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de vendas.",
        variant: "destructive",
      })
    } finally {
      setLoadingSalesData(false)
    }
  }

  // Função para carregar dados reais de leads
  const loadLeadsData = async () => {
    if (!agencia?.id) return
    
    setRealLeadsData(prev => ({ ...prev, loading: true }))
    try {
      // Importar a função getAgencyLeads
      const { getAgencyLeads } = await import('@/lib/supabase/vehicle-favorites')
      
      const { data: leadsData, error } = await getAgencyLeads(agencia.id.toString())
      
      if (error) {
        console.log('Erro ao carregar leads ou tabela não existe:', error)
        // Manter dados simulados se houver erro
        setRealLeadsData({
          totalLeads: 156,
          leadsAtivos: 23,
          leadsConvertidos: 12,
          loading: false
        })
        return
      }
      
      if (leadsData && leadsData.length > 0) {
        // Calcular estatísticas dos leads reais
        const totalLeads = leadsData.length
        const leadsAtivos = leadsData.filter(lead => 
          lead.lead_type === 'contact_whatsapp' || 
          lead.lead_type === 'contact_email' || 
          lead.lead_type === 'favorite'
        ).length
        const leadsConvertidos = leadsData.filter(lead => 
          lead.lead_type === 'converted'
        ).length
        
        setRealLeadsData({
          totalLeads,
          leadsAtivos,
          leadsConvertidos,
          loading: false
        })
      } else {
        // Se não há dados, usar valores zerados
        setRealLeadsData({
          totalLeads: 0,
          leadsAtivos: 0,
          leadsConvertidos: 0,
          loading: false
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados de leads:', error)
      // Em caso de erro, usar dados simulados
      setRealLeadsData({
        totalLeads: 156,
        leadsAtivos: 23,
        leadsConvertidos: 12,
        loading: false
      })
    }
  }

  // Função para carregar leads recentes reais
  const loadRecentLeads = async () => {
    if (!agencia?.id) return
    
    setLoadingRecentLeads(true)
    try {
      const { getAgencyLeads } = await import('@/lib/supabase/vehicle-favorites')
      
      const { data: leadsData, error } = await getAgencyLeads(agencia.id.toString())
      
      if (error) {
        console.log('Erro ao carregar leads recentes:', error)
        setRecentLeads([])
        setLoadingRecentLeads(false)
        return
      }
      
      if (leadsData && leadsData.length > 0) {
        // Pegar os 3 leads mais recentes e formatar para o dashboard
        const formattedLeads = leadsData
          .slice(0, 3)
          .map((lead, index) => ({
            id: lead.id || index + 1,
            nome: lead.user_profile?.nome_completo || 'Usuário',
            telefone: lead.user_profile?.whatsapp || 'Não informado',
            email: lead.user_profile?.email || 'Não informado',
            veiculo: lead.vehicle?.titulo || 'Veículo não encontrado',
            status: lead.lead_type === 'favorite' ? 'interessado' : 
                   lead.lead_type === 'contact_whatsapp' ? 'contatado' : 
                   lead.lead_type === 'contact_email' ? 'contatado' : 'novo',
            data: new Date(lead.created_at).toLocaleDateString('pt-BR')
          }))
        
        setRecentLeads(formattedLeads)
      } else {
        setRecentLeads([])
      }
    } catch (error) {
      console.error('Erro ao carregar leads recentes:', error)
      setRecentLeads([])
    } finally {
      setLoadingRecentLeads(false)
    }
  }

  // Carregar dados de vendas e leads quando a agência for carregada
  useEffect(() => {
    if (agencia?.id) {
      loadSalesData()
      loadLeadsData()
      loadRecentLeads()
    }
  }, [agencia?.id])

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
      leads: realLeadsData.totalLeads,
      leadsAtivos: realLeadsData.leadsAtivos,
      vendas: veiculosVendidos,
      faturamento: faturamentoTotal,
      visualizacoes: 2340, // Manter mockado por enquanto
    }
  }, [veiculos, realLeadsData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Skeleton Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Skeleton Main Content */}
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Table */}
            <div className="bg-white rounded-lg border">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
              loadingRecentLeads={loadingRecentLeads}
              performanceMetrics={performanceMetrics}
              isLoadingPerformance={isLoadingPerformance}
              vehicleMetrics={vehicleMetrics}
              loadingVehicleMetrics={loadingVehicleMetrics}
            />
          )}
          {activeTab === "veiculos" && <VeiculosContent vehicles={veiculos} />}
          {activeTab === "leads" && <LeadsContent agencia={agencia} />}
          {activeTab === "vendas" && <VendasContent agencia={agencia} />}
          {activeTab === "relatorios" && (
            <RelatoriosContent 
              stats={stats} 
              salesStats={salesStats}
              vendas={vendas}
              veiculos={veiculos}
              agencia={agencia}
              loadingSalesData={loadingSalesData}
              reportsPeriod={reportsPeriod}
              setReportsPeriod={setReportsPeriod}
              formatCurrency={formatCurrency}
              leadsBySource={leadsBySource}
              satisfactionAverage={satisfactionAverage}
              isLoadingReports={isLoadingReports}
            />
          )}
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
const DashboardContent = memo(function DashboardContent({
  stats,
  recentVehicles,
  recentLeads,
  loadingVeiculos = false,
  loadingRecentLeads = false,
  performanceMetrics = null,
  isLoadingPerformance = false,
  vehicleMetrics = {},
  loadingVehicleMetrics = false,
}: {
  stats: any
  recentVehicles: Veiculo[]
  recentLeads: any[]
  loadingVeiculos?: boolean
  loadingRecentLeads?: boolean
  performanceMetrics?: CalculatedPerformanceMetrics | null
  isLoadingPerformance?: boolean
  vehicleMetrics?: {[key: string]: {views: number, favorites: number}}
  loadingVehicleMetrics?: boolean
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
      {/* Dashboard de Controle de Planos */}
      <PlanUsageDashboard showUpgradePrompt={true} />
      
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
                          <Eye className="h-3 w-3" />
                          {loadingVehicleMetrics ? '...' : (vehicleMetrics[vehicle?.id || '']?.views || 0)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {loadingVehicleMetrics ? '...' : (vehicleMetrics[vehicle?.id || '']?.favorites || 0)}
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
            {loadingRecentLeads ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg animate-pulse">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLeads.length > 0 ? (
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
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
                <p className="text-gray-600">Quando usuários demonstrarem interesse nos seus veículos, eles aparecerão aqui.</p>
              </div>
            )}
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
                <span className="text-sm font-bold text-gray-900">
                  {isLoadingPerformance ? "..." : `${performanceMetrics?.conversionRate || 14.8}%`}
                </span>
              </div>
              <Progress value={performanceMetrics?.conversionRate || 14.8} className="h-2" />
              <p className="text-xs text-gray-500">Meta: 15%</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Tempo Médio de Venda</span>
                <span className="text-sm font-bold text-gray-900">
                  {isLoadingPerformance ? "..." : `${performanceMetrics?.averageSaleTime || 18} dias`}
                </span>
              </div>
              <Progress value={Math.max(0, 100 - ((performanceMetrics?.averageSaleTime || 18) / 25) * 100)} className="h-2" />
              <p className="text-xs text-gray-500">Meta: 25 dias</p>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Satisfação do Cliente</span>
                <span className="text-sm font-bold text-gray-900">
                  {isLoadingPerformance ? "..." : `${performanceMetrics?.satisfactionRating || 4.8}/5`}
                </span>
              </div>
              <Progress value={performanceMetrics?.satisfactionPercentage || 96} className="h-2" />
              <p className="text-xs text-gray-500">
                {isLoadingPerformance ? "..." : `${performanceMetrics?.satisfactionPercentage || 96}% de avaliações positivas`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

// Componente de Veículos
const VeiculosContent = memo(function VeiculosContent({ vehicles }: { vehicles: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingVehicle, setUpdatingVehicle] = useState<string | null>(null)

  // Filtrar veículos baseado no status e termo de busca
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = selectedStatus === "todos" || vehicle.status === selectedStatus
    const matchesSearch = vehicle.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.marca_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.modelo_nome?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Estatísticas dos veículos
  const stats = {
    total: vehicles.length,
    ativos: vehicles.filter(v => v.status === "ativo").length,
    vendidos: vehicles.filter(v => v.status === "vendido").length,
    reservados: vehicles.filter(v => v.status === "reservado").length,
    inativos: vehicles.filter(v => v.status === "inativo").length,
    visiveis: vehicles.filter(v => v.ativo !== false).length,
    destaque: vehicles.filter(v => v.destaque === true).length
  }

  const updateVehicleStatus = async (vehicleId: string, newStatus: string) => {
    setUpdatingVehicle(vehicleId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('veiculos')
        .update({ 
          status: newStatus,
          vendido_em: newStatus === 'vendido' ? new Date().toISOString() : null
        })
        .eq('id', vehicleId)

      if (error) throw error

      toast({
        title: "Status atualizado",
        description: `Veículo marcado como ${newStatus}`,
      })

      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do veículo",
        variant: "destructive"
      })
    } finally {
      setUpdatingVehicle(null)
    }
  }

  const updateVehicleVisibility = async (vehicleId: string, field: 'ativo' | 'destaque', value: boolean) => {
    setUpdatingVehicle(vehicleId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('veiculos')
        .update({ [field]: value })
        .eq('id', vehicleId)

      if (error) throw error

      const fieldLabel = field === 'ativo' ? 'visibilidade' : 'destaque'
      const actionLabel = value ? 'ativado' : 'desativado'
      
      toast({
        title: "Configuração atualizada",
        description: `${fieldLabel} ${actionLabel} com sucesso`,
      })

      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração do veículo",
        variant: "destructive"
      })
    } finally {
      setUpdatingVehicle(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: "Ativo", className: "bg-green-100 text-green-800" },
      vendido: { label: "Vendido", className: "bg-blue-100 text-blue-800" },
      reservado: { label: "Reservado", className: "bg-yellow-100 text-yellow-800" },
      inativo: { label: "Inativo", className: "bg-gray-100 text-gray-800" }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inativo
    return (
      <Badge className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    )
  }

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

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.vendidos}</div>
              <div className="text-sm text-gray-600">Vendidos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.reservados}</div>
              <div className="text-sm text-gray-600">Reservados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.inativos}</div>
              <div className="text-sm text-gray-600">Inativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.visiveis}</div>
              <div className="text-sm text-gray-600">Visíveis</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.destaque}</div>
              <div className="text-sm text-gray-600">Destaque</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por título, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="vendido">Vendidos</option>
              <option value="reservado">Reservados</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Veículos */}
      {filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {vehicles.length === 0 ? "Nenhum veículo cadastrado" : "Nenhum veículo encontrado"}
              </h3>
              <p className="text-gray-600 mb-4">
                {vehicles.length === 0 
                  ? "Comece adicionando seu primeiro veículo ao estoque."
                  : "Tente ajustar os filtros para encontrar o que procura."
                }
              </p>
              {vehicles.length === 0 && (
                <Button 
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => router.push("/cadastro-veiculo")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Veículo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow duration-200">
               <CardContent className="p-3 sm:p-6">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                   {/* Seção Principal - Imagem e Informações */}
                   <div className="lg:col-span-2 flex items-center gap-3 sm:gap-4">
                     {/* Imagem do veículo */}
                     <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden shadow-sm relative">
                       {vehicle.foto_principal ? (
                         <>
                           <Image
                             src={vehicle.foto_principal}
                             alt={vehicle.titulo}
                             width={96}
                             height={96}
                             className="w-full h-full object-cover"
                           />
                           {/* Marca d'água */}
                           <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 opacity-30 pointer-events-none">
                             <Image
                               src="https://ecdmpndeunbzhaihabvi.supabase.co/storage/v1/object/public/telas//3d%20sem%20fundo.png"
                               alt="Marca d'água"
                               width={16}
                               height={16}
                               className="object-contain w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                             />
                           </div>
                         </>
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                           <Car className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-gray-400" />
                         </div>
                       )}
                     </div>

                     {/* Informações do veículo */}
                     <div className="flex-1 min-w-0">
                       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                         <div className="flex-1 min-w-0">
                           <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{vehicle.titulo}</h3>
                           <p className="text-xs sm:text-sm text-gray-600 mb-1">
                             {vehicle.marca_nome} {vehicle.modelo_nome} • {vehicle.ano_fabricacao}
                           </p>
                           <p className="text-lg sm:text-xl font-bold text-orange-600">
                             R$ {vehicle.preco?.toLocaleString('pt-BR')}
                           </p>
                         </div>
                         <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
                           {getStatusBadge(vehicle.status || 'ativo')}
                         </div>
                       </div>
                     </div>
                   </div>

                  {/* Controles de Visibilidade */}
                   <div className="lg:col-span-1 flex flex-col gap-2 sm:gap-4 bg-gray-50 p-2 sm:p-4 rounded-lg border">
                     <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Configurações</div>
                     
                     <div className="flex items-center justify-between gap-2 sm:gap-4">
                       <div className="flex items-center gap-2 sm:gap-3 flex-1">
                         <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                           vehicle.ativo !== false ? 'bg-emerald-500 shadow-emerald-200 shadow-lg' : 'bg-gray-300'
                         }`}></div>
                         <span className={`text-xs sm:text-sm font-medium transition-colors ${
                           vehicle.ativo !== false ? 'text-emerald-700' : 'text-gray-500'
                         }`}>Exibir</span>
                       </div>
                       <Switch
                         checked={vehicle.ativo !== false}
                         onCheckedChange={(checked) => updateVehicleVisibility(vehicle.id, 'ativo', checked)}
                         disabled={updatingVehicle === vehicle.id}
                         className="data-[state=checked]:bg-emerald-600 flex-shrink-0"
                       />
                     </div>
                     
                     <div className="flex items-center justify-between gap-2 sm:gap-4">
                       <div className="flex items-center gap-2 sm:gap-3 flex-1">
                         <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                           vehicle.destaque === true ? 'bg-amber-500 shadow-amber-200 shadow-lg' : 'bg-gray-300'
                         }`}></div>
                         <span className={`text-xs sm:text-sm font-medium transition-colors ${
                           vehicle.destaque === true ? 'text-amber-700' : 'text-gray-500'
                         }`}>Destaque</span>
                       </div>
                       <Switch
                         checked={vehicle.destaque === true}
                         onCheckedChange={(checked) => updateVehicleVisibility(vehicle.id, 'destaque', checked)}
                         disabled={updatingVehicle === vehicle.id}
                         className="data-[state=checked]:bg-amber-600 flex-shrink-0"
                       />
                     </div>
                     
                     {updatingVehicle === vehicle.id && (
                       <div className="flex items-center gap-2 text-xs text-blue-600">
                         <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                         Atualizando...
                       </div>
                     )}
                   </div>

                   {/* Ações */}
                   <div className="lg:col-span-3 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           disabled={updatingVehicle === vehicle.id}
                           className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px] justify-center gap-1 sm:gap-2 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                         >
                           <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                           {updatingVehicle === vehicle.id ? "Atualizando..." : "Status"}
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="start" className="w-56">
                         <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alterar Status</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                           onClick={() => updateVehicleStatus(vehicle.id, 'ativo')}
                           className="flex items-center gap-2 cursor-pointer"
                         >
                           <div className="w-2 h-2 rounded-full bg-green-500"></div>
                           Marcar como Ativo
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => updateVehicleStatus(vehicle.id, 'reservado')}
                           className="flex items-center gap-2 cursor-pointer"
                         >
                           <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                           Marcar como Reservado
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => updateVehicleStatus(vehicle.id, 'vendido')}
                           className="flex items-center gap-2 cursor-pointer"
                         >
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                           Marcar como Vendido
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => updateVehicleStatus(vehicle.id, 'inativo')}
                           className="flex items-center gap-2 cursor-pointer"
                         >
                           <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                           Marcar como Inativo
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                     
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => router.push(`/editar-veiculo/${vehicle.id}`)}
                       className="flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px] justify-center gap-1 sm:gap-2 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all duration-200 text-xs sm:text-sm"
                     >
                       <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                       <span className="hidden sm:inline">Editar</span>
                     </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
})

// Componente de Leads
function LeadsContent({ agencia }: { agencia: DadosAgencia | null }) {
  if (!agencia?.id) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Agência não encontrada</h3>
              <p className="text-gray-600">Não foi possível carregar os dados da agência.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Leads</h2>
          <p className="text-gray-600">Acompanhe usuários interessados nos seus veículos</p>
        </div>
      </div>

      <AgencyLeads agencyId={agencia?.id?.toString()} />
    </div>
  )
}

// Componente de Vendas
function VendasContent({ agencia }: { agencia: DadosAgencia | null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes")
  const [vendas, setVendas] = useState<VehicleSale[]>([])
  const [statsVendas, setStatsVendas] = useState<SalesStats | null>(null)
  const [loadingVendas, setLoadingVendas] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados de vendas
  useEffect(() => {
    if (agencia?.id) {
      loadSalesData()
      loadSalesStats()
    }
  }, [agencia?.id, filtroStatus])

  const loadSalesData = async () => {
    if (!agencia?.id) return
    
    setLoadingVendas(true)
    setError(null)
    try {
      const { data, error } = await getAgencySales(
        agencia.id.toString(),
        filtroStatus === "todos" ? undefined : filtroStatus
      )
      
      if (error) {
        console.error('❌ [SALES] Erro ao buscar vendas:', {
          message: error?.message || 'Erro desconhecido',
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          fullError: error
        })
        setError('Não foi possível carregar as vendas.')
        toast({
          title: "Erro",
          description: "Não foi possível carregar as vendas.",
          variant: "destructive"
        })
        return
      }
      
      setVendas(data || [])
    } catch (error) {
      console.error('❌ [SALES] Erro inesperado ao carregar vendas:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: (error as Error)?.stack,
        fullError: error
      })
      setError('Erro inesperado ao carregar vendas.')
    } finally {
      setLoadingVendas(false)
    }
  }

  const loadSalesStats = async () => {
    if (!agencia?.id) return
    
    setLoadingStats(true)
    try {
      const { data, error } = await getAgencySalesStats(agencia.id.toString())
      
      if (error) {
        console.error('❌ [SALES] Erro ao buscar estatísticas:', {
          message: error?.message || 'Erro desconhecido',
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          fullError: error
        })
        return
      }
      
      setStatsVendas(data)
    } catch (error) {
      console.error('❌ [SALES] Erro inesperado ao carregar estatísticas:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const getStatusBadgeVenda = (status: string) => {
    switch (status) {
      case "concluida":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluída</Badge>
      case "negociacao":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em Negociação</Badge>
      case "pendente":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pendente</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (!agencia) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Agência não encontrada</h3>
              <p className="text-gray-600">Não foi possível carregar os dados da agência.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendas</h2>
          <p className="text-gray-600">Gerencie sua agência</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Estatísticas de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vendas Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? "..." : (statsVendas?.completed_sales || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Em Negociação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? "..." : (statsVendas?.negotiation_sales || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? "..." : (statsVendas?.pending_sales || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Faturamento</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingStats ? "..." : formatCurrency(statsVendas?.total_revenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Comissões</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingStats ? "..." : formatCurrency(statsVendas?.total_commission || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingStats ? "..." : formatCurrency(statsVendas?.average_ticket || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="concluida">Concluídas</SelectItem>
                <SelectItem value="negociacao">Em Negociação</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Este Trimestre</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingVendas ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando vendas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar vendas</h3>
              <p className="text-gray-600">{error.toString()}</p>
            </div>
          ) : vendas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
              <p className="text-gray-600">Ainda não há vendas registradas para esta agência.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendas.map((venda) => (
                <div key={venda.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {venda.vehicle_brand} {venda.vehicle_model} {venda.vehicle_year}
                          </h3>
                          <p className="text-sm text-gray-600">Cliente: {venda.buyer_name}</p>
                          <p className="text-sm text-gray-600">Vendedor: {venda.seller_name}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(venda.sale_price)}</p>
                          <p className="text-sm text-green-600">Comissão: {formatCurrency(venda.commission_amount)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(venda.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getStatusBadgeVenda(venda.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Gerar Contrato
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Relatórios
function RelatoriosContent({ 
  stats, 
  salesStats, 
  vendas, 
  veiculos, 
  agencia, 
  loadingSalesData, 
  reportsPeriod, 
  setReportsPeriod, 
  formatCurrency,
  leadsBySource,
  satisfactionAverage,
  isLoadingReports
}: { 
  stats: any
  salesStats: SalesStats | null
  vendas: VehicleSale[]
  veiculos: Veiculo[]
  agencia: DadosAgencia | null
  loadingSalesData: boolean
  reportsPeriod: string
  setReportsPeriod: (period: string) => void
  formatCurrency: (value: number) => string
  leadsBySource: LeadSource[]
  satisfactionAverage: number
  isLoadingReports: boolean
}) {
  // Função para gerar PDF do relatório
  const generatePDFReport = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Cabeçalho do relatório
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Relatório de Analytics', pageWidth / 2, 20, { align: 'center' })
      
      if (agencia) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Agência: ${agencia?.razao_social || 'Não informado'}`, pageWidth / 2, 30, { align: 'center' })
      }
      
      // Data do relatório
      const currentDate = new Date().toLocaleDateString('pt-BR')
      pdf.setFontSize(10)
      pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, 40, { align: 'center' })
      
      let yPosition = 55
      
      // Seção de KPIs
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Indicadores Principais', 20, yPosition)
      yPosition += 15
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      
      // KPIs em duas colunas
      const leftColumn = 20
      const rightColumn = pageWidth / 2 + 10
      
      pdf.text(`Receita Total: ${formatCurrency(salesStats?.total_revenue || 0)}`, leftColumn, yPosition)
      pdf.text(`Total de Vendas: ${salesStats?.total_sales || 0}`, rightColumn, yPosition)
      yPosition += 10
      
      pdf.text(`Ticket Médio: ${formatCurrency(salesStats?.average_ticket || 0)}`, leftColumn, yPosition)
      // Calculate conversion rate from total leads and completed sales
      const conversionRate = salesStats?.total_sales ? (salesStats.completed_sales / salesStats.total_sales) : 0
      pdf.text(`Taxa de Conversão: ${(conversionRate * 100).toFixed(1)}%`, rightColumn, yPosition)
      yPosition += 20
      
      // Seção de Estatísticas de Leads
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Estatísticas de Leads', 20, yPosition)
      yPosition += 15
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      
      pdf.text(`Total de Leads: ${stats.leads || 0}`, leftColumn, yPosition)
      pdf.text(`Leads Ativos: ${stats.leadsAtivos || 0}`, rightColumn, yPosition)
      yPosition += 10
      
      pdf.text(`Favoritos: ${Math.floor((stats.leads || 0) * 0.6)}`, leftColumn, yPosition)
      pdf.text(`Contatos: ${Math.floor((stats.leads || 0) * 0.4)}`, rightColumn, yPosition)
      yPosition += 20
      
      // Seção de Veículos
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Resumo de Veículos', 20, yPosition)
      yPosition += 15
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      
      const totalVeiculos = veiculos.length
      const veiculosAtivos = veiculos.filter(v => v.status === 'ativo').length
      const veiculosVendidos = veiculos.filter(v => v.status === 'vendido').length
      
      pdf.text(`Total de Veículos: ${totalVeiculos}`, leftColumn, yPosition)
      pdf.text(`Veículos Ativos: ${veiculosAtivos}`, rightColumn, yPosition)
      yPosition += 10
      
      pdf.text(`Veículos Vendidos: ${veiculosVendidos}`, leftColumn, yPosition)
      pdf.text(`Taxa de Vendas: ${totalVeiculos > 0 ? ((veiculosVendidos / totalVeiculos) * 100).toFixed(1) : 0}%`, rightColumn, yPosition)
      yPosition += 20
      
      // Satisfação do Cliente
      if (satisfactionAverage > 0) {
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Satisfação do Cliente', 20, yPosition)
        yPosition += 15
        
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Avaliação Média: ${satisfactionAverage.toFixed(1)}/5.0`, leftColumn, yPosition)
        yPosition += 20
      }
      
      // Rodapé
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      pdf.text('Relatório gerado automaticamente pelo sistema RX Autos', pageWidth / 2, pageHeight - 10, { align: 'center' })
      
      // Salvar o PDF
      const fileName = `relatorio-${agencia?.nome_fantasia?.replace(/\s+/g, '-').toLowerCase() || 'agencia'}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('Relatório PDF gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar o relatório PDF')
    }
  }
  // Função auxiliar para cores dos status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return '#10b981'
      case 'vendido': return '#3b82f6'
      case 'inativo': return '#6b7280'
      default: return '#f59e0b'
    }
  }
  
  // Dados para gráficos
  const salesByMonth = useMemo(() => {
    const monthlyData: { [key: string]: number } = {}
    const currentDate = new Date()
    
    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      monthlyData[monthKey] = 0
    }
    
    vendas.forEach(venda => {
      const vendaDate = new Date(venda.created_at)
      const monthKey = vendaDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += venda.sale_price || 0
      }
    })
    
    return Object.entries(monthlyData).map(([month, value]) => ({
      month,
      vendas: value
    }))
  }, [vendas])
  
  const vehiclesByStatus = useMemo(() => {
    const statusCount = veiculos.reduce((acc, veiculo) => {
      const status = veiculo.status || 'indefinido'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as { [key: string]: number })
    
    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      fill: getStatusColor(status)
    }))
  }, [veiculos])
  
  const performanceData = useMemo(() => {
    const totalLeads = leadsBySource.reduce((sum, source) => sum + source.lead_count, 0)
    const convertedLeads = vendas.length
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    
    return [
      { metric: 'Taxa de Conversão', value: conversionRate, target: 15, unit: '%' },
      { metric: 'Ticket Médio', value: salesStats?.average_ticket || 0, target: 50000, unit: 'R$' },
      { metric: 'Vendas/Mês', value: salesStats?.sales_this_month || 0, target: 10, unit: '' },
      { metric: 'Satisfação', value: satisfactionAverage, target: 4.5, unit: '/5' },
    ]
  }, [salesStats, vendas, leadsBySource, satisfactionAverage])
  
  const chartConfig = {
    vendas: {
      label: "Vendas",
      color: "hsl(var(--chart-1))",
    },
    count: {
      label: "Quantidade",
      color: "hsl(var(--chart-2))",
    },
    leads: {
      label: "Leads",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Analytics</h2>
          <p className="text-gray-600">Análise detalhada do desempenho da agência</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={reportsPeriod} onValueChange={setReportsPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="365">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={generatePDFReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesStats?.total_revenue || 0)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendas Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesStats?.completed_sales || 0}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {salesStats?.pending_sales || 0} pendentes
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesStats?.average_ticket || 0)}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  Meta: R$ 50.000
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
                <p className="text-2xl font-bold text-gray-900">12.5%</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Zap className="h-3 w-3 mr-1" />
                  Meta: 15%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Vendas por Mês */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Evolução de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-2 sm:p-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] min-w-[300px] w-full">
              <AreaChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [formatCurrency(Number(value)), 'Vendas']}
                />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status dos Veículos */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status dos Veículos
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-2 sm:p-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] min-w-[300px] w-full">
               <RechartsPieChart>
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <Pie data={vehiclesByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80}>
                   {vehiclesByStatus.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.fill} />
                   ))}
                 </Pie>
                 <ChartLegend content={<ChartLegendContent />} />
               </RechartsPieChart>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Indicadores de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceData.map((item, index) => {
              const percentage = item.target > 0 ? (item.value / item.target) * 100 : 0
              const isGood = percentage >= 80
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{item.metric}</span>
                    {isGood ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">
                        {item.unit === 'R$' ? formatCurrency(item.value) : `${item.value.toFixed(1)}${item.unit}`}
                      </span>
                      <span className="text-gray-500">
                        Meta: {item.unit === 'R$' ? formatCurrency(item.target) : `${item.target}${item.unit}`}
                      </span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% da meta
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estatísticas de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <div className="h-[280px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Carregando dados...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Grid de estatísticas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.leads || 0}</div>
                      <div className="text-sm text-blue-800 font-medium">Total de Leads</div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.leadsAtivos || 0}</div>
                      <div className="text-sm text-green-800 font-medium">Este Mês</div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{Math.floor((stats.leads || 0) * 0.6)}</div>
                      <div className="text-sm text-purple-800 font-medium">Favoritos</div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{Math.floor((stats.leads || 0) * 0.4)}</div>
                      <div className="text-sm text-orange-800 font-medium">Contatos</div>
                    </div>
                  </div>
                </div>
                
                {/* Gráfico de barras */}
                <ChartContainer config={{
                  total: { label: "Total de Leads", color: "#3b82f6" },
                  mes: { label: "Este Mês", color: "#10b981" },
                  favoritos: { label: "Favoritos", color: "#8b5cf6" },
                  contatos: { label: "Contatos", color: "#f59e0b" }
                }} className="h-[180px] w-full">
                  <BarChart data={[
                    { categoria: "Total", valor: stats.leads || 0, fill: "#3b82f6" },
                    { categoria: "Este Mês", valor: stats.leadsAtivos || 0, fill: "#10b981" },
                    { categoria: "Favoritos", valor: Math.floor((stats.leads || 0) * 0.6), fill: "#8b5cf6" },
                    { categoria: "Contatos", valor: Math.floor((stats.leads || 0) * 0.4), fill: "#f59e0b" }
                  ]} margin={{ top: 10, right: 10, left: 10, bottom: 5 }} width={100}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" fontSize={12} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Executivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Pontos Positivos</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Crescimento de 12% na receita</li>
                <li>• {stats.veiculosAtivos} veículos ativos no estoque</li>
                <li>• Boa performance em leads do WhatsApp</li>
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Oportunidades</span>
              </div>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Melhorar taxa de conversão (meta: 15%)</li>
                <li>• Aumentar ticket médio</li>
                <li>• Investir mais em redes sociais</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Próximos Passos</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Implementar follow-up automatizado</li>
                <li>• Criar campanhas segmentadas</li>
                <li>• Otimizar processo de vendas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {loadingSalesData && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-600">Carregando dados...</span>
        </div>
      )}
    </div>
  )
}

// Componente de Configurações
function ConfiguracoesContent({ agencia }: { agencia: DadosAgencia | null }) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Estados para edição
  const [editData, setEditData] = useState({
    nome_fantasia: agencia?.nome_fantasia || '',
    razao_social: agencia?.razao_social || '',
    cnpj: agencia?.cnpj || '',
    telefone_principal: agencia?.telefone_principal || '',
    email: agencia?.email || '',
    endereco: agencia?.endereco || '',
    cidade: agencia?.cidade || '',
    estado: agencia?.estado || '',
    cep: agencia?.cep || ''
  })

  // Atualizar editData quando agencia mudar
  useEffect(() => {
    if (agencia) {
      setEditData({
        nome_fantasia: agencia.nome_fantasia || '',
        razao_social: agencia.razao_social || '',
        cnpj: agencia.cnpj || '',
        telefone_principal: agencia.telefone_principal || '',
        email: agencia.email || '',
        endereco: agencia.endereco || '',
        cidade: agencia.cidade || '',
        estado: agencia.estado || '',
        cep: agencia.cep || ''
      })
    }
  }, [agencia])

  const handleSaveBasicInfo = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('agencias')
        .update({
          nome_fantasia: editData.nome_fantasia,
          razao_social: editData.razao_social,
          cnpj: editData.cnpj
        })
        .eq('id', agencia?.id)

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Informações básicas atualizadas com sucesso."
      })
      setEditModalOpen(false)
      window.location.reload() // Recarregar para atualizar os dados
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar informações básicas."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContactInfo = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('agencias')
        .update({
          telefone_principal: editData.telefone_principal,
          email: editData.email,
          endereco: editData.endereco,
          cidade: editData.cidade,
          estado: editData.estado,
          cep: editData.cep
        })
        .eq('id', agencia?.id)

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Dados de contato atualizados com sucesso."
      })
      setContactModalOpen(false)
      window.location.reload()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar dados de contato."
      })
    } finally {
      setLoading(false)
    }
  }

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
              <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
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
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setContactModalOpen(true)}>
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
            <Button variant="outline" className="h-20 flex-col" onClick={() => setEditModalOpen(true)}>
              <Edit className="h-6 w-6 mb-2" />
              Editar Perfil
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setSettingsModalOpen(true)}>
              <Settings className="h-6 w-6 mb-2" />
              Configurações
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setDocumentsModalOpen(true)}>
              <FileText className="h-6 w-6 mb-2" />
              Documentos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Informações Básicas */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Informações Básicas</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={editData.nome_fantasia}
                  onChange={(e) => setEditData({...editData, nome_fantasia: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                  id="razao_social"
                  value={editData.razao_social}
                  onChange={(e) => setEditData({...editData, razao_social: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={editData.cnpj ? formatCnpj(editData.cnpj) : ''}
                  onChange={(e) => setEditData({...editData, cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  disabled={!!agencia?.cnpj}
                  className={agencia?.cnpj ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {agencia?.cnpj && (
                  <p className="text-xs text-gray-500 mt-1">
                    O CNPJ não pode ser alterado após ser salvo por questões de segurança.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveBasicInfo} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Contato */}
      {contactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Atualizar Dados de Contato</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="telefone">Telefone Principal</Label>
                <Input
                  id="telefone"
                  value={editData.telefone_principal}
                  onChange={(e) => setEditData({...editData, telefone_principal: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={editData.endereco}
                  onChange={(e) => setEditData({...editData, endereco: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={editData.cidade}
                    onChange={(e) => setEditData({...editData, cidade: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={editData.estado}
                    onChange={(e) => setEditData({...editData, estado: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={editData.cep}
                  onChange={(e) => setEditData({...editData, cep: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setContactModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveContactInfo} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações Avançadas */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Configurações Avançadas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-gray-600">Receber notificações de novos leads</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Automáticos</Label>
                  <p className="text-sm text-gray-600">Enviar relatórios semanais por email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-gray-600">Ativar tema escuro da interface</p>
                </div>
                <Switch />
              </div>
              <div>
                <Label>Fuso Horário</Label>
                <Select defaultValue="america/sao_paulo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/sao_paulo">América/São Paulo</SelectItem>
                    <SelectItem value="america/rio_branco">América/Rio Branco</SelectItem>
                    <SelectItem value="america/manaus">América/Manaus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setSettingsModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Configurações salvas!",
                  description: "Suas preferências foram atualizadas."
                })
                setSettingsModalOpen(false)
              }} className="flex-1">
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Documentos */}
      {documentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Gerenciar Documentos</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                <Button variant="outline" size="sm">
                  Selecionar Arquivos
                </Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Documentos Existentes:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Contrato Social.pdf</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Alvará de Funcionamento.pdf</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setDocumentsModalOpen(false)} className="flex-1">
                Fechar
              </Button>
              <Button className="flex-1">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
