"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, Calculator, Car, User, CheckCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useFipe } from "@/hooks/use-fipe"
import { salvarSimulacao, type SimulacaoData } from "@/lib/supabase/simulacoes"

interface StepData {
  // Dados pessoais
  tipoDocumento: "pf" | "pj"
  cpfCnpj: string
  nomeCompleto: string
  email: string
  telefone: string
  
  // Dados do veículo
  veiculoId?: string  // ID do veículo específico (opcional)
  placa: string
  condicaoVeiculo: "0km" | "seminovo"
  tipoVeiculo: string
  marca: string
  marcaCodigo: string
  modelo: string
  modeloCodigo: string
  anoModelo: string
  anoFabricacao: string
  anoCodigo: string
  versao: string
  transmissao: string
  combustivel: string
  codigoFipe: string
  valorVeiculo: string
  entrada: string
  prazo: string
  
  // Para concluir
  tempoFechamento: string
  viuPessoalmente: "sim" | "nao"
  tipoVendedor: string
  
  // Resultado
  valorFinanciado: number
  valorParcela: number
  taxaJuros: number
  aprovado: boolean
}

const steps = [
  { id: 1, title: "Dados pessoais", icon: User },
  { id: 2, title: "Dados do veículo", icon: Car },
  { id: 3, title: "Para concluir", icon: Calculator },
  { id: 4, title: "Resultado", icon: CheckCircle },
]

export default function SimuladorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [salvandoSimulacao, setSalvandoSimulacao] = useState(false)
  const [simulacaoSalva, setSimulacaoSalva] = useState(false)
  const [formData, setFormData] = useState<StepData>({
    tipoDocumento: "pf",
    cpfCnpj: "",
    nomeCompleto: "",
    email: "",
    telefone: "",
    placa: "",
    condicaoVeiculo: "0km",
    tipoVeiculo: "carro",
    marca: "",
    marcaCodigo: "",
    modelo: "",
    modeloCodigo: "",
    anoModelo: "",
    anoFabricacao: "",
    anoCodigo: "",
    versao: "",
    transmissao: "",
    combustivel: "",
    codigoFipe: "",
    valorVeiculo: "",
    entrada: "",
    prazo: "48",
    tempoFechamento: "",
    viuPessoalmente: "nao",
    tipoVendedor: "",
    valorFinanciado: 0,
    valorParcela: 0,
    taxaJuros: 1.99,
    aprovado: true,
  })

  // Estado para armazenar o ID do veículo específico
  const [veiculoId, setVeiculoId] = useState<string | null>(null)

  const supabase = createClient()

  // Hook FIPE
  const {
    data: fipeData,
    loading: fipeLoading,
    errors: fipeErrors,
    selectedMarca,
    selectedModelo,
    selectedAno,
    handleMarcaChange,
    handleModeloChange,
    handleAnoChange,
    buscarPreco,
    mapearCombustivelFipe,
  } = useFipe({ 
    tipoVeiculo: formData.tipoVeiculo,
    enableCache: true 
  })

  // Capturar parâmetros da URL para pré-preencher dados do veículo
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const veiculoId = urlParams.get('veiculo')
    const marca = urlParams.get('marca')
    const modelo = urlParams.get('modelo')
    const ano = urlParams.get('ano')
    const preco = urlParams.get('preco')
    const combustivel = urlParams.get('combustivel')
    const cambio = urlParams.get('cambio')
    const cor = urlParams.get('cor')
    const quilometragem = urlParams.get('km')
    const tipoVeiculo = urlParams.get('tipo')
    const titulo = urlParams.get('titulo')

    if (veiculoId && marca && modelo && ano && preco) {
      console.log("🚗 [SIMULADOR] Dados completos do veículo recebidos via URL:", { 
        veiculoId, marca, modelo, ano, preco, combustivel, cambio, cor, quilometragem, tipoVeiculo, titulo 
      })

      // Armazenar o ID do veículo para usar na simulação
      setVeiculoId(veiculoId)
      
      const valorFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
      }).format(Number(preco))

      // Usar transmissão do veículo ou detectar automaticamente
      const transmissaoFinal = cambio || detectarTransmissao(marca, modelo, Number(ano))

      // Determinar condição do veículo baseado no ano e quilometragem
      let condicaoVeiculo: "0km" | "seminovo" = "seminovo"
      const kmAtual = Number(quilometragem) || 0
      const anoAtual = Number(ano)
      
      if (anoAtual >= 2024 && kmAtual < 1000) {
        condicaoVeiculo = "0km"
      } else if (anoAtual >= 2023 && kmAtual < 5000) {
        condicaoVeiculo = "0km"
      }

      setFormData(prev => ({
        ...prev,
        // Dados básicos
        marca: marca,
        modelo: modelo,
        anoModelo: ano,
        anoFabricacao: ano,
        valorVeiculo: valorFormatado,
        
        // Dados específicos do veículo
        tipoVeiculo: tipoVeiculo || "carro",
        combustivel: combustivel || "",
        transmissao: transmissaoFinal,
        condicaoVeiculo: condicaoVeiculo,
        
        // Dados adicionais para contexto
        versao: titulo || `${marca} ${modelo} ${ano}`,
      }))



      // Ir direto para o step 2 (dados do veículo) se tiver dados
      setCurrentStep(2)
      
      toast({
        title: "Veículo carregado automaticamente!",
        description: `${marca} ${modelo} ${ano} - ${valorFormatado}`,
        duration: 4000,
      })

      // Toast adicional com detalhes técnicos se disponíveis
      if (combustivel || cambio) {
        setTimeout(() => {
          toast({
            title: "Dados técnicos aplicados",
            description: `${combustivel ? `Combustível: ${combustivel}` : ''}${combustivel && cambio ? ' • ' : ''}${cambio ? `Câmbio: ${cambio}` : ''}`,
            duration: 3000,
          })
        }, 1500)
      }
    }
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      setLoadingUserData(true)
      
      try {
        console.log("🔍 [SIMULADOR] Iniciando carregamento do usuário...")
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("❌ [SIMULADOR] Erro ao buscar usuário:", error)
          // Se for erro de sessão ausente, redirecionar para página de login
          if (error.message?.includes('Auth session missing')) {
            console.log("🔄 [SIMULADOR] Sessão ausente, redirecionando para página de login")
            router.push("/login")
            return
          }
          return
        }
        
        if (user) {
          console.log("✅ [SIMULADOR] Usuário encontrado:", user.email)
          setCurrentUser(user)
          
          // Buscar dados do perfil do usuário
          try {
            console.log("🔍 [SIMULADOR] Buscando perfil para userId:", user.id)
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            console.log("📋 [SIMULADOR] Resultado da busca do perfil:", { profile, profileError })

            if (profile && !profileError) {
              console.log("✅ [SIMULADOR] Perfil encontrado:", {
                nome_completo: profile.nome_completo,
                cpf: profile.cpf,
                whatsapp: profile.whatsapp,
                email: profile.email
              })
              
              // Pré-preencher formulário com dados do perfil (formatados)
              const formDataPreenchido = {
                nomeCompleto: profile.nome_completo || "",
                email: user.email || profile.email || "",
                cpfCnpj: profile.cpf ? formatCPF(profile.cpf) : "",
                telefone: profile.whatsapp ? formatPhone(profile.whatsapp) : "",
              }
              
              console.log("📝 [SIMULADOR] Preenchendo formulário com:", formDataPreenchido)
              setFormData(prev => ({
                ...prev,
                ...formDataPreenchido
              }))
              
              toast({
                title: "Dados carregados!",
                description: "Seus dados foram preenchidos automaticamente",
              })
            } else {
              console.log("ℹ️ [SIMULADOR] Perfil não encontrado ou erro:", profileError)
              // Se não tem perfil, apenas pré-preencher o email
              setFormData(prev => ({
                ...prev,
                email: user.email || "",
              }))
              console.log("📝 [SIMULADOR] Preenchendo apenas email:", user.email)
            }
          } catch (error) {
            console.error("❌ [SIMULADOR] Erro ao buscar perfil:", error)
            // Em caso de erro, pelo menos preencher o email
            setFormData(prev => ({
              ...prev,
              email: user.email || "",
            }))
          }
        } else {
          console.log("ℹ️ [SIMULADOR] Usuário não está logado")
          // Redirecionar para a página de login se não estiver logado
          router.push("/login")
          return
        }
      } catch (error) {
        console.error("❌ [SIMULADOR] Erro ao carregar usuário:", error)
        // Se for erro de sessão ausente, redirecionar para página de login
         if (error instanceof Error && error.message?.includes('Auth session missing')) {
           console.log("🔄 [SIMULADOR] Sessão ausente, redirecionando para página de login")
           router.push("/login")
           return
         }
      } finally {
        setLoadingUserData(false)
        console.log("✅ [SIMULADOR] Carregamento do usuário finalizado")
      }
    }
    
    loadUser()
  }, [supabase, toast])

  // Aplicar dados FIPE quando seleção for completada
  useEffect(() => {
    if (selectedMarca && selectedModelo && selectedAno) {
      buscarPreco(selectedMarca, selectedModelo, selectedAno)
    }
  }, [selectedMarca, selectedModelo, selectedAno, buscarPreco])

  // Função para detectar transmissão automaticamente
  const detectarTransmissao = (marca: string, modelo: string, ano: number) => {
    const marcaLower = marca.toLowerCase()
    const modeloLower = modelo.toLowerCase()
    
    // Carros que são tradicionalmente automáticos
    const marcasLuxo = ['bmw', 'mercedes', 'audi', 'volvo', 'lexus', 'infiniti', 'cadillac']
    const modelosAutomaticos = [
      'corolla', 'civic', 'accord', 'camry', 'altima', 'fusion', 'malibu',
      'jetta', 'passat', 'tiguan', 'touareg', 'cayenne', 'macan',
      'x1', 'x3', 'x5', 'serie 3', 'serie 5', 'classe a', 'classe c', 'classe e',
      'cr-v', 'hr-v', 'pilot', 'odyssey', 'ridgeline',
      'rav4', 'highlander', 'sienna', 'prius', 'camry hybrid'
    ]
    
    // Carros que geralmente são manuais (principalmente populares e esportivos básicos)
    const modelosManuais = [
      'gol', 'fox', 'polo', 'up', 'voyage', 'saveiro',
      'onix', 'prisma', 'cobalt', 'spin', 'montana',
      'hb20', 'hb20s', 'creta', 'tucson',
      'fiesta', 'ka', 'ecosport', 'focus',
      'sandero', 'logan', 'duster', 'captur',
      'uno', 'argo', 'cronos', 'toro', 'mobi',
      'etios', 'yaris'
    ]
    
    // Lógica de detecção
    if (ano >= 2018) {
      // Carros mais novos tendem a ser automáticos
      if (marcasLuxo.includes(marcaLower)) return 'Automático'
      if (modelosAutomaticos.some(m => modeloLower.includes(m))) return 'Automático'
      if (modelosManuais.some(m => modeloLower.includes(m))) return 'Manual'
      return 'Automático' // Default para carros novos
    } else if (ano >= 2010) {
      // Carros intermediários - mix
      if (marcasLuxo.includes(marcaLower)) return 'Automático'
      if (modelosAutomaticos.some(m => modeloLower.includes(m))) return 'Automático'
      if (modelosManuais.some(m => modeloLower.includes(m))) return 'Manual'
      return 'Manual' // Default para carros intermediários
    } else {
      // Carros mais antigos tendem a ser manuais
      if (marcasLuxo.includes(marcaLower) && ano >= 2005) return 'Automático'
      return 'Manual' // Default para carros antigos
    }
  }

  // Aplicar dados FIPE ao formulário quando preço for encontrado
  useEffect(() => {
    if (fipeData.precoFipe) {
      const valorFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
      }).format(fipeData.valorFipe)

      // Detectar transmissão automaticamente
      const transmissaoDetectada = detectarTransmissao(
        fipeData.precoFipe.brand,
        fipeData.precoFipe.model,
        fipeData.precoFipe.modelYear
      )

      setFormData(prev => ({
        ...prev,
        marca: fipeData.precoFipe!.brand,
        marcaCodigo: selectedMarca!,
        modelo: fipeData.precoFipe!.model,
        modeloCodigo: selectedModelo!,
        anoModelo: fipeData.precoFipe!.modelYear.toString(),
        anoFabricacao: fipeData.precoFipe!.modelYear.toString(),
        anoCodigo: selectedAno!,
        combustivel: mapearCombustivelFipe(fipeData.precoFipe!.fuel),
        codigoFipe: fipeData.precoFipe!.codeFipe,
        valorVeiculo: valorFormatado,
        transmissao: transmissaoDetectada,
      }))
      
      toast({
        title: "Dados FIPE aplicados!",
        description: `Veículo: ${fipeData.precoFipe!.brand} ${fipeData.precoFipe!.model} - Transmissão: ${transmissaoDetectada}`,
      })
    }
  }, [fipeData.precoFipe, fipeData.valorFipe, selectedMarca, selectedModelo, selectedAno, mapearCombustivelFipe, toast])

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(Number(numbers))
    return formatted
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const handleInputChange = (field: keyof StepData, value: string) => {
    if (field === "cpfCnpj") {
      const formatted = formData.tipoDocumento === "pf" ? formatCPF(value) : formatCNPJ(value)
      setFormData(prev => ({ ...prev, [field]: formatted }))
    } else if (field === "telefone") {
      setFormData(prev => ({ ...prev, [field]: formatPhone(value) }))
    } else if (field === "valorVeiculo" || field === "entrada") {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const calcularSimulacao = async () => {
    const valorVeiculo = Number(formData.valorVeiculo.replace(/\D/g, ""))
    const entrada = Number(formData.entrada.replace(/\D/g, ""))
    const prazo = Number(formData.prazo)
    const taxaMensal = formData.taxaJuros / 100

    const valorFinanciado = valorVeiculo - entrada
    const valorParcela = valorFinanciado * (taxaMensal / (1 - Math.pow(1 + taxaMensal, -prazo)))

    // Simular aprovação baseada em critérios
    const aprovado = valorFinanciado > 0 && valorFinanciado < 200000 && formData.cpfCnpj.length > 10

    // Atualizar dados do formulário
    const dadosAtualizados = {
      ...formData,
      valorFinanciado,
      valorParcela,
      aprovado,
    }

    setFormData(dadosAtualizados)
    
    // Resetar estado de simulação salva ao recalcular
    setSimulacaoSalva(false)
  }

  const salvarSimulacaoNoBanco = async (dados: StepData) => {
    try {
      setSalvandoSimulacao(true)
      console.log('💾 [SIMULADOR] Iniciando salvamento da simulação...')

      // Preparar dados para salvamento
      const dadosSimulacao: SimulacaoData = {
        veiculoId: veiculoId || undefined,  // Incluir ID do veículo se disponível
        tipoDocumento: dados.tipoDocumento,
        cpfCnpj: dados.cpfCnpj,
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        telefone: dados.telefone,
        placa: dados.placa,
        condicaoVeiculo: dados.condicaoVeiculo,
        tipoVeiculo: dados.tipoVeiculo,
        marca: dados.marca,
        marcaCodigo: dados.marcaCodigo,
        modelo: dados.modelo,
        modeloCodigo: dados.modeloCodigo,
        anoModelo: dados.anoModelo,
        anoFabricacao: dados.anoFabricacao,
        anoCodigo: dados.anoCodigo,
        versao: dados.versao,
        transmissao: dados.transmissao,
        combustivel: dados.combustivel,
        codigoFipe: dados.codigoFipe,
        valorVeiculo: dados.valorVeiculo,
        entrada: dados.entrada,
        prazo: dados.prazo,
        tempoFechamento: dados.tempoFechamento,
        viuPessoalmente: dados.viuPessoalmente,
        tipoVendedor: dados.tipoVendedor,
        valorFinanciado: dados.valorFinanciado,
        valorParcela: dados.valorParcela,
        taxaJuros: dados.taxaJuros,
        aprovado: dados.aprovado
      }

      const { data, error } = await salvarSimulacao(dadosSimulacao)

      if (error) {
        console.error('❌ [SIMULADOR] Erro ao salvar simulação:', error)
        toast({
          variant: "destructive",
          title: "Erro ao salvar simulação",
          description: "Não foi possível salvar a simulação. Tente novamente.",
        })
        return false
      } else {
        console.log('✅ [SIMULADOR] Simulação salva com sucesso:', data?.id)
        toast({
          title: "Simulação salva com sucesso!",
          description: "Sua simulação foi salva e pode ser consultada a qualquer momento.",
        })
        setSimulacaoSalva(true)
        return true
      }
    } catch (error) {
      console.error('❌ [SIMULADOR] Erro inesperado ao salvar:', error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar simulação",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      })
      return false
    } finally {
      setSalvandoSimulacao(false)
    }
  }

  const handleSalvarSimulacao = async () => {
    const sucesso = await salvarSimulacaoNoBanco(formData)
    if (sucesso) {
      // Ação adicional se necessário
    }
  }

  const nextStep = async () => {
    if (currentStep < 4) {
      if (currentStep === 3) {
        await calcularSimulacao()
      }
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.cpfCnpj && formData.nomeCompleto && formData.email && formData.telefone
      case 2:
        // Verificar se temos dados pré-carregados OU seleção via FIPE
        const temDadosPreCarregados = formData.marca && formData.modelo && formData.anoModelo
        const temSelecaoFipe = selectedMarca && selectedModelo && selectedAno
        return (temDadosPreCarregados || temSelecaoFipe) && formData.valorVeiculo && formData.entrada && formData.prazo
      case 3:
        return formData.tempoFechamento && formData.viuPessoalmente && formData.tipoVendedor
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-4 block">Tipo de documento</Label>
              <RadioGroup
                value={formData.tipoDocumento}
                onValueChange={(value: "pf" | "pj") => handleInputChange("tipoDocumento", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-500 flex-1">
                  <RadioGroupItem value="pf" id="pf" />
                  <Label htmlFor="pf" className="cursor-pointer flex-1">Pessoa Física</Label>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-500 flex-1">
                  <RadioGroupItem value="pj" id="pj" />
                  <Label htmlFor="pj" className="cursor-pointer flex-1">Pessoa Jurídica</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpfCnpj" className="text-sm font-medium text-gray-700">
                  {formData.tipoDocumento === "pf" ? "CPF" : "CNPJ"}
                </Label>
                <Input
                  id="cpfCnpj"
                  type="text"
                  value={formData.cpfCnpj}
                  onChange={(e) => handleInputChange("cpfCnpj", e.target.value)}
                  placeholder={loadingUserData ? "Carregando..." : formData.tipoDocumento === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                  maxLength={formData.tipoDocumento === "pf" ? 14 : 18}
                  disabled={loadingUserData}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nomeCompleto" className="text-sm font-medium text-gray-700">
                  {formData.tipoDocumento === "pf" ? "Nome completo" : "Razão social"}
                </Label>
                <Input
                  id="nomeCompleto"
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                  placeholder={loadingUserData ? "Carregando..." : "Digite seu nome completo"}
                  disabled={loadingUserData}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={loadingUserData ? "Carregando..." : "seu@email.com"}
                  disabled={loadingUserData}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                                          placeholder={loadingUserData ? "Carregando..." : "(73) 99999-9999"}
                  maxLength={15}
                  disabled={loadingUserData}
                  className="mt-1"
                />
              </div>
            </div>

            {loadingUserData && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando seus dados automaticamente...
              </div>
            )}

            {!loadingUserData && formData.nomeCompleto && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Dados carregados automaticamente do seu perfil
                </p>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {/* Indicador de veículo pré-carregado */}
            {formData.marca && formData.modelo && formData.anoModelo && formData.valorVeiculo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Veículo Pré-selecionado</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-700">
                  <div><strong>Marca:</strong> {formData.marca}</div>
                  <div><strong>Modelo:</strong> {formData.modelo}</div>
                  <div><strong>Ano:</strong> {formData.anoModelo}</div>
                  <div><strong>Valor:</strong> {formData.valorVeiculo}</div>
                  {formData.combustivel && <div><strong>Combustível:</strong> {formData.combustivel}</div>}
                  {formData.transmissao && <div><strong>Transmissão:</strong> {formData.transmissao}</div>}
                  {formData.tipoVeiculo && <div><strong>Tipo:</strong> {formData.tipoVeiculo}</div>}
                  {formData.condicaoVeiculo && <div><strong>Condição:</strong> {formData.condicaoVeiculo}</div>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-green-600">
                    ✅ Dados carregados automaticamente. Você pode alterar qualquer informação se necessário.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        marca: "",
                        modelo: "",
                        anoModelo: "",
                        anoFabricacao: "",
                        combustivel: "",
                        valorVeiculo: "",
                        transmissao: "",
                        versao: "",
                      }))
                      toast({
                        title: "Dados limpos",
                        description: "Agora você pode usar a busca FIPE normal",
                      })
                    }}
                    className="text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    Usar busca FIPE
                  </Button>
                </div>
              </div>
            )}

            {/* Aviso sobre API FIPE */}
            {!formData.marca && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Consulta Tabela FIPE</span>
                </div>
                <p className="text-xs text-blue-700">
                  Selecione o tipo, marca, modelo e ano para consultar automaticamente os dados oficiais da tabela FIPE. 
                  Os valores serão preenchidos automaticamente para uma simulação mais precisa.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="placa" className="text-sm font-medium text-gray-700">Placa (opcional)</Label>
                <Input
                  id="placa"
                  type="text"
                  value={formData.placa}
                  onChange={(e) => handleInputChange("placa", e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Condição do veículo</Label>
                <RadioGroup
                  value={formData.condicaoVeiculo}
                  onValueChange={(value: "0km" | "seminovo") => handleInputChange("condicaoVeiculo", value)}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-3 bg-white border border-gray-300 rounded-md px-3 py-2 cursor-pointer hover:border-orange-500 transition-colors h-10">
                    <RadioGroupItem value="0km" id="0km" />
                    <Label htmlFor="0km" className="cursor-pointer flex-1 font-medium text-gray-900">
                      0km
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 bg-white border border-gray-300 rounded-md px-3 py-2 cursor-pointer hover:border-orange-500 transition-colors h-10">
                    <RadioGroupItem value="seminovo" id="seminovo" />
                    <Label htmlFor="seminovo" className="cursor-pointer flex-1 font-medium text-gray-900">
                      Seminovo
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipoVeiculo" className="text-sm font-medium text-gray-700">Tipo de Veículo</Label>
                <select
                  id="tipoVeiculo"
                  title="Tipo de Veículo"
                  value={formData.tipoVeiculo}
                  onChange={(e) => {
                    handleInputChange("tipoVeiculo", e.target.value)
                    // Resetar seleções FIPE
                    setFormData(prev => ({
                      ...prev,
                      marca: "",
                      marcaCodigo: "",
                      modelo: "",
                      modeloCodigo: "",
                      anoModelo: "",
                      anoFabricacao: "",
                      anoCodigo: "",
                      combustivel: "",
                      codigoFipe: "",
                      valorVeiculo: "",
                    }))
                  }}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                  <option value="caminhao">Caminhão</option>
                </select>
              </div>

              <div>
                <Label htmlFor="marca" className="text-sm font-medium text-gray-700">Marca</Label>
                {formData.marca ? (
                  <Input
                    id="marca"
                    type="text"
                    value={formData.marca}
                    onChange={(e) => handleInputChange("marca", e.target.value)}
                    className="mt-1 bg-green-50 border-green-300"
                    placeholder="Marca do veículo"
                  />
                ) : (
                  <select
                    id="marca"
                    title="Marca"
                    value={selectedMarca || ""}
                    onChange={(e) => handleMarcaChange(e.target.value)}
                    disabled={fipeLoading.marcas || fipeData.marcas.length === 0}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {fipeLoading.marcas ? "Carregando marcas..." : "Selecione uma marca"}
                    </option>
                    {fipeData.marcas.map((marca) => (
                      <option key={marca.code} value={marca.code}>
                        {marca.name}
                      </option>
                    ))}
                  </select>
                )}
                {fipeErrors.marcas && (
                  <p className="text-red-500 text-xs mt-1">{fipeErrors.marcas}</p>
                )}
              </div>

              <div>
                <Label htmlFor="modelo" className="text-sm font-medium text-gray-700">Modelo</Label>
                {formData.modelo ? (
                  <Input
                    id="modelo"
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => handleInputChange("modelo", e.target.value)}
                    className="mt-1 bg-green-50 border-green-300"
                    placeholder="Modelo do veículo"
                  />
                ) : (
                  <select
                    id="modelo"
                    title="Modelo"
                    value={selectedModelo || ""}
                    onChange={(e) => handleModeloChange(e.target.value)}
                    disabled={fipeLoading.modelos || !selectedMarca || fipeData.modelos.length === 0}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {!selectedMarca ? "Selecione uma marca primeiro" :
                       fipeLoading.modelos ? "Carregando modelos..." : "Selecione um modelo"}
                    </option>
                    {fipeData.modelos.map((modelo) => (
                      <option key={modelo.code} value={modelo.code}>
                        {modelo.name}
                      </option>
                    ))}
                  </select>
                )}
                {fipeErrors.modelos && (
                  <p className="text-red-500 text-xs mt-1">{fipeErrors.modelos}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anoModelo" className="text-sm font-medium text-gray-700">Ano do Veículo</Label>
                {formData.anoModelo ? (
                  <Input
                    id="anoModelo"
                    type="text"
                    value={`${formData.anoModelo}${formData.combustivel ? ` - ${formData.combustivel}` : ''}`}
                    onChange={(e) => {
                      const valor = e.target.value.split(' - ')[0] // Pegar apenas o ano
                      handleInputChange("anoModelo", valor)
                      handleInputChange("anoFabricacao", valor)
                    }}
                    className="mt-1 bg-green-50 border-green-300"
                    placeholder="Ano do veículo"
                  />
                ) : (
                  <select
                    id="anoModelo"
                    title="Ano/Combustível FIPE"
                    value={selectedAno || ""}
                    onChange={(e) => handleAnoChange(e.target.value)}
                    disabled={fipeLoading.anos || !selectedModelo || fipeData.anos.length === 0}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {!selectedModelo ? "Selecione um modelo primeiro" :
                       fipeLoading.anos ? "Carregando anos..." : "Selecione o ano"}
                    </option>
                    {fipeData.anos.map((ano) => (
                      <option key={ano.code} value={ano.code}>
                        {ano.name}
                      </option>
                    ))}
                  </select>
                )}
                {fipeErrors.anos && (
                  <p className="text-red-500 text-xs mt-1">{fipeErrors.anos}</p>
                )}
              </div>

              <div>
                <Label htmlFor="transmissao" className="text-sm font-medium text-gray-700">Transmissão</Label>
                <select
                  id="transmissao"
                  title="Transmissão"
                  value={formData.transmissao}
                  onChange={(e) => handleInputChange("transmissao", e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Selecione</option>
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>
            </div>

            {/* Informações FIPE e preço */}
            {fipeData.precoFipe && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Dados FIPE aplicados</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-700">
                  <div><strong>Marca:</strong> {fipeData.precoFipe.brand}</div>
                  <div><strong>Modelo:</strong> {fipeData.precoFipe.model}</div>
                  <div><strong>Ano:</strong> {fipeData.precoFipe.modelYear}</div>
                  <div><strong>Combustível:</strong> {fipeData.precoFipe.fuel}</div>
                  <div><strong>Código FIPE:</strong> {fipeData.precoFipe.codeFipe}</div>
                  <div><strong>Valor FIPE:</strong> R$ {fipeData.valorFipe.toLocaleString('pt-BR')}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="combustivel" className="text-sm font-medium text-gray-700">Combustível (FIPE)</Label>
                <Input
                  id="combustivel"
                  type="text"
                  value={formData.combustivel}
                  onChange={(e) => handleInputChange("combustivel", e.target.value)}
                  placeholder="Será preenchido automaticamente pela FIPE"
                  disabled={!!fipeData.precoFipe}
                  className="mt-1 disabled:bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="valorVeiculo" className="text-sm font-medium text-gray-700">Valor</Label>
                <Input
                  id="valorVeiculo"
                  type="text"
                  value={formData.valorVeiculo}
                  onChange={(e) => handleInputChange("valorVeiculo", formatCurrency(e.target.value))}
                  placeholder="R$ 39.356"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entrada" className="text-sm font-medium text-gray-700">Valor da entrada</Label>
                <Input
                  id="entrada"
                  type="text"
                  value={formData.entrada}
                  onChange={(e) => handleInputChange("entrada", formatCurrency(e.target.value))}
                  placeholder="R$ 10.000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="prazo" className="text-sm font-medium text-gray-700">Prazo de financiamento</Label>
                <select
                  id="prazo"
                  title="Prazo de financiamento"
                  value={formData.prazo}
                  onChange={(e) => handleInputChange("prazo", e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                  <option value="60">60 meses</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Finalize sua simulação e garanta as <span className="text-blue-600">melhores opções de financiamento!</span></h3>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">Em quanto tempo você pretende fechar negócio?</Label>
                  <select
                    title="Tempo para fechar negócio"
                    value={formData.tempoFechamento}
                    onChange={(e) => handleInputChange("tempoFechamento", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Estou apenas pesquisando</option>
                    <option value="imediato">Imediatamente</option>
                    <option value="1-semana">Até 1 semana</option>
                    <option value="1-mes">Até 1 mês</option>
                    <option value="3-meses">Até 3 meses</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">Você já viu pessoalmente o veículo que deseja comprar?</Label>
                  <RadioGroup
                    value={formData.viuPessoalmente}
                    onValueChange={(value: "sim" | "nao") => handleInputChange("viuPessoalmente", value)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-500">
                      <RadioGroupItem value="sim" id="viu-sim" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="viu-sim" className="cursor-pointer font-medium">Sim, já vi o veículo pessoalmente.</Label>
                        <p className="text-sm text-gray-500 mt-1">Visto em loja/concessionária ou direto com o proprietário</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-500">
                      <RadioGroupItem value="nao" id="viu-nao" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="viu-nao" className="cursor-pointer font-medium">Não vi o veículo pessoalmente.</Label>
                        <p className="text-sm text-gray-500 mt-1">Visto apenas por foto ou anúncio na internet</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">Já sabe de quem você pretende comprar seu veículo?</Label>
                  <select
                    title="Tipo de vendedor"
                    value={formData.tipoVendedor}
                    onChange={(e) => handleInputChange("tipoVendedor", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecione o tipo de vendedor</option>
                    <option value="direto-proprietario">Direto com o proprietário</option>
                    <option value="concessionaria">Concessionária</option>
                    <option value="loja-seminovos">Loja de seminovos</option>
                    <option value="ainda-nao-sei">Ainda não sei</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        if (!formData.aprovado) {
          return (
            <div className="space-y-6 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-center mb-6">
                  <Car className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ops! Não foi possível aprovar o financiamento.</h3>
                  <p className="text-gray-600">Não desanime! Ainda há alternativas para você.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Button 
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 flex-1"
                  >
                    Tentar com outro CPF
                  </Button>
                  <Button 
                    onClick={() => router.push("/planos")}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    Conheça a Assinatura
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div className="space-y-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simulação Concluída!</h3>
              <p className="text-gray-600 mb-4">Veja as condições especiais que conseguimos para você</p>
              
              {/* Dica sobre o sistema de salvamento */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700 text-center">
                  💡 <strong>Dica:</strong> Teste diferentes valores à vontade! Você só salva quando quiser.
                </p>
              </div>
              
              {/* Indicador de salvamento */}
              {salvandoSimulacao && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Salvando simulação...</span>
                  </div>
                </div>
              )}
              
              {/* Indicador de simulação salva */}
              {simulacaoSalva && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Simulação salva com sucesso!</span>
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 min-h-[70px] flex flex-col justify-center">
                    <div className="text-xs text-gray-600 mb-1">Valor Financiado</div>
                    <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.valorFinanciado)}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3 sm:p-4 min-h-[70px] flex flex-col justify-center">
                    <div className="text-xs text-gray-600 mb-1">Valor da Parcela</div>
                    <div className="text-base font-bold text-orange-600 whitespace-nowrap">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.valorParcela)}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 min-h-[70px] flex flex-col justify-center">
                    <div className="text-xs text-gray-600 mb-1">Taxa de Juros</div>
                    <div className="text-sm font-bold text-blue-600 whitespace-nowrap">{formData.taxaJuros}% a.m.</div>
                  </div>
                </div>
                
                <div className="border-t pt-4 text-center">
                  <div className="text-xs text-gray-600 mb-2">Prazo de financiamento</div>
                  <div className="text-sm font-semibold">{formData.prazo} parcelas mensais</div>
                </div>
                
                {/* Ajustar valores diretamente na tela de resultado */}
                <div className="border-t pt-4 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Quer testar outros valores? Ajuste aqui mesmo:
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entrada-result" className="text-sm font-medium text-gray-700">
                        Valor da Entrada
                      </Label>
                      <Input
                        id="entrada-result"
                        type="text"
                        value={formData.entrada}
                        onChange={(e) => {
                          const value = formatCurrency(e.target.value)
                          setFormData(prev => ({ ...prev, entrada: value }))
                          setSimulacaoSalva(false) // Marcar como não salva ao alterar
                        }}
                        placeholder="R$ 0,00"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="prazo-result" className="text-sm font-medium text-gray-700">
                        Prazo (meses)
                      </Label>
                      <Input
                        id="prazo-result"
                        type="number"
                        value={formData.prazo}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, prazo: e.target.value }))
                          setSimulacaoSalva(false) // Marcar como não salva ao alterar
                        }}
                        min="12"
                        max="72"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={calcularSimulacao}
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <Calculator className="h-4 w-4" />
                      Recalcular
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                {/* Botão Salvar Simulação */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Gostou do resultado? Salve sua simulação para consultar depois!
                  </p>
                  <Button 
                    onClick={handleSalvarSimulacao}
                    disabled={salvandoSimulacao || simulacaoSalva}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2 mx-auto"
                  >
                    {salvandoSimulacao ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : simulacaoSalva ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Simulação Salva
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4" />
                        Salvar Simulação
                      </>
                    )}
                  </Button>
                </div>
                

              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>

            </div>
            
            {/* Progress indicator for mobile */}
            <div className="md:hidden flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {currentStep}/4
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-orange-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Steps Desktop Only */}
            <div className="hidden md:flex items-center gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      step.id === currentStep
                        ? "bg-orange-500 text-white shadow-lg"
                        : step.id < currentStep
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {step.id}
                    </span>
                    <span className="hidden lg:inline">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Hero Image */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    Conquiste seu veículo com as{" "}
                    <span className="text-yellow-300">melhores condições</span>{" "}
                    de financiamento!
                  </h1>
                  <p className="text-orange-100 mb-6">
                    Simule agora e descubra como realizar o sonho do seu carro próprio
                  </p>
                  
                  {/* Benefícios */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-orange-100 text-sm">A única solução 100% digital</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Calculator className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-orange-100 text-sm">Melhores condições para você</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-orange-100 text-sm">3X mais chances de aprovação!</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="space-y-3 mt-6">
                    <Button 
                      onClick={() => router.push("/cadastro-veiculo")}
                      className="w-full bg-gradient-to-r from-white/20 to-white/30 hover:from-white/30 hover:to-white/40 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform py-3 relative overflow-hidden group"
                    >
                      <span className="relative z-10 font-medium">Anunciar Meu Veículo</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Button>
                    <Button 
                      onClick={() => router.push("/veiculos")}
                      variant="outline"
                      className="w-full bg-gradient-to-r from-white to-orange-50 hover:from-orange-50 hover:to-orange-100 text-orange-600 border-white hover:border-orange-200 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform py-3 relative overflow-hidden group"
                    >
                      <span className="relative z-10 font-medium">Ver Veículos Disponíveis</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex flex-col justify-center">
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {steps[currentStep - 1]?.title}
                  </h2>
                  <p className="text-gray-600">
                    {currentStep === 1 && "Preencha seus dados para começar a simulação"}
                    {currentStep === 2 && "Informe os dados do veículo que deseja financiar"}
                    {currentStep === 3 && "Revise as informações antes de calcular"}
                    {currentStep === 4 && "Sua simulação está pronta!"}
                  </p>
                </div>

                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                    >
                      {currentStep === 3 ? "Calcular" : "Próximo"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-50"
                    >
                      Nova Simulação
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Hero */}
        <div className="lg:hidden mt-8">
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl p-6 text-white text-center">
            <h1 className="text-xl font-bold mb-2">
              Conquiste seu veículo com as <span className="text-yellow-300">melhores condições</span>!
            </h1>
            <p className="text-orange-100 text-sm mb-4">
              Simule agora e descubra como realizar o sonho do seu carro próprio
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-center space-y-2">
                <p className="text-orange-100 text-xs">✓ 3X mais chances de aprovação</p>
                <p className="text-orange-100 text-xs">✓ 100% digital e rápido</p>
                <p className="text-orange-100 text-xs">✓ Melhores condições do mercado</p>
              </div>
            </div>
            
            {/* Botões de Ação Mobile */}
            <div className="space-y-2 mt-4">
              <Button 
                onClick={() => router.push("/cadastro-veiculo")}
                className="w-full bg-gradient-to-r from-white/20 to-white/30 hover:from-white/30 hover:to-white/40 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform py-2 text-sm relative overflow-hidden group"
              >
                <span className="relative z-10 font-medium">Anunciar Meu Veículo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
              <Button 
                onClick={() => router.push("/veiculos")}
                variant="outline"
                className="w-full bg-gradient-to-r from-white to-orange-50 hover:from-orange-50 hover:to-orange-100 text-orange-600 border-white hover:border-orange-200 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform py-2 text-sm relative overflow-hidden group"
              >
                <span className="relative z-10 font-medium">Ver Veículos Disponíveis</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}