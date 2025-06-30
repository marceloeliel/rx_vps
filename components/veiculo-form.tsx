"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useFipe } from "@/hooks/use-fipe"
import {
  createVeiculo,
  updateVeiculo,
  type VeiculoFormData,
  type Veiculo,
  TIPOS_VEICULO,
  MARCAS_VEICULOS,
  COMBUSTIVEIS,
  CAMBIOS,
  CORES,
  ESTADOS_VEICULO,
  TIPOS_PRECO,
} from "@/lib/supabase/veiculos"
import { Car, DollarSign, Camera, Settings, Save, ArrowLeft, AlertCircle, Truck, Bike, Loader2 } from "lucide-react"
import VeiculoFotoUpload from "./veiculo-foto-upload"
import { generateTempVeiculoId } from "@/lib/supabase/veiculo-storage"

interface VeiculoFormProps {
  veiculo?: Veiculo
  isEditing?: boolean
}

export default function VeiculoForm({ veiculo, isEditing = false }: VeiculoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState<VeiculoFormData>({
    // Informações básicas
    tipo_veiculo: veiculo?.tipo_veiculo || "carro",
    marca_nome: veiculo?.marca_nome || "",
    modelo_nome: veiculo?.modelo_nome || "",
    titulo: veiculo?.titulo || "",
    descricao: veiculo?.descricao || "",
    codigo_fipe: veiculo?.codigo_fipe || "",

    // Especificações técnicas
    ano_fabricacao: veiculo?.ano_fabricacao || new Date().getFullYear(),
    ano_modelo: veiculo?.ano_modelo || new Date().getFullYear(),
    quilometragem: veiculo?.quilometragem || 0,
    cor: veiculo?.cor || "",
    combustivel: veiculo?.combustivel || "",
    cambio: veiculo?.cambio || "",
    portas: veiculo?.portas || 4,
    final_placa: veiculo?.final_placa || "",
    estado_veiculo: veiculo?.estado_veiculo || "usado",

    // Preço e condições
    preco: veiculo?.preco || 0,
    tipo_preco: veiculo?.tipo_preco || "negociavel",
    aceita_financiamento: veiculo?.aceita_financiamento || false,
    aceita_troca: veiculo?.aceita_troca || false,
    aceita_parcelamento: veiculo?.aceita_parcelamento || false,
    parcelas_maximas: veiculo?.parcelas_maximas || undefined,
    entrada_minima: veiculo?.entrada_minima || undefined,

    // Mídia
    foto_principal: veiculo?.foto_principal || "",
    fotos: veiculo?.fotos || [],
    video: veiculo?.video || "",

    // Status
    status: veiculo?.status || "ativo",
    destaque: veiculo?.destaque || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tempVeiculoId, setTempVeiculoId] = useState<string>("")

  // Gerar ID temporário apenas no cliente
  useEffect(() => {
    setTempVeiculoId(veiculo?.id || generateTempVeiculoId())
  }, [veiculo?.id])

  // Definir ano atual apenas no cliente para evitar erro de hidratação
  useEffect(() => {
    if (!veiculo) {
      const anoAtual = new Date().getFullYear()
      setFormData(prev => ({
        ...prev,
        ano_fabricacao: anoAtual,
        ano_modelo: anoAtual,
      }))
    }
  }, [veiculo])

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
    tipoVeiculo: formData.tipo_veiculo,
    enableCache: true 
  })

  // Aplicar dados FIPE quando seleção for completada
  useEffect(() => {
    if (selectedMarca && selectedModelo && selectedAno) {
      buscarPreco(selectedMarca, selectedModelo, selectedAno)
    }
  }, [selectedMarca, selectedModelo, selectedAno, buscarPreco])

  // Aplicar dados FIPE ao formulário quando preço for encontrado
  useEffect(() => {
    if (fipeData.precoFipe) {
      setFormData(prev => ({
        ...prev,
        marca_nome: fipeData.precoFipe!.brand,
        modelo_nome: fipeData.precoFipe!.model,
        ano_fabricacao: fipeData.precoFipe!.modelYear,
        ano_modelo: fipeData.precoFipe!.modelYear,
        combustivel: mapearCombustivelFipe(fipeData.precoFipe!.fuel),
        codigo_fipe: fipeData.precoFipe!.codeFipe,
        // Sugerir preço baseado na FIPE (pode ser ajustado pelo usuário)
        preco: fipeData.valorFipe,
      }))
    }
  }, [fipeData.precoFipe, fipeData.valorFipe, mapearCombustivelFipe])

  // Resetar campos dependentes quando tipo de veículo muda
  useEffect(() => {
    if (formData.tipo_veiculo && !isEditing) {
        setFormData((prev) => ({
          ...prev,
          marca_nome: "",
        modelo_nome: "",
          combustivel: "",
          cambio: "",
          portas: formData.tipo_veiculo === "moto" ? 0 : 4,
        codigo_fipe: "",
        }))
    }
  }, [formData.tipo_veiculo, isEditing])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    const anoAtual = 2024 // Valor fixo para evitar erro de hidratação

    if (step === 1) {
      if (!formData.tipo_veiculo) newErrors.tipo_veiculo = "Tipo de veículo é obrigatório"
      if (!formData.marca_nome) newErrors.marca_nome = "Marca é obrigatória"
      if (!formData.modelo_nome) newErrors.modelo_nome = "Modelo é obrigatório"
      if (!formData.titulo) newErrors.titulo = "Título é obrigatório"
      if (formData.ano_fabricacao < 1900 || formData.ano_fabricacao > anoAtual + 1) {
        newErrors.ano_fabricacao = "Ano de fabricação inválido"
      }
      if (formData.ano_modelo < 1900 || formData.ano_modelo > anoAtual + 1) {
        newErrors.ano_modelo = "Ano do modelo inválido"
      }
    }

    if (step === 2) {
      if (!formData.cor) newErrors.cor = "Cor é obrigatória"
      if (!formData.combustivel) newErrors.combustivel = "Combustível é obrigatório"
      if (!formData.cambio) newErrors.cambio = "Câmbio é obrigatório"
      if (formData.quilometragem < 0) newErrors.quilometragem = "Quilometragem inválida"
      if (formData.tipo_veiculo !== "moto" && (formData.portas < 2 || formData.portas > 5)) {
        newErrors.portas = "Número de portas inválido"
      }
    }

    if (step === 3) {
      if (formData.preco <= 0) newErrors.preco = "Preço deve ser maior que zero"
      if (formData.aceita_parcelamento && (!formData.parcelas_maximas || formData.parcelas_maximas < 1)) {
        newErrors.parcelas_maximas = "Número de parcelas inválido"
      }
      if (formData.aceita_parcelamento && formData.entrada_minima && formData.entrada_minima < 0) {
        newErrors.entrada_minima = "Entrada mínima inválida"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof VeiculoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Handler para mudança de marca FIPE
  const handleMarcaFipeChange = (codigoMarca: string) => {
    handleMarcaChange(codigoMarca)
    // Limpar campos dependentes
    setFormData(prev => ({
      ...prev,
      modelo_nome: "",
      ano_fabricacao: 0,
      ano_modelo: 0,
      combustivel: "",
      codigo_fipe: "",
    }))
  }

  // Handler para mudança de modelo FIPE
  const handleModeloFipeChange = (codigoModelo: string) => {
    handleModeloChange(codigoModelo)
    // Limpar campos dependentes
    setFormData(prev => ({
      ...prev,
      ano_fabricacao: 0,
      ano_modelo: 0,
      combustivel: "",
      codigo_fipe: "",
    }))
  }

  // Handler para mudança de ano FIPE
  const handleAnoFipeChange = (codigoAno: string) => {
    handleAnoChange(codigoAno)
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    try {
      let result
      if (isEditing && veiculo?.id) {
        result = await updateVeiculo(veiculo.id, formData)
      } else {
        result = await createVeiculo(formData)
      }

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.error.message || "Erro ao salvar veículo",
        })
        return
      }

      toast({
        title: "Sucesso!",
        description: `Veículo ${isEditing ? "atualizado" : "cadastrado"} com sucesso`,
      })

      router.push("/painel-agencia")
    } catch (error) {
      console.error("Erro ao salvar veículo:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar veículo",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case "carro":
        return <Car className="h-4 w-4" />
      case "moto":
        return <Bike className="h-4 w-4" />
      case "caminhao":
        return <Truck className="h-4 w-4" />
      case "maquina_pesada":
        return <Settings className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  const getCombustiveisDisponiveis = () => {
    return COMBUSTIVEIS[formData.tipo_veiculo as keyof typeof COMBUSTIVEIS] || []
  }

  const getCambiosDisponiveis = () => {
    return CAMBIOS[formData.tipo_veiculo as keyof typeof CAMBIOS] || []
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Editar Veículo" : "Cadastrar Veículo"}</h1>
              <p className="text-gray-600">
                {isEditing ? "Atualize as informações do seu veículo" : "Adicione um novo veículo ao seu estoque"}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Etapa {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% concluído</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-6">
            {[
              { step: 1, title: "Básico", icon: Car },
              { step: 2, title: "Especificações", icon: Settings },
              { step: 3, title: "Preço", icon: DollarSign },
              { step: 4, title: "Fotos", icon: Camera },
            ].map(({ step, title, icon: Icon }) => (
              <div
                key={step}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  currentStep === step
                    ? "bg-orange-100 text-orange-700"
                    : currentStep > step
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:block">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            {/* Etapa 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  {getIconForTipo(formData.tipo_veiculo)}
                  <h2 className="text-lg font-semibold">Informações Básicas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="tipo_veiculo">Tipo de Veículo *</Label>
                    <Select
                      value={formData.tipo_veiculo}
                      onValueChange={(value) => handleInputChange("tipo_veiculo", value)}
                    >
                      <SelectTrigger className={errors.tipo_veiculo ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o tipo de veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_VEICULO.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center gap-2">
                              <span>{tipo.icon}</span>
                              <span>{tipo.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tipo_veiculo && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.tipo_veiculo}
                      </p>
                    )}
                  </div>

                  {/* Marca FIPE */}
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Select
                      value={selectedMarca}
                      onValueChange={handleMarcaFipeChange}
                      disabled={!formData.tipo_veiculo}
                    >
                      <SelectTrigger className={errors.marca_nome ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione a marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {fipeLoading.marcas ? (
                          <SelectItem value="loading-marcas" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Carregando marcas...
                            </div>
                          </SelectItem>
                        ) : fipeErrors.marcas ? (
                          <SelectItem value="error-marcas" disabled>
                            Erro: {fipeErrors.marcas}
                          </SelectItem>
                        ) : (
                          fipeData.marcas.map((marca) => (
                            <SelectItem key={marca.code} value={marca.code}>
                              {marca.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.marca_nome && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.marca_nome}
                      </p>
                    )}
                  </div>

                  {/* Modelo FIPE */}
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Select
                      value={selectedModelo}
                      onValueChange={handleModeloFipeChange}
                      disabled={!selectedMarca}
                    >
                      <SelectTrigger className={errors.modelo_nome ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {fipeLoading.modelos ? (
                          <SelectItem value="loading-modelos" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Carregando modelos...
                            </div>
                          </SelectItem>
                        ) : fipeErrors.modelos ? (
                          <SelectItem value="error-modelos" disabled>
                            Erro: {fipeErrors.modelos}
                          </SelectItem>
                        ) : (
                          fipeData.modelos.map((modelo) => (
                            <SelectItem key={modelo.code} value={modelo.code}>
                              {modelo.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.modelo_nome && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.modelo_nome}
                      </p>
                    )}
                  </div>

                  {/* Ano FIPE */}
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano *</Label>
                    <Select
                      value={selectedAno}
                      onValueChange={handleAnoFipeChange}
                      disabled={!selectedModelo}
                    >
                      <SelectTrigger className={errors.ano_fabricacao ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {fipeLoading.anos ? (
                          <SelectItem value="loading-anos" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Carregando anos...
                            </div>
                          </SelectItem>
                        ) : fipeErrors.anos ? (
                          <SelectItem value="error-anos" disabled>
                            Erro: {fipeErrors.anos}
                          </SelectItem>
                        ) : (
                          fipeData.anos.map((ano) => (
                            <SelectItem key={ano.code} value={ano.code}>
                              {ano.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.ano_fabricacao && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.ano_fabricacao}
                      </p>
                    )}
                  </div>

                  {/* Código FIPE (preenchido automaticamente) */}
                  <div className="space-y-2">
                    <Label htmlFor="codigo_fipe">Código FIPE</Label>
                    <Input
                      id="codigo_fipe"
                      value={formData.codigo_fipe}
                      onChange={(e) => handleInputChange("codigo_fipe", e.target.value)}
                      placeholder="Preenchido automaticamente"
                      readOnly
                      className="bg-gray-50"
                    />
                    {fipeData.precoFipe && (
                      <div className="text-xs text-green-600">
                        Valor FIPE: {fipeData.precoFipe.price}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="titulo">Título do Anúncio *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange("titulo", e.target.value)}
                      placeholder={
                        formData.tipo_veiculo === "carro"
                          ? "Ex: Toyota Corolla XEi 2.0 Automático"
                          : formData.tipo_veiculo === "moto"
                            ? "Ex: Honda CB 600F Hornet 2020"
                            : formData.tipo_veiculo === "caminhao"
                              ? "Ex: Mercedes-Benz Actros 2546 6x2"
                              : "Ex: Caterpillar 320D Escavadeira Hidráulica"
                      }
                      className={errors.titulo ? "border-red-500" : ""}
                    />
                    {errors.titulo && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.titulo}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_veiculo">Estado do Veículo</Label>
                    <Select
                      value={formData.estado_veiculo}
                      onValueChange={(value) => handleInputChange("estado_veiculo", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_VEICULO.map((estado) => (
                          <SelectItem key={estado.toLowerCase()} value={estado.toLowerCase()}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => handleInputChange("descricao", e.target.value)}
                      placeholder="Descreva as características, opcionais e estado do veículo..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Especificações Técnicas */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">Especificações Técnicas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cor">Cor *</Label>
                    <Select value={formData.cor} onValueChange={(value) => handleInputChange("cor", value)}>
                      <SelectTrigger className={errors.cor ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione a cor" />
                      </SelectTrigger>
                      <SelectContent>
                        {CORES.map((cor) => (
                          <SelectItem key={cor} value={cor.toLowerCase()}>
                            {cor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cor && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.cor}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="combustivel">Combustível *</Label>
                    <Input
                      id="combustivel"
                      value={formData.combustivel}
                      onChange={(e) => handleInputChange("combustivel", e.target.value)}
                      placeholder="Preenchido automaticamente pela FIPE"
                      className={errors.combustivel ? "border-red-500" : ""}
                    />
                    {errors.combustivel && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.combustivel}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cambio">Câmbio *</Label>
                    <Select value={formData.cambio} onValueChange={(value) => handleInputChange("cambio", value)}>
                      <SelectTrigger className={errors.cambio ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o câmbio" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCambiosDisponiveis().map((cambio) => (
                          <SelectItem key={cambio} value={cambio.toLowerCase()}>
                            {cambio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cambio && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.cambio}
                      </p>
                    )}
                  </div>

                  {formData.tipo_veiculo !== "moto" && (
                    <div className="space-y-2">
                      <Label htmlFor="portas">Número de Portas *</Label>
                      <Select
                        value={formData.portas.toString()}
                        onValueChange={(value) => handleInputChange("portas", Number.parseInt(value))}
                      >
                        <SelectTrigger className={errors.portas ? "border-red-500" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 portas</SelectItem>
                          <SelectItem value="3">3 portas</SelectItem>
                          <SelectItem value="4">4 portas</SelectItem>
                          <SelectItem value="5">5 portas</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.portas && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.portas}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="quilometragem">
                      {formData.tipo_veiculo === "maquina_pesada" ? "Horas de Uso" : "Quilometragem (km)"}
                    </Label>
                    <Input
                      id="quilometragem"
                      type="number"
                      value={formData.quilometragem === 0 ? "" : formData.quilometragem}
                      onChange={(e) => handleInputChange("quilometragem", e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder={formData.tipo_veiculo === "maquina_pesada" ? "Ex: 5000" : "Ex: 50000"}
                      className={errors.quilometragem ? "border-red-500" : ""}
                    />
                    {errors.quilometragem && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.quilometragem}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="final_placa">Final da Placa</Label>
                    <Select
                      value={formData.final_placa}
                      onValueChange={(value) => handleInputChange("final_placa", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o final" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 3: Preço e Condições */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold">Preço e Condições</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="preco"
                      type="number"
                      value={formData.preco === 0 ? "" : formData.preco}
                      onChange={(e) => handleInputChange("preco", e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                        className={`pl-8 ${errors.preco ? "border-red-500" : ""}`}
                    />
                    </div>
                    {fipeData.valorFipe > 0 && (
                      <div className="text-xs text-gray-600">
                        Valor FIPE sugerido: {formatCurrency(fipeData.valorFipe)}
                      </div>
                    )}
                    {errors.preco && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.preco}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_preco">Tipo de Preço</Label>
                    <Select
                      value={formData.tipo_preco}
                      onValueChange={(value) => handleInputChange("tipo_preco", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_PRECO.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label>Condições de Venda</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="aceita_financiamento"
                          checked={formData.aceita_financiamento}
                          onCheckedChange={(checked) => handleInputChange("aceita_financiamento", checked)}
                        />
                        <Label htmlFor="aceita_financiamento">Aceita Financiamento</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="aceita_troca"
                          checked={formData.aceita_troca}
                          onCheckedChange={(checked) => handleInputChange("aceita_troca", checked)}
                        />
                        <Label htmlFor="aceita_troca">Aceita Troca</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="aceita_parcelamento"
                          checked={formData.aceita_parcelamento}
                          onCheckedChange={(checked) => handleInputChange("aceita_parcelamento", checked)}
                        />
                        <Label htmlFor="aceita_parcelamento">Aceita Parcelamento</Label>
                      </div>
                    </div>
                  </div>

                  {formData.aceita_parcelamento && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="parcelas_maximas">Máximo de Parcelas</Label>
                        <Input
                          id="parcelas_maximas"
                          type="number"
                          value={formData.parcelas_maximas || ""}
                          onChange={(e) => handleInputChange("parcelas_maximas", e.target.value === "" ? undefined : Number.parseInt(e.target.value) || undefined)}
                          min="1"
                          max="60"
                          placeholder="Ex: 12"
                          className={errors.parcelas_maximas ? "border-red-500" : ""}
                        />
                        {errors.parcelas_maximas && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.parcelas_maximas}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="entrada_minima">Entrada Mínima</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                        <Input
                          id="entrada_minima"
                          type="number"
                          value={formData.entrada_minima || ""}
                            onChange={(e) => handleInputChange("entrada_minima", e.target.value === "" ? undefined : Number.parseFloat(e.target.value) || undefined)}
                            placeholder="0,00"
                            className={`pl-8 ${errors.entrada_minima ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.entrada_minima && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.entrada_minima}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 4: Fotos */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Fotos e Vídeo</h2>
                </div>

                <VeiculoFotoUpload
                  veiculoId={tempVeiculoId}
                  fotoPrincipal={formData.foto_principal}
                  fotos={formData.fotos}
                  onFotoPrincipalChange={(url) => handleInputChange("foto_principal", url)}
                  onFotosChange={(urls) => handleInputChange("fotos", urls)}
                />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) => handleInputChange("destaque", checked)}
                    />
                    <Label htmlFor="destaque">Destacar este anúncio</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                    Anterior
                  </Button>

                {currentStep < totalSteps ? (
                <Button onClick={handleNextStep}>
                    Próximo
                  </Button>
                ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? "Atualizar Veículo" : "Cadastrar Veículo"}
                      </>
                    )}
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
