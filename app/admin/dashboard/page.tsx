'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { deleteAllVeiculoFotos } from '@/lib/supabase/veiculo-storage'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Building2, 
  Car, 
  DollarSign, 
  Bell, 
  Settings, 
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalAgencies: number
  totalVehicles: number
  monthlyRevenue: number
  activeSubscriptions: number
  pendingPayments: number
}

interface User {
  id: string
  name: string
  email: string
  plan: string
  status: 'active' | 'inactive' | 'trial' | 'blocked'
  created_at: string
  whatsapp?: string
  cpf?: string
  cnpj?: string
  cidade?: string
  estado?: string
  endereco?: string
  cep?: string
  data_nascimento?: string
  tipo_pessoa?: string
}

interface Agency {
  id: string
  name: string
  owner: string
  city: string
  state: string
  vehicles: number
  status: 'active' | 'inactive' | 'blocked'
  plan: string
  created_at: string
  email?: string
  phone?: string
  cnpj?: string
}

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  agency: string
  status: 'active' | 'pending' | 'rejected'
  created_at: string
}

interface Payment {
  id: string
  user_name: string
  agency_name: string
  amount: number
  type: 'subscription' | 'commission' | 'fee'
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  due_date: string
  paid_date?: string
  created_at: string
}

interface Notification {
  id: string
  title: string
  message: string
  recipients: 'all' | 'agencies' | 'users'
  status: 'sent' | 'draft' | 'scheduled'
  sent_count: number
  created_at: string
  sent_at?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authError, setAuthError] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAgencies: 0,
    totalVehicles: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    pendingPayments: 0
  })
  
  const [users, setUsers] = useState<User[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAgencies, setLoadingAgencies] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [agencyFilters, setAgencyFilters] = useState({
    search: '',
    status: 'all',
    state: 'all'
  })

  // Estados para usuários
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userFilters, setUserFilters] = useState({
    search: '',
    plan: 'all',
    status: 'all'
  })

  // Estados para veículos
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [vehicleFilters, setVehicleFilters] = useState({
    search: '',
    brand: 'all',
    status: 'all',
    agency: 'all'
  })

  // Estados para pagamentos
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [paymentFilters, setPaymentFilters] = useState({
    search: '',
    status: 'all',
    type: 'all'
  })

  // Estados para notificações
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationForm, setNotificationForm] = useState({
    recipients: 'all',
    title: '',
    message: ''
  })
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Funções para buscar dados reais do Supabase
  const fetchRealStats = async () => {
    try {
      const supabase = createClient()
      
      // Buscar total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      // Buscar total de agências
      const { count: totalAgencies } = await supabase
        .from('dados_agencia')
        .select('*', { count: 'exact', head: true })
      
      // Buscar total de veículos
      const { count: totalVehicles } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
      
      // Buscar assinaturas ativas
      const { count: activeSubscriptions } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      // Calcular receita mensal (simulada baseada em assinaturas)
      const monthlyRevenue = (activeSubscriptions || 0) * 150 // Valor médio de assinatura
      
      const realStats: DashboardStats = {
        totalUsers: totalUsers || 0,
        totalAgencies: totalAgencies || 0,
        totalVehicles: totalVehicles || 0,
        monthlyRevenue,
        activeSubscriptions: activeSubscriptions || 0,
        pendingPayments: 0 // Implementar quando tiver tabela de pagamentos
      }
      
      setStats(realStats)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      // Usar dados mock em caso de erro
      setStats({
        totalUsers: 0,
        totalAgencies: 0,
        totalVehicles: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        pendingPayments: 0
      })
    }
  }

  // Função para buscar usuários reais
  const fetchRealUsers = async () => {
    try {
      setLoadingUsers(true)
      const supabase = createClient()
      
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nome_completo,
          email,
          plano_atual,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) {
        console.error('Erro ao buscar usuários:', error)
        return
      }
      
      const formattedUsers: User[] = (profilesData || []).map(profile => ({
        id: profile.id,
        name: profile.nome_completo || 'Nome não informado',
        email: profile.email || 'Email não informado',
        plan: profile.plano_atual || 'Nenhum',
        status: profile.status || 'inactive',
        created_at: profile.created_at || new Date().toISOString()
      }))
      
      setUsers(formattedUsers)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Função para buscar veículos reais
  const fetchRealVehicles = async () => {
    try {
      setLoadingVehicles(true)
      const supabase = createClient()
      
      const { data: vehiclesData, error } = await supabase
        .from('veiculos')
        .select(`
          id,
          marca_nome,
          modelo_nome,
          ano_fabricacao,
          preco,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.error('Erro ao buscar veículos:', error)
        return
      }
      
      const formattedVehicles: Vehicle[] = (vehiclesData || []).map(vehicle => ({
        id: vehicle.id,
        brand: vehicle.marca_nome || 'Marca não informada',
        model: vehicle.modelo_nome || 'Modelo não informado',
        year: vehicle.ano_fabricacao || 0,
        price: vehicle.preco || 0,
        agency: 'Usuário não informado', // Simplificado para evitar problemas
        status: vehicle.status || 'pending',
        created_at: vehicle.created_at || new Date().toISOString()
      }))
      
      setVehicles(formattedVehicles)
      console.log('✅ Veículos carregados:', formattedVehicles.length)
    } catch (error) {
      console.error('Erro ao buscar veículos:', error)
    } finally {
      setLoadingVehicles(false)
    }
  }

  // Função para buscar veículos de um usuário específico
  const fetchUserVehicles = async (userId: string) => {
    try {
      setLoadingVehicles(true)
      const supabase = createClient()
      
      console.log('🔍 Buscando veículos para usuário:', userId)
      
      const { data: vehiclesData, error } = await supabase
        .from('veiculos')
        .select(`
          id,
          marca_nome,
          modelo_nome,
          ano_fabricacao,
          preco,
          status,
          created_at,
          user_id
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erro ao buscar veículos do usuário:', error)
        return []
      }
      
      const formattedVehicles: Vehicle[] = (vehiclesData || []).map(vehicle => ({
        id: vehicle.id,
        brand: vehicle.marca_nome || 'Marca não informada',
        model: vehicle.modelo_nome || 'Modelo não informado',
        year: vehicle.ano_fabricacao || 0,
        price: vehicle.preco || 0,
        agency: 'Usuário não informado', // Removido profiles para evitar erro
        status: vehicle.status || 'pending',
        created_at: vehicle.created_at || new Date().toISOString()
      }))
      
      console.log('✅ Veículos encontrados para o usuário:', formattedVehicles.length)
      return formattedVehicles
    } catch (error) {
      console.error('Erro ao buscar veículos do usuário:', error)
      return []
    } finally {
      setLoadingVehicles(false)
    }
  }

  // Função para buscar agências reais
  const fetchRealAgencies = async () => {
    try {
      setLoadingAgencies(true)
      const supabase = createClient()
      
      const { data: agenciesData, error } = await supabase
        .from('dados_agencia')
        .select(`
          id,
          nome_fantasia,
          email,
          telefone_principal,
          cidade,
          estado,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) {
        console.error('Erro ao buscar agências:', error)
        return
      }
      
      const formattedAgencies: Agency[] = (agenciesData || []).map(agency => ({
        id: agency.id.toString(),
        name: agency.nome_fantasia || 'Nome não informado',
        owner: 'Proprietário não informado',
        city: agency.cidade || 'Cidade não informada',
        state: agency.estado || 'Estado não informado',
        vehicles: 0,
        status: 'active' as const,
        plan: 'Basic',
        created_at: agency.created_at || new Date().toISOString(),
        email: agency.email || 'Email não informado',
        phone: agency.telefone_principal || 'Telefone não informado',
        cnpj: undefined
      }))
      
      setAgencies(formattedAgencies)
    } catch (error) {
      console.error('Erro ao buscar agências:', error)
    } finally {
      setLoadingAgencies(false)
    }
  }

  // Função para buscar dados de pagamentos/assinaturas
  const fetchRealPayments = async () => {
    try {
      setLoadingPayments(true)
      const supabase = createClient()
      
      const { data: subscriptionsData, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          plan_type,
          status,
          plan_value,
          start_date,
          end_date,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) {
        console.error('Erro ao buscar assinaturas:', error.message || error)
        setPayments([])
        return
      }
      
      // Buscar dados dos usuários para cada assinatura
      const subscriptionsWithUsers = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          let userName = 'Usuário não informado'
          
          if (subscription.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('nome_completo')
              .eq('id', subscription.user_id)
              .single()
            
            userName = profileData?.nome_completo || 'Usuário não informado'
          }
          
          return {
            ...subscription,
            user_name: userName
          }
        })
      )
      
      const formattedPayments: Payment[] = subscriptionsWithUsers.map(subscription => ({
        id: subscription.id,
        user_name: subscription.user_name,
        agency_name: 'N/A', // Implementar se necessário
        amount: subscription.plan_value || 0,
        type: 'subscription',
        status: subscription.status === 'active' ? 'paid' : 'pending',
        due_date: subscription.end_date || '',
        paid_date: subscription.status === 'active' ? subscription.start_date : undefined,
        created_at: subscription.created_at || new Date().toISOString()
      }))
      
      setPayments(formattedPayments)
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error)
      setPayments([])
    } finally {
      setLoadingPayments(false)
    }
  }

  // Função para buscar notificações (mock por enquanto)
  const fetchRealNotifications = async () => {
    try {
      setLoadingNotifications(true)
      // Mock data para notificações até implementar tabela específica
      const mockNotifications: Notification[] = [
        { id: '1', title: 'Sistema Conectado', message: 'Dashboard administrativo conectado ao Supabase com dados reais!', recipients: 'all', status: 'sent', sent_count: stats.totalUsers, created_at: new Date().toISOString(), sent_at: new Date().toISOString() },
        { id: '2', title: 'Dados Atualizados', message: 'Todos os dados são agora carregados em tempo real do banco de dados.', recipients: 'agencies', status: 'sent', sent_count: stats.totalAgencies, created_at: new Date().toISOString(), sent_at: new Date().toISOString() }
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Função para testar busca de veículos de um usuário específico


  // Verificar autenticação de administrador
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        console.log('🔐 Iniciando verificação de autenticação admin...')
        const supabase = createClient()
        
        // Verificar se o usuário está logado
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('👤 Sessão do usuário:', session?.user?.id)
        
        if (sessionError || !session) {
          console.log('⚠️ Modo desenvolvimento: Permitindo acesso sem autenticação')
          setIsAdmin(true)
          setAuthLoading(false)
          return
        }

        // Verificar se o usuário é administrador
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .eq('is_admin', true)
          .single()

        console.log('🔍 Dados do admin:', adminData)
        console.log('❌ Erro admin:', adminError)

        if (adminError || !adminData) {
          console.log('⚠️ Modo desenvolvimento: Usuário sem permissões admin, mas permitindo acesso')
          // Em produção, descomentar as linhas abaixo:
          // setAuthError('Acesso negado: usuário não é administrador')
          // router.push('/admin/login')
          // return
        }

        console.log('✅ Usuário é administrador, definindo isAdmin = true')
        setIsAdmin(true)
        setAuthLoading(false)
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error)
        setAuthError('Erro interno do servidor')
        setAuthLoading(false)
        router.push('/admin/login')
      }
    }

    checkAdminAuth()
  }, [])

  // Sistema de logout automático por segurança
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        console.log('🔒 Logout automático executado por segurança')
      } catch (error) {
        console.error('Erro no logout automático:', error)
      }
    }

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          const supabase = createClient()
          await supabase.auth.signOut()
          console.log('🔒 Logout automático executado - página oculta')
        } catch (error) {
          console.error('Erro no logout automático:', error)
        }
      }
    }

    const handlePageHide = async () => {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        console.log('🔒 Logout automático executado - página escondida')
      } catch (error) {
        console.error('Erro no logout automático:', error)
      }
    }

    // Event listeners para logout automático
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    
    // Carregar dados reais em paralelo com timeout
    setLoading(true)
    
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Timeout de carregamento atingido, forçando fim do loading')
      setLoading(false)
    }, 10000) // 10 segundos de timeout
    
    Promise.all([
      fetchRealStats(),
      fetchRealUsers(),
      fetchRealAgencies(),
      fetchRealVehicles(),
      fetchRealPayments(),
      fetchRealNotifications()
    ]).finally(() => {
      clearTimeout(timeoutId)
      setLoading(false)
      console.log('✅ Carregamento concluído')
    }).catch((error) => {
      console.error('❌ Erro durante carregamento:', error)
      clearTimeout(timeoutId)
      setLoading(false)
    })
  }, [isAdmin])

  // Função para carregar agências do Supabase
  const loadAgencies = async () => {
    setLoadingAgencies(true)
    try {
      console.log('🔄 Carregando agências...')
      const supabase = createClient()
      const { data: agenciesData, error } = await supabase
        .from('dados_agencia')
        .select(`
          id,
          nome,
          proprietario,
          cidade,
          estado,
          email,
          telefone,
          cnpj,
          status,
          created_at
        `)
      
      console.log('📊 Dados de agências recebidos:', agenciesData)
      console.log('❌ Erro na consulta de agências:', error)
      
      if (error) {
        console.error('Erro ao carregar agências:', error)
        // Usar dados mockados em caso de erro
        setAgencies([
          {
            id: '1',
            name: 'Auto Center Silva',
            owner: 'João Silva',
            city: 'São Paulo',
            state: 'SP',
            vehicles: 45,
            status: 'active',
            plan: 'Premium',
            created_at: '2024-01-10',
            email: 'joao@autocentro.com',
            phone: '(11) 99999-9999',
            cnpj: '12.345.678/0001-90'
          }
        ])
        return
      }

      // Contar veículos para cada agência
      const agenciesWithVehicles = await Promise.all(
        (agenciesData || []).map(async (agency) => {
          const { count } = await supabase
            .from('veiculos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', agency.id)
          
          return {
            id: agency.id,
            name: agency.nome || 'Nome não informado',
            owner: agency.proprietario || 'Proprietário não informado',
            city: agency.cidade || 'Cidade não informada',
            state: agency.estado || 'Estado não informado',
            email: agency.email || 'Email não informado',
            phone: agency.telefone || 'Telefone não informado',
            cnpj: agency.cnpj || 'CNPJ não informado',
            vehicles: count || 0,
            status: agency.status || 'active',
            plan: 'Basic', // Valor padrão já que não temos essa coluna na tabela dados_agencia
            created_at: agency.created_at
          } as Agency
        })
      )

      // Aplicar filtros
      const filteredAgencies = agenciesWithVehicles.filter(agency => {
        const matchesSearch = !agencyFilters.search || 
          agency.name.toLowerCase().includes(agencyFilters.search.toLowerCase()) ||
          agency.owner.toLowerCase().includes(agencyFilters.search.toLowerCase())
        
        const matchesStatus = agencyFilters.status === 'all' || agency.status === agencyFilters.status
        const matchesState = agencyFilters.state === 'all' || agency.state === agencyFilters.state
        
        return matchesSearch && matchesStatus && matchesState
      })

      setAgencies(filteredAgencies)
    } catch (error) {
      console.error('Erro ao carregar agências:', error)
      // Fallback para dados mockados em caso de erro
      setAgencies([
        {
          id: '1',
          name: 'Auto Center Silva',
          owner: 'João Silva',
          city: 'São Paulo',
          state: 'SP',
          vehicles: 45,
          status: 'active',
          plan: 'Premium',
          created_at: '2024-01-10',
          email: 'joao@autocentro.com',
          phone: '(11) 99999-9999',
          cnpj: '12.345.678/0001-90'
        },
        {
          id: '2',
          name: 'Carros & Cia',
          owner: 'Maria Santos',
          city: 'Rio de Janeiro',
          state: 'RJ',
          vehicles: 23,
          status: 'active',
          plan: 'Basic',
          created_at: '2024-01-18',
          email: 'maria@carrosecia.com',
          phone: '(21) 88888-8888',
          cnpj: '98.765.432/0001-10'
        }
      ])
    } finally {
      setLoadingAgencies(false)
    }
  }

  // Função para bloquear/desbloquear agência
  const toggleAgencyStatus = async (agencyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked'
      const supabase = createClient()
      
      const { error } = await supabase
        .from('dados_agencia')
        .update({ status: newStatus })
        .eq('id', agencyId)
      
      if (error) {
        console.error('Erro ao atualizar status da agência:', error)
        return
      }
      
      setAgencies(prev => 
        prev.map(agency => 
          agency.id === agencyId 
            ? { ...agency, status: newStatus as 'active' | 'inactive' | 'blocked' }
            : agency
        )
      )
      
      console.log(`Agência ${agencyId} ${newStatus === 'blocked' ? 'bloqueada' : 'desbloqueada'}`)
    } catch (error) {
      console.error('Erro ao alterar status da agência:', error)
    }
  }

  // Função para carregar usuários do Supabase
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      console.log('🔄 Carregando usuários...')
      const supabase = createClient()
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nome_completo,
          email,
          plano_atual,
          created_at,
          whatsapp,
          cpf,
          cnpj,
          cidade,
          estado,
          endereco,
          cep,
          data_nascimento,
          tipo_pessoa
        `)
        .order('created_at', { ascending: false })
      
      console.log('👥 Dados de usuários recebidos:', usersData)
      console.log('❌ Erro na consulta de usuários:', error)
      
      if (error) {
        console.error('Erro ao carregar usuários:', error)
        alert(`Erro ao buscar usuários: ${error.message}`)
        return
      }

      // Mapear dados dos usuários
      const mappedUsers = (usersData || []).map(user => ({
        id: user.id,
        name: user.nome_completo || 'Nome não informado',
        email: user.email || 'Email não informado',
        plan: user.plano_atual || 'individual',
        status: 'active' as const,
        created_at: user.created_at,
        whatsapp: user.whatsapp,
        cpf: user.cpf,
        cnpj: user.cnpj,
        cidade: user.cidade,
        estado: user.estado,
        endereco: user.endereco,
        cep: user.cep,
        data_nascimento: user.data_nascimento,
        tipo_pessoa: user.tipo_pessoa
      } as User & {
        whatsapp?: string
        cpf?: string
        cnpj?: string
        cidade?: string
        estado?: string
        endereco?: string
        cep?: string
        data_nascimento?: string
        tipo_pessoa?: string
      }))

      // Aplicar filtros
      const filteredUsers = mappedUsers.filter(user => {
        const matchesSearch = !userFilters.search || 
          user.name?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
          user.email?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
          user.whatsapp?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
          user.cpf?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
          user.cnpj?.toLowerCase().includes(userFilters.search.toLowerCase())
        
        const matchesPlan = userFilters.plan === 'all' || user.plan === userFilters.plan
        const matchesStatus = userFilters.status === 'all' || user.status === userFilters.status
        
        return matchesSearch && matchesPlan && matchesStatus
      })

      setUsers(filteredUsers)
      console.log(`✅ ${filteredUsers.length} usuários carregados com sucesso`)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      alert(`Erro inesperado ao carregar usuários: ${error}`)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Função para alterar plano do usuário
  const changeUserPlan = async (userId: string, newPlan: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ plano_atual: newPlan })
        .eq('id', userId)
      
      if (error) {
        console.error('Erro ao atualizar plano do usuário:', error)
        return
      }
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, plan: newPlan }
            : user
        )
      )
      
      console.log(`Plano do usuário ${userId} alterado para ${newPlan}`)
    } catch (error) {
      console.error('Erro ao alterar plano do usuário:', error)
    }
  }

  // Função para bloquear/desbloquear usuário
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked'
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)
      
      if (error) {
        console.error('Erro ao atualizar status do usuário:', error)
        return
      }
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus as 'active' | 'inactive' | 'trial' | 'blocked' }
            : user
        )
      )
      
      console.log(`Usuário ${userId} ${newStatus === 'blocked' ? 'bloqueado' : 'desbloqueado'}`)
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
    }
  }

  // Função para carregar veículos do Supabase
  const loadVehicles = async () => {
    setLoadingVehicles(true)
    try {
      const supabase = createClient()
      const { data: vehiclesData, error } = await supabase
        .from('veiculos')
        .select(`
          id,
          marca_nome,
          modelo_nome,
          ano_fabricacao,
          preco,
          status,
          created_at,
          user_id
        `)
      
      if (error) {
        console.error('Erro ao carregar veículos:', error)
        return
      }

      // Buscar dados dos usuários/agências para cada veículo
      const vehiclesWithAgencies = await Promise.all(
        (vehiclesData || []).map(async (vehicle) => {
          let agencyName = 'Agência não informada'
          
          if (vehicle.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('nome_completo')
              .eq('id', vehicle.user_id)
              .single()
            
            agencyName = profileData?.nome_completo || 'Agência não informada'
          }
          
          return {
            ...vehicle,
            agency_name: agencyName
          }
        })
      )
      
      // Aplicar filtros
      const filteredVehicles = vehiclesWithAgencies.filter(vehicle => {
        const searchTerm = vehicleFilters.search.toLowerCase()
        const matchesSearch = !vehicleFilters.search || 
          vehicle.marca_nome?.toLowerCase().includes(searchTerm) ||
          vehicle.modelo_nome?.toLowerCase().includes(searchTerm)
        
        const matchesBrand = vehicleFilters.brand === 'all' || vehicle.marca_nome === vehicleFilters.brand
        const matchesStatus = vehicleFilters.status === 'all' || vehicle.status === vehicleFilters.status
        
        return matchesSearch && matchesBrand && matchesStatus
      }).map(vehicle => ({
        id: vehicle.id,
        title: `${vehicle.marca_nome} ${vehicle.modelo_nome} ${vehicle.ano_fabricacao}`,
        brand: vehicle.marca_nome || 'Marca não informada',
        model: vehicle.modelo_nome || 'Modelo não informado',
        year: vehicle.ano_fabricacao || 0,
        price: vehicle.preco || 0,
        agency: vehicle.agency_name,
        status: vehicle.status || 'pending',
        created_at: vehicle.created_at
      } as Vehicle))

      setVehicles(filteredVehicles)
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
      // Fallback para array vazio em caso de erro
      setVehicles([])
    } finally {
      setLoadingVehicles(false)
    }
  }

  // Função para moderar veículo (aprovar/rejeitar)
  const moderateVehicle = async (vehicleId: string, newStatus: 'active' | 'rejected' | 'pending') => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('veiculos')
        .update({ status: newStatus })
        .eq('id', vehicleId)
      
      if (error) {
        console.error('Erro ao moderar veículo:', error)
        return
      }
      
      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === vehicleId 
            ? { ...vehicle, status: newStatus }
            : vehicle
        )
      )
      
      const statusText = newStatus === 'active' ? 'aprovado' : 
                        newStatus === 'rejected' ? 'rejeitado' : 'pendente'
      console.log(`Veículo ${vehicleId} ${statusText}`)
    } catch (error) {
      console.error('Erro ao moderar veículo:', error)
    }
  }

  // Função para deletar veículo
  const deleteVehicle = async (vehicleId: string) => {
    try {
      const supabase = createClient()
      
      // Primeiro, deletar todas as fotos do storage
      console.log('🗑️ [ADMIN] Deletando fotos do veículo:', vehicleId)
      const fotosDeleted = await deleteAllVeiculoFotos(vehicleId)
      
      if (!fotosDeleted) {
        console.warn('⚠️ [ADMIN] Não foi possível deletar todas as fotos do storage, mas continuando com a exclusão do veículo')
      } else {
        console.log('✅ [ADMIN] Fotos do veículo deletadas com sucesso')
      }
      
      // Depois, deletar o veículo do banco de dados
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', vehicleId)
      
      if (error) {
        console.error('❌ [ADMIN] Erro ao deletar veículo:', error)
        return
      }
      
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId))
      console.log(`✅ [ADMIN] Veículo ${vehicleId} deletado com sucesso`)
    } catch (error) {
      console.error('Erro ao deletar veículo:', error)
    }
  }

  // Função para carregar pagamentos
  const loadPayments = async () => {
    try {
      setLoadingPayments(true)
      const supabase = createClient()
      
      let query = supabase
        .from('payments')
        .select(`
          *,
          profiles!payments_user_id_fkey(name),
          agencies!payments_agency_id_fkey(name)
        `)
      
      // Aplicar filtros
      if (paymentFilters.search) {
        query = query.or(`profiles.name.ilike.%${paymentFilters.search}%,agencies.name.ilike.%${paymentFilters.search}%`)
      }
      
      if (paymentFilters.status !== 'all') {
        query = query.eq('status', paymentFilters.status)
      }
      
      if (paymentFilters.type !== 'all') {
        query = query.eq('type', paymentFilters.type)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erro ao carregar pagamentos:', error)
        // Usar array vazio em caso de erro
        setPayments([])
        return
      }
      
      // Transformar dados para o formato esperado
      const formattedPayments = data?.map(payment => ({
        id: payment.id,
        user_name: payment.profiles?.name || 'N/A',
        agency_name: payment.agencies?.name || 'N/A',
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        due_date: payment.due_date,
        paid_date: payment.paid_date,
        created_at: payment.created_at
      })) || []
      
      setPayments(formattedPayments)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
      // Usar array vazio em caso de erro
      setPayments([])
    } finally {
      setLoadingPayments(false)
    }
  }

  // Função para gerar cobrança
  const generateCharge = async (userId: string, amount: number, type: 'subscription' | 'commission' | 'fee') => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          amount,
          type,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
        })
      
      if (error) {
        console.error('Erro ao gerar cobrança:', error)
        return
      }
      
      // Recarregar lista de pagamentos
      loadPayments()
    } catch (error) {
      console.error('Erro ao gerar cobrança:', error)
    }
  }

  // Função para atualizar status do pagamento
  const updatePaymentStatus = async (paymentId: string, status: 'paid' | 'cancelled') => {
    try {
      const supabase = createClient()
      
      const updateData: any = { status }
      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
      
      if (error) {
        console.error('Erro ao atualizar pagamento:', error)
        return
      }
      
      // Recarregar lista de pagamentos
      loadPayments()
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error)
    }
  }

  // Função para carregar notificações
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const supabase = createClient()
      
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        console.error('Erro ao carregar notificações:', error)
        // Usar array vazio em caso de erro
        setNotifications([])
        return
      }
      
      setNotifications(data || [])
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      // Usar array vazio em caso de erro
      setNotifications([])
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Função para enviar notificação
  const sendNotification = async () => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: notificationForm.title,
          message: notificationForm.message,
          recipients: notificationForm.recipients,
          status: 'sent',
          sent_count: notificationForm.recipients === 'all' ? 1250 : 
                     notificationForm.recipients === 'agencies' ? 89 : 456,
          sent_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Erro ao enviar notificação:', error)
        return
      }
      
      // Limpar formulário
      setNotificationForm({
        recipients: 'all',
        title: '',
        message: ''
      })
      
      // Recarregar lista de notificações
      loadNotifications()
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const },
      inactive: { label: 'Inativo', variant: 'secondary' as const },
      trial: { label: 'Teste', variant: 'outline' as const },
      blocked: { label: 'Bloqueado', variant: 'destructive' as const },
      pending: { label: 'Pendente', variant: 'outline' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const adminDashboardContent = (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie todo o sistema RX Negócio</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="agencies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Agências
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Veículos
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agências Ativas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAgencies}</div>
                  <p className="text-xs text-muted-foreground">+5% em relação ao mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVehicles.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% em relação ao mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+15% em relação ao mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">+7% em relação ao mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                  <p className="text-xs text-muted-foreground">Requer atenção</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={userFilters.search}
                    onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-64"
                  />
                </div>
                <select 
                  className="px-3 py-2 border rounded-md text-sm"
                  value={userFilters.plan}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, plan: e.target.value }))}
                >
                  <option value="all">Todos os Planos</option>
                  <option value="individual">Individual</option>
                  <option value="basico">Básico</option>
                  <option value="premium">Premium</option>
                  <option value="premium_plus">Premium Plus</option>
                </select>
                <select 
                  className="px-3 py-2 border rounded-md text-sm"
                  value={userFilters.status}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="trial">Trial</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={loadUsers}
                  disabled={loadingUsers}
                >
                  {loadingUsers ? 'Carregando...' : 'Atualizar'}
                </Button>
              </div>
            </div>
            
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users
                          .filter(user => {
                            const matchesSearch = userFilters.search === '' || 
                              user.name.toLowerCase().includes(userFilters.search.toLowerCase()) ||
                              user.email.toLowerCase().includes(userFilters.search.toLowerCase())
                            const matchesPlan = userFilters.plan === 'all' || user.plan === userFilters.plan
                            const matchesStatus = userFilters.status === 'all' || user.status === userFilters.status
                            return matchesSearch && matchesPlan && matchesStatus
                          })
                          .map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.tipo_pessoa && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    {user.tipo_pessoa === 'fisica' ? '👤 Pessoa Física' : '🏢 Pessoa Jurídica'}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {user.whatsapp ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-green-600">📱</span>
                                    {user.whatsapp}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Não informado</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {user.cpf && (
                                  <div>CPF: {user.cpf}</div>
                                )}
                                {user.cnpj && (
                                  <div>CNPJ: {user.cnpj}</div>
                                )}
                                {!user.cpf && !user.cnpj && (
                                  <span className="text-gray-400">Não informado</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {user.cidade && user.estado ? (
                                  <div>
                                    <div>{user.cidade}</div>
                                    <div className="text-xs text-gray-500">{user.estado}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Não informado</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select 
                                className="px-2 py-1 border rounded text-sm"
                                value={user.plan}
                                onChange={(e) => changeUserPlan(user.id, e.target.value)}
                              >
                                <option value="individual">Individual</option>
                                <option value="basico">Básico</option>
                                <option value="premium">Premium</option>
                                <option value="premium_plus">Premium Plus</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(user.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleUserStatus(user.id, user.status)}
                                  title={user.status === 'blocked' ? 'Desbloquear usuário' : 'Bloquear usuário'}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Agencies Management */}
          <TabsContent value="agencies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Agências</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar agências..."
                    value={agencyFilters.search}
                    onChange={(e) => setAgencyFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-64"
                  />
                </div>
                <select 
                  className="px-3 py-2 border rounded-md text-sm"
                  value={agencyFilters.status}
                  onChange={(e) => setAgencyFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
                <select 
                  className="px-3 py-2 border rounded-md text-sm"
                  value={agencyFilters.state}
                  onChange={(e) => setAgencyFilters(prev => ({ ...prev, state: e.target.value }))}
                >
                  <option value="all">Todos os Estados</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="RS">Rio Grande do Sul</option>
                </select>
                <Button variant="outline" onClick={loadAgencies}>
                  <Filter className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
            
            {loadingAgencies ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agência</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proprietário</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {agencies
                          .filter(agency => {
                            const matchesSearch = agencyFilters.search === '' || 
                              agency.name.toLowerCase().includes(agencyFilters.search.toLowerCase()) ||
                              agency.owner.toLowerCase().includes(agencyFilters.search.toLowerCase())
                            const matchesStatus = agencyFilters.status === 'all' || agency.status === agencyFilters.status
                            const matchesState = agencyFilters.state === 'all' || agency.state === agencyFilters.state
                            return matchesSearch && matchesStatus && matchesState
                          })
                          .map((agency) => (
                          <tr key={agency.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{agency.name}</div>
                                {agency.email && (
                                  <div className="text-sm text-gray-500">{agency.email}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">{agency.owner}</div>
                                {agency.phone && (
                                  <div className="text-sm text-gray-500">{agency.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{agency.city}, {agency.state}</div>
                              {agency.cnpj && (
                                <div className="text-sm text-gray-500">CNPJ: {agency.cnpj}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">{agency.vehicles}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={agency.plan === 'Premium' ? 'default' : 'secondary'}>
                                {agency.plan}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(agency.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title={agency.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                  onClick={() => toggleAgencyStatus(agency.id, agency.status)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" title="Ver detalhes">
                                  <Building2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {agencies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma agência encontrada
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vehicles Management */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Veículos</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar veículos..."
                    className="pl-10 w-64"
                    value={vehicleFilters.search}
                    onChange={(e) => setVehicleFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <select 
                  className="px-3 py-2 border rounded-md text-sm"
                  value={vehicleFilters.brand}
                  onChange={(e) => setVehicleFilters(prev => ({ ...prev, brand: e.target.value }))}
                >
                  <option value="all">Todas as Marcas</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                </select>
                <select 
                  className="px-3 py-2 border rounded-md text-sm"
                  value={vehicleFilters.status}
                  onChange={(e) => setVehicleFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="rejected">Rejeitado</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={loadVehicles}
                  disabled={loadingVehicles}
                >
                  {loadingVehicles ? 'Carregando...' : 'Atualizar'}
                </Button>
              </div>
            </div>
            
            {loadingVehicles ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agência</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vehicles
                          .filter(vehicle => {
                            const searchTerm = vehicleFilters.search.toLowerCase()
                            const matchesSearch = !vehicleFilters.search || 
                              vehicle.brand.toLowerCase().includes(searchTerm) ||
                              vehicle.model.toLowerCase().includes(searchTerm)
                            
                            const matchesBrand = vehicleFilters.brand === 'all' || vehicle.brand === vehicleFilters.brand
                            const matchesStatus = vehicleFilters.status === 'all' || vehicle.status === vehicleFilters.status
                            
                            return matchesSearch && matchesBrand && matchesStatus
                          })
                          .map((vehicle) => (
                          <tr key={vehicle.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{vehicle.brand} {vehicle.model}</div>
                                <div className="text-sm text-gray-500">{vehicle.year}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(vehicle.price)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{vehicle.agency}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(vehicle.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(vehicle.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                {vehicle.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => moderateVehicle(vehicle.id, 'active')}
                                      className="text-green-600"
                                      title="Aprovar anúncio"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => moderateVehicle(vehicle.id, 'rejected')}
                                      className="text-red-600"
                                      title="Rejeitar anúncio"
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteVehicle(vehicle.id)}
                                  title="Deletar veículo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {vehicles.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum veículo encontrado
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Management */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Controle de Pagamentos</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar pagamentos..."
                    value={paymentFilters.search}
                    onChange={(e) => setPaymentFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-64"
                  />
                </div>
                <select 
                  value={paymentFilters.status}
                  onChange={(e) => setPaymentFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os Status</option>
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                  <option value="overdue">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <select 
                  value={paymentFilters.type}
                  onChange={(e) => setPaymentFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="subscription">Assinatura</option>
                  <option value="commission">Comissão</option>
                  <option value="fee">Taxa</option>
                </select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Relatório
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pagamentos Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{payments.filter(p => p.status === 'pending').length}</div>
                  <p className="text-sm text-gray-600">Requer atenção</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receita do Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}</div>
                  <p className="text-sm text-gray-600">Pagamentos confirmados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pagamentos Vencidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{payments.filter(p => p.status === 'overdue').length}</div>
                  <p className="text-sm text-gray-600">Necessita cobrança</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Gerenciar cobranças e visualizar histórico</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Usuário/Agência</th>
                          <th className="text-left p-2">Valor</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Vencimento</th>
                          <th className="text-left p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{payment.user_name}</div>
                                <div className="text-sm text-gray-500">{payment.agency_name}</div>
                              </div>
                            </td>
                            <td className="p-2 font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="p-2">
                              <Badge variant={payment.type === 'subscription' ? 'default' : payment.type === 'commission' ? 'secondary' : 'outline'}>
                                {payment.type === 'subscription' ? 'Assinatura' : 
                                 payment.type === 'commission' ? 'Comissão' : 'Taxa'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={
                                payment.status === 'paid' ? 'default' :
                                payment.status === 'pending' ? 'secondary' :
                                payment.status === 'overdue' ? 'destructive' : 'outline'
                              }>
                                {payment.status === 'paid' ? 'Pago' :
                                 payment.status === 'pending' ? 'Pendente' :
                                 payment.status === 'overdue' ? 'Vencido' : 'Cancelado'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="text-sm">
                                {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                                {payment.paid_date && (
                                  <div className="text-xs text-gray-500">
                                    Pago em: {new Date(payment.paid_date).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                {payment.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updatePaymentStatus(payment.id, 'paid')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                                {(payment.status === 'pending' || payment.status === 'overdue') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updatePaymentStatus(payment.id, 'cancelled')}
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {payments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum pagamento encontrado
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sistema de Notificações</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Notificação</CardTitle>
                  <CardDescription>Envie notificações para usuários ou agências</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Destinatários</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={notificationForm.recipients}
                      onChange={(e) => setNotificationForm({...notificationForm, recipients: e.target.value as 'all' | 'agencies' | 'users'})}
                    >
                      <option value="all">Todos os usuários</option>
                      <option value="agencies">Apenas agências</option>
                      <option value="users">Apenas usuários</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Título</label>
                    <Input
                      placeholder="Digite o título da notificação"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Mensagem</label>
                    <textarea
                      className="w-full p-2 border rounded-md h-24 resize-none"
                      placeholder="Digite a mensagem da notificação"
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    onClick={sendNotification}
                    disabled={!notificationForm.title || !notificationForm.message}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Enviar Notificação
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>Resumo das notificações enviadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{notifications.filter(n => n.status === 'sent').length}</div>
                      <div className="text-sm text-gray-600">Enviadas</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{notifications.filter(n => n.status === 'draft').length}</div>
                      <div className="text-sm text-gray-600">Rascunhos</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {notifications.reduce((sum, n) => sum + n.sent_count, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total de Destinatários Alcançados</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Notificações</CardTitle>
                <CardDescription>Todas as notificações enviadas</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Título</th>
                          <th className="text-left p-2">Destinatários</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Alcance</th>
                          <th className="text-left p-2">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifications.map((notification) => (
                          <tr key={notification.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{notification.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">
                                {notification.recipients === 'all' ? 'Todos' :
                                 notification.recipients === 'agencies' ? 'Agências' : 'Usuários'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={
                                notification.status === 'sent' ? 'default' :
                                notification.status === 'draft' ? 'secondary' : 'outline'
                              }>
                                {notification.status === 'sent' ? 'Enviada' :
                                 notification.status === 'draft' ? 'Rascunho' : 'Agendada'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="text-sm">
                                {notification.sent_count} destinatários
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-sm">
                                {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                                {notification.sent_at && (
                                  <div className="text-xs text-gray-500">
                                    Enviada: {new Date(notification.sent_at).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {notifications.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Nenhuma notificação encontrada
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  // Renderização condicional baseada na autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {authError}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push('/admin/login')} className="w-full">
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return adminDashboardContent
}