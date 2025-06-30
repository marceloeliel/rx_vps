"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building2, Plus, X, Loader2, AlertCircle, CheckCircle, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { upsertAgencia, getAgenciaData, getAgenciaByCnpj, type DadosAgencia } from "@/lib/supabase/agencias-local"
import { LogoUpload } from "@/components/logo-upload-local"

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

interface BrasilApiCnpjResponse {
  cnpj: string
  identificador_matriz_filial: number
  descricao_matriz_filial: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  descricao_situacao_cadastral: string
  data_situacao_cadastral: string
  motivo_situacao_cadastral: number
  nome_cidade_exterior: string
  codigo_natureza_juridica: number
  data_inicio_atividade: string
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  descricao_tipo_logradouro: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  uf: string
  codigo_municipio: number
  municipio: string
  ddd_telefone_1: string
  ddd_telefone_2: string
  ddd_fax: string
  qualificacao_do_responsavel: number
  capital_social: number
  porte: string
  descricao_porte: string
  opcao_pelo_simples: boolean
  data_opcao_pelo_simples: string
  data_exclusao_do_simples: string
  opcao_pelo_mei: boolean
  situacao_especial: string
  data_situacao_especial: string
  qsa: Array<{
    identificador_de_socio: number
    nome_socio: string
    cnpj_cpf_do_socio: string
    codigo_qualificacao_socio: number
    percentual_capital_social: number
    data_entrada_sociedade: string
    cpf_representante_legal: string
    nome_representante_legal: string
    codigo_qualificacao_representante_legal: number
  }>
}

export default function CadastroAgenciaPage() {
  const [servicos, setServicos] = useState<string[]>([])
  const [novoServico, setNovoServico] = useState("")
  const [cepLoading, setCepLoading] = useState(false)
  const [cnpjLoading, setCnpjLoading] = useState(false)
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "valid" | "invalid" | "exists">("idle")
  const [saveLoading, setSaveLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [agenciaExistente, setAgenciaExistente] = useState<DadosAgencia | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [dadosPreenchidosAutomaticamente, setDadosPreenchidosAutomaticamente] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [empresaData, setEmpresaData] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    inscricao_estadual: "",
    ano_fundacao: "",
    situacao_cadastral: "",
  })

  const [enderecoData, setEnderecoData] = useState({
    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: "",
  })

  const [contatoData, setContatoData] = useState({
    telefone_principal: "",
    whatsapp: "",
    email: "",
    website: "",
  })

  const [infoData, setInfoData] = useState({
    especialidades: "",
    descricao: "",
    horario_funcionamento: "",
    total_vendedores: "",
    total_clientes: "",
    vendas_mes: "",
    vendas_ano: "",
  })

  // Verificar usuário e carregar dados existentes
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
            description: "Você precisa estar logado para cadastrar uma agência.",
          })
          router.push("/login")
          return
        }

        setUser(user)

        // Carregar dados existentes da agência
        const agenciaData = await getAgenciaData(user.id)
        if (agenciaData) {
          setAgenciaExistente(agenciaData)

          // Preencher formulário com dados existentes
          setEmpresaData({
            cnpj: agenciaData.cnpj || "",
            razao_social: agenciaData.razao_social || "",
            nome_fantasia: agenciaData.nome_fantasia || "",
            inscricao_estadual: agenciaData.inscricao_estadual || "",
            ano_fundacao: agenciaData.ano_fundacao?.toString() || "",
            situacao_cadastral: "",
          })

          setEnderecoData({
            cep: agenciaData.cep || "",
            endereco: agenciaData.endereco || "",
            bairro: agenciaData.bairro || "",
            cidade: agenciaData.cidade || "",
            estado: agenciaData.estado || "",
            numero: agenciaData.numero || "",
            complemento: agenciaData.complemento || "",
          })

          setContatoData({
            telefone_principal: agenciaData.telefone_principal || "",
            whatsapp: agenciaData.whatsapp || "",
            email: agenciaData.email || "",
            website: agenciaData.website || "",
          })

          setInfoData({
            especialidades: agenciaData.especialidades || "",
            descricao: agenciaData.descricao || "",
            horario_funcionamento: agenciaData.horario_funcionamento || "",
            total_vendedores: agenciaData.total_vendedores?.toString() || "",
            total_clientes: agenciaData.total_clientes?.toString() || "",
            vendas_mes: agenciaData.vendas_mes?.toString() || "",
            vendas_ano: agenciaData.vendas_ano?.toString() || "",
          })

          setServicos(agenciaData.servicos_oferecidos || [])
          setLogoUrl(agenciaData.logo_url || null)

          // Se já tem dados, considerar como preenchidos automaticamente
          if (agenciaData.cnpj && agenciaData.razao_social) {
            setDadosPreenchidosAutomaticamente(true)
          }

          toast({
            title: "Dados carregados",
            description: "Dados da sua agência foram carregados para edição.",
          })
        }
      } catch (error) {
        console.error("Erro ao verificar usuário:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do usuário.",
        })
      } finally {
        setPageLoading(false)
      }
    }

    checkUser()
  }, [supabase, router, toast])

  const adicionarServico = () => {
    if (novoServico.trim() && !servicos.includes(novoServico.trim())) {
      setServicos([...servicos, novoServico.trim()])
      setNovoServico("")
      toast({
        title: "Serviço adicionado",
        description: `"${novoServico.trim()}" foi adicionado à lista de serviços.`,
      })
    }
  }

  const removerServico = (servico: string) => {
    setServicos(servicos.filter((s) => s !== servico))
    toast({
      title: "Serviço removido",
      description: `"${servico}" foi removido da lista de serviços.`,
    })
  }

  // Função para formatar CNPJ
  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  // Função para validar CNPJ
  const validarCnpj = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, "")

    if (cleanCnpj.length !== 14) return false

    if (/^(\d)\1+$/.test(cleanCnpj)) return false

    let soma = 0
    let peso = 5
    for (let i = 0; i < 12; i++) {
      soma += Number.parseInt(cleanCnpj[i]) * peso
      peso = peso === 2 ? 9 : peso - 1
    }
    const digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11)

    if (Number.parseInt(cleanCnpj[12]) !== digito1) return false

    soma = 0
    peso = 6
    for (let i = 0; i < 13; i++) {
      soma += Number.parseInt(cleanCnpj[i]) * peso
      peso = peso === 2 ? 9 : peso - 1
    }
    const digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11)

    return Number.parseInt(cleanCnpj[13]) === digito2
  }

  // Função para buscar dados da empresa pelo CNPJ
  const buscarCnpj = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, "")

    if (!validarCnpj(cnpj)) {
      setCnpjStatus("invalid")
      return
    }

    setCnpjLoading(true)
    setCnpjStatus("idle")

    try {
      // Verificar se CNPJ já existe no banco (apenas se não for a própria agência)
      if (!agenciaExistente || agenciaExistente.cnpj !== cnpj) {
        const agenciaExistenteCnpj = await getAgenciaByCnpj(cnpj)
        if (agenciaExistenteCnpj) {
          setCnpjStatus("exists")
          toast({
            variant: "destructive",
            title: "CNPJ já cadastrado",
            description: "Este CNPJ já está cadastrado por outra agência.",
          })
          setCnpjLoading(false)
          return
        }
      }

      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)

      if (!response.ok) {
        if (response.status === 404) {
          setCnpjStatus("invalid")
          return
        }
        throw new Error("Erro na consulta")
      }

      const data: BrasilApiCnpjResponse = await response.json()

      if (data.situacao_cadastral !== "02") {
        toast({
          title: "Atenção",
          description: `Empresa com situação cadastral: ${data.descricao_situacao_cadastral}. Verifique se o CNPJ está correto.`,
        })
      }

      // Marcar que os dados foram preenchidos automaticamente
      setDadosPreenchidosAutomaticamente(true)

      setEmpresaData((prev) => ({
        ...prev,
        razao_social: data.razao_social || "",
        nome_fantasia: data.nome_fantasia || data.razao_social || "",
        situacao_cadastral: data.descricao_situacao_cadastral || "",
        ano_fundacao: data.data_inicio_atividade ? new Date(data.data_inicio_atividade).getFullYear().toString() : "",
      }))

      if (data.cep && data.logradouro) {
        setEnderecoData((prev) => ({
          ...prev,
          cep: data.cep.replace(/(\d{5})(\d{3})/, "$1-$2"),
          endereco: `${data.descricao_tipo_logradouro || ""} ${data.logradouro || ""}`.trim(),
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          cidade: data.municipio || "",
          estado: data.uf || "",
        }))
      }

      setCnpjStatus("valid")
      toast({
        title: "CNPJ válido!",
        description: "Dados da empresa preenchidos automaticamente e protegidos contra alteração.",
      })
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error)
      setCnpjStatus("invalid")
      toast({
        variant: "destructive",
        title: "Erro ao consultar CNPJ",
        description: "Não foi possível consultar os dados do CNPJ. Tente novamente.",
      })
    } finally {
      setCnpjLoading(false)
    }
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Se dados já foram preenchidos automaticamente, não permitir alteração
    if (dadosPreenchidosAutomaticamente) {
      toast({
        variant: "destructive",
        title: "Campo protegido",
        description: "CNPJ não pode ser alterado após preenchimento automático.",
      })
      return
    }

    const formattedCnpj = formatCnpj(e.target.value)
    setEmpresaData((prev) => ({ ...prev, cnpj: formattedCnpj }))
    setCnpjStatus("idle")

    if (formattedCnpj.replace(/\D/g, "").length === 14) {
      buscarCnpj(formattedCnpj)
    }
  }

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  const buscarCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")

    if (cleanCep.length !== 8) {
      return
    }

    setCepLoading(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data: ViaCepResponse = await response.json()

      if (data.erro) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "Verifique o CEP digitado e tente novamente.",
        })
        return
      }

      setEnderecoData((prev) => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
        complemento: data.complemento || prev.complemento,
      }))

      toast({
        title: "CEP encontrado!",
        description: "Endereço preenchido automaticamente.",
      })
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setCepLoading(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCep(e.target.value)
    setEnderecoData((prev) => ({ ...prev, cep: formattedCep }))

    if (formattedCep.replace(/\D/g, "").length === 8) {
      buscarCep(formattedCep)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Usuário não encontrado. Faça login novamente.",
      })
      return
    }

    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Termos não aceitos",
        description: "Você deve aceitar os Termos de Uso e Política de Privacidade.",
      })
      return
    }

    if (!empresaData.cnpj || !empresaData.razao_social || !empresaData.nome_fantasia) {
      toast({
        variant: "destructive",
        title: "Dados obrigatórios",
        description: "CNPJ, Razão Social e Nome Fantasia são obrigatórios.",
      })
      return
    }

    if (cnpjStatus === "invalid" || cnpjStatus === "exists") {
      toast({
        variant: "destructive",
        title: "CNPJ inválido",
        description: "Verifique o CNPJ informado.",
      })
      return
    }

    setSaveLoading(true)

    toast({
      title: "Salvando dados...",
      description: "Processando informações da agência.",
    })

    try {
      const dadosParaSalvar: Partial<DadosAgencia> = {
        cnpj: empresaData.cnpj.replace(/\D/g, ""),
        razao_social: empresaData.razao_social,
        nome_fantasia: empresaData.nome_fantasia,
        inscricao_estadual: empresaData.inscricao_estadual || undefined,
        ano_fundacao: empresaData.ano_fundacao ? Number.parseInt(empresaData.ano_fundacao) : undefined,
        telefone_principal: contatoData.telefone_principal || undefined,
        whatsapp: contatoData.whatsapp || undefined,
        email: contatoData.email || undefined,
        website: contatoData.website || undefined,
        cep: enderecoData.cep.replace(/\D/g, "") || undefined,
        endereco: enderecoData.endereco || undefined,
        numero: enderecoData.numero || undefined,
        complemento: enderecoData.complemento || undefined,
        bairro: enderecoData.bairro || undefined,
        cidade: enderecoData.cidade || undefined,
        estado: enderecoData.estado || undefined,
        especialidades: infoData.especialidades || undefined,
        descricao: infoData.descricao || undefined,
        horario_funcionamento: infoData.horario_funcionamento || undefined,
        logo_url: logoUrl || undefined,
        total_vendedores: infoData.total_vendedores ? Number.parseInt(infoData.total_vendedores) : 0,
        total_clientes: infoData.total_clientes ? Number.parseInt(infoData.total_clientes) : 0,
        vendas_mes: infoData.vendas_mes ? Number.parseInt(infoData.vendas_mes) : 0,
        vendas_ano: infoData.vendas_ano ? Number.parseInt(infoData.vendas_ano) : 0,
        servicos_oferecidos: servicos.length > 0 ? servicos : undefined,
      }

      const resultado = await upsertAgencia(user.id, dadosParaSalvar)

      if (resultado) {
        toast({
          title: "🎉 Agência cadastrada com sucesso!",
          description: agenciaExistente
            ? "Os dados da sua agência foram atualizados."
            : "Sua agência foi cadastrada na plataforma.",
        })

        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        throw new Error("Erro ao salvar dados")
      }
    } catch (error) {
      console.error("Erro ao salvar agência:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da agência. Tente novamente.",
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ]

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {agenciaExistente ? "Editar Agência" : "Cadastre sua Agência"}
          </h1>
          <p className="text-gray-600">
            {agenciaExistente
              ? "Atualize as informações da sua agência"
              : "Preencha as informações abaixo para cadastrar sua agência na RX Autos"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas com CNPJ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CNPJ com busca automática */}
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-sm font-medium text-gray-900">
                  CNPJ *
                </Label>
                <div className="relative">
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={empresaData.cnpj}
                    onChange={handleCnpjChange}
                    maxLength={18}
                    className={`border-gray-200 focus:border-orange-500 focus:ring-orange-500 pr-10 ${
                      cnpjStatus === "valid"
                        ? "border-green-500"
                        : cnpjStatus === "invalid" || cnpjStatus === "exists"
                          ? "border-red-500"
                          : ""
                    } ${dadosPreenchidosAutomaticamente ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    required
                    disabled={saveLoading || dadosPreenchidosAutomaticamente}
                    readOnly={dadosPreenchidosAutomaticamente}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {dadosPreenchidosAutomaticamente && <Lock className="h-4 w-4 text-gray-500" />}
                    {cnpjLoading && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
                    {!cnpjLoading && cnpjStatus === "valid" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {!cnpjLoading && (cnpjStatus === "invalid" || cnpjStatus === "exists") && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {dadosPreenchidosAutomaticamente && (
                    <span className="text-gray-600 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Campo protegido - preenchido automaticamente
                    </span>
                  )}
                  {!dadosPreenchidosAutomaticamente && cnpjStatus === "invalid" && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      CNPJ inválido. Informe um CNPJ válido.
                    </span>
                  )}
                  {!dadosPreenchidosAutomaticamente && cnpjStatus === "exists" && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      CNPJ já cadastrado por outra agência.
                    </span>
                  )}
                  {cnpjStatus === "valid" && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      CNPJ válido - Dados preenchidos automaticamente
                    </span>
                  )}
                  {!dadosPreenchidosAutomaticamente && cnpjStatus === "idle" && (
                    <span className="text-gray-500">Digite o CNPJ para preencher automaticamente</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razao_social" className="text-sm font-medium text-gray-900">
                    Razão Social *
                  </Label>
                  <div className="relative">
                    <Input
                      id="razao_social"
                      type="text"
                      placeholder="Auto Center Premium Ltda"
                      value={empresaData.razao_social}
                      onChange={(e) => {
                        if (dadosPreenchidosAutomaticamente) {
                          toast({
                            variant: "destructive",
                            title: "Campo protegido",
                            description: "Razão Social não pode ser alterada após preenchimento automático.",
                          })
                          return
                        }
                        setEmpresaData((prev) => ({ ...prev, razao_social: e.target.value }))
                      }}
                      className={`border-gray-200 focus:border-orange-500 focus:ring-orange-500 ${
                        dadosPreenchidosAutomaticamente ? "bg-gray-100 cursor-not-allowed pr-8" : ""
                      }`}
                      required
                      disabled={saveLoading}
                      readOnly={dadosPreenchidosAutomaticamente}
                    />
                    {dadosPreenchidosAutomaticamente && (
                      <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia" className="text-sm font-medium text-gray-900">
                    Nome Fantasia *
                  </Label>
                  <div className="relative">
                    <Input
                      id="nome_fantasia"
                      type="text"
                      placeholder="Auto Center Premium"
                      value={empresaData.nome_fantasia}
                      onChange={(e) => {
                        if (dadosPreenchidosAutomaticamente) {
                          toast({
                            variant: "destructive",
                            title: "Campo protegido",
                            description: "Nome Fantasia não pode ser alterado após preenchimento automático.",
                          })
                          return
                        }
                        setEmpresaData((prev) => ({ ...prev, nome_fantasia: e.target.value }))
                      }}
                      className={`border-gray-200 focus:border-orange-500 focus:ring-orange-500 ${
                        dadosPreenchidosAutomaticamente ? "bg-gray-100 cursor-not-allowed pr-8" : ""
                      }`}
                      required
                      disabled={saveLoading}
                      readOnly={dadosPreenchidosAutomaticamente}
                    />
                    {dadosPreenchidosAutomaticamente && (
                      <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inscricao_estadual" className="text-sm font-medium text-gray-900">
                    Inscrição Estadual
                  </Label>
                  <Input
                    id="inscricao_estadual"
                    type="text"
                    placeholder="123.456.789.012"
                    value={empresaData.inscricao_estadual}
                    onChange={(e) => setEmpresaData((prev) => ({ ...prev, inscricao_estadual: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano_fundacao" className="text-sm font-medium text-gray-900">
                    Ano de Fundação
                  </Label>
                  <div className="relative">
                    <Input
                      id="ano_fundacao"
                      type="number"
                      placeholder="2010"
                      min="1900"
                      max="2025"
                      value={empresaData.ano_fundacao}
                      onChange={(e) => {
                        if (dadosPreenchidosAutomaticamente) {
                          toast({
                            variant: "destructive",
                            title: "Campo protegido",
                            description: "Ano de Fundação não pode ser alterado após preenchimento automático.",
                          })
                          return
                        }
                        setEmpresaData((prev) => ({ ...prev, ano_fundacao: e.target.value }))
                      }}
                      className={`border-gray-200 focus:border-orange-500 focus:ring-orange-500 ${
                        dadosPreenchidosAutomaticamente ? "bg-gray-100 cursor-not-allowed pr-8" : ""
                      }`}
                      disabled={saveLoading}
                      readOnly={dadosPreenchidosAutomaticamente}
                    />
                    {dadosPreenchidosAutomaticamente && (
                      <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {empresaData.situacao_cadastral && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Situação Cadastral: {empresaData.situacao_cadastral}
                    </span>
                  </div>
                </div>
              )}

              {dadosPreenchidosAutomaticamente && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Dados protegidos</p>
                      <p className="text-xs text-green-700">
                        Os campos preenchidos automaticamente pelo CNPJ não podem ser alterados para garantir a
                        veracidade das informações.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone_principal" className="text-sm font-medium text-gray-900">
                    Telefone Principal *
                  </Label>
                  <Input
                    id="telefone_principal"
                    type="tel"
                    placeholder="(11) 3000-0000"
                    value={contatoData.telefone_principal}
                    onChange={(e) => setContatoData((prev) => ({ ...prev, telefone_principal: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-900">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={contatoData.whatsapp}
                    onChange={(e) => setContatoData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@agencia.com.br"
                    value={contatoData.email}
                    onChange={(e) => setContatoData((prev) => ({ ...prev, email: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-gray-900">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.agencia.com.br"
                    value={contatoData.website}
                    onChange={(e) => setContatoData((prev) => ({ ...prev, website: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço com ViaCEP */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep" className="text-sm font-medium text-gray-900">
                    CEP *
                  </Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      type="text"
                      placeholder="00000-000"
                      value={enderecoData.cep}
                      onChange={handleCepChange}
                      maxLength={9}
                      className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      required
                      disabled={saveLoading}
                    />
                    {cepLoading && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Digite o CEP para preencher automaticamente</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="endereco" className="text-sm font-medium text-gray-900">
                    Endereço *
                  </Label>
                  <Input
                    id="endereco"
                    type="text"
                    placeholder="Rua das Flores"
                    value={enderecoData.endereco}
                    onChange={(e) => setEnderecoData((prev) => ({ ...prev, endereco: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-sm font-medium text-gray-900">
                    Número *
                  </Label>
                  <Input
                    id="numero"
                    type="text"
                    placeholder="123"
                    value={enderecoData.numero}
                    onChange={(e) => setEnderecoData((prev) => ({ ...prev, numero: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={saveLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complemento" className="text-sm font-medium text-gray-900">
                    Complemento
                  </Label>
                  <Input
                    id="complemento"
                    type="text"
                    placeholder="Sala 101"
                    value={enderecoData.complemento}
                    onChange={(e) => setEnderecoData((prev) => ({ ...prev, complemento: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro" className="text-sm font-medium text-gray-900">
                    Bairro *
                  </Label>
                  <Input
                    id="bairro"
                    type="text"
                    placeholder="Centro"
                    value={enderecoData.bairro}
                    onChange={(e) => setEnderecoData((prev) => ({ ...prev, bairro: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={saveLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm font-medium text-gray-900">
                    Cidade *
                  </Label>
                  <Input
                    id="cidade"
                    type="text"
                    placeholder="São Paulo"
                    value={enderecoData.cidade}
                    onChange={(e) => setEnderecoData((prev) => ({ ...prev, cidade: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium text-gray-900">
                    Estado *
                  </Label>
                  <Select
                    value={enderecoData.estado}
                    onValueChange={(value) => setEnderecoData((prev) => ({ ...prev, estado: value }))}
                    required
                    disabled={saveLoading}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="especialidades" className="text-sm font-medium text-gray-900">
                  Especialidades
                </Label>
                <Textarea
                  id="especialidades"
                  placeholder="Ex: Carros de luxo, Veículos seminovos, Financiamento facilitado..."
                  value={infoData.especialidades}
                  onChange={(e) => setInfoData((prev) => ({ ...prev, especialidades: e.target.value }))}
                  className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 min-h-[80px]"
                  disabled={saveLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium text-gray-900">
                  Descrição da Agência
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Conte um pouco sobre sua agência, história, diferenciais..."
                  value={infoData.descricao}
                  onChange={(e) => setInfoData((prev) => ({ ...prev, descricao: e.target.value }))}
                  className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
                  disabled={saveLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario_funcionamento" className="text-sm font-medium text-gray-900">
                  Horário de Funcionamento
                </Label>
                <Textarea
                  id="horario_funcionamento"
                  placeholder="Ex: Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h"
                  value={infoData.horario_funcionamento}
                  onChange={(e) => setInfoData((prev) => ({ ...prev, horario_funcionamento: e.target.value }))}
                  className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 min-h-[80px]"
                  disabled={saveLoading}
                />
              </div>

              {/* Serviços Oferecidos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">Serviços Oferecidos</Label>
                <div className="flex gap-2">
                  <Input
                    value={novoServico}
                    onChange={(e) => setNovoServico(e.target.value)}
                    placeholder="Digite um serviço"
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarServico())}
                    disabled={saveLoading}
                  />
                  <Button
                    type="button"
                    onClick={adicionarServico}
                    className="bg-orange-500 hover:bg-orange-600 px-3"
                    disabled={saveLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {servicos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {servicos.map((servico, index) => (
                      <div
                        key={index}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {servico}
                        <button
                          type="button"
                          onClick={() => removerServico(servico)}
                          className="text-orange-600 hover:text-orange-800"
                          disabled={saveLoading}
                          title={`Remover ${servico}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logo da Agência com Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Logo da Agência</CardTitle>
            </CardHeader>
            <CardContent>
              <LogoUpload
                userId={user?.id || ""}
                currentLogoUrl={logoUrl || undefined}
                onLogoChange={(url) => setLogoUrl(url || null)}
                disabled={saveLoading}
              />
            </CardContent>
          </Card>

          {/* Estatísticas Iniciais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Informações Adicionais (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_vendedores" className="text-sm font-medium text-gray-900">
                    Total de Vendedores
                  </Label>
                  <Input
                    id="total_vendedores"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={infoData.total_vendedores}
                    onChange={(e) => setInfoData((prev) => ({ ...prev, total_vendedores: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_clientes" className="text-sm font-medium text-gray-900">
                    Total de Clientes
                  </Label>
                  <Input
                    id="total_clientes"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={infoData.total_clientes}
                    onChange={(e) => setInfoData((prev) => ({ ...prev, total_clientes: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendas_mes" className="text-sm font-medium text-gray-900">
                    Vendas do Mês
                  </Label>
                  <Input
                    id="vendas_mes"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={infoData.vendas_mes}
                    onChange={(e) => setInfoData((prev) => ({ ...prev, vendas_mes: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendas_ano" className="text-sm font-medium text-gray-900">
                    Vendas do Ano
                  </Label>
                  <Input
                    id="vendas_ano"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={infoData.vendas_ano}
                    onChange={(e) => setInfoData((prev) => ({ ...prev, vendas_ano: e.target.value }))}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={saveLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termos e Botão */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-0.5 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    disabled={saveLoading}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                    Ao cadastrar minha agência, concordo com os{" "}
                    <Link href="#" className="text-orange-500 hover:text-orange-600">
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link href="#" className="text-orange-500 hover:text-orange-600">
                      Política de Privacidade
                    </Link>{" "}
                    da RX Autos
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {agenciaExistente ? "Atualizando Agência..." : "Cadastrando Agência..."}
                    </>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5 mr-2" />
                      {agenciaExistente ? "Atualizar Agência" : "Cadastrar Agência"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
