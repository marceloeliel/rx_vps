"use client"

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Car, Info } from 'lucide-react'
import { useFipe } from '@/hooks/use-fipe'

interface FipeSelectorProps {
  tipoVeiculo?: string
  onSelect?: (data: {
    marca: string
    modelo: string
    ano: number
    valorFipe: number
    combustivel: string
  }) => void
}

export function FipeSelector({ tipoVeiculo = 'carro', onSelect }: FipeSelectorProps) {
  const {
    data,
    loading,
    errors,
    selectedMarca,
    selectedModelo,
    selectedAno,
    handleMarcaChange,
    handleModeloChange,
    handleAnoChange,
    resetarSelecoes,
  } = useFipe({ tipoVeiculo })

  const [showInfo, setShowInfo] = useState(false)

  // Função para aplicar os dados FIPE ao formulário
  const aplicarDadosFipe = () => {
    if (data.precoFipe && onSelect) {
      onSelect({
        marca: data.precoFipe.brand,
        modelo: data.precoFipe.model,
        ano: data.precoFipe.modelYear,
        valorFipe: data.valorFipe,
        combustivel: data.precoFipe.fuel,
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Consulta Tabela FIPE
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="ml-auto"
          >
            <Info className="h-4 w-4" />
          </Button>
        </CardTitle>
        {showInfo && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p>
              A Tabela FIPE é uma referência oficial de preços de veículos no Brasil. 
              Os valores são atualizados mensalmente e servem como base para negociações.
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tipo de Veículo */}
        <div>
          <Label htmlFor="tipo-veiculo">Tipo de Veículo</Label>
          <div className="mt-1">
            <Badge variant="outline" className="text-sm">
              {tipoVeiculo.charAt(0).toUpperCase() + tipoVeiculo.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Marca */}
        <div>
          <Label htmlFor="marca">Marca</Label>
          <Select value={selectedMarca} onValueChange={handleMarcaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {loading.marcas ? (
                <SelectItem value="loading-marcas" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando marcas...
                  </div>
                </SelectItem>
              ) : errors.marcas ? (
                <SelectItem value="error-marcas" disabled>
                  Erro: {errors.marcas}
                </SelectItem>
              ) : (
                data.marcas.map((marca) => (
                  <SelectItem key={marca.code} value={marca.code}>
                    {marca.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Modelo */}
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Select 
            value={selectedModelo} 
            onValueChange={handleModeloChange}
            disabled={!selectedMarca}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              {loading.modelos ? (
                <SelectItem value="loading-modelos" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando modelos...
                  </div>
                </SelectItem>
              ) : errors.modelos ? (
                <SelectItem value="error-modelos" disabled>
                  Erro: {errors.modelos}
                </SelectItem>
              ) : (
                data.modelos.map((modelo) => (
                  <SelectItem key={modelo.code} value={modelo.code}>
                    {modelo.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div>
          <Label htmlFor="ano">Ano</Label>
          <Select 
            value={selectedAno} 
            onValueChange={handleAnoChange}
            disabled={!selectedModelo}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {loading.anos ? (
                <SelectItem value="loading-anos" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando anos...
                  </div>
                </SelectItem>
              ) : errors.anos ? (
                <SelectItem value="error-anos" disabled>
                  Erro: {errors.anos}
                </SelectItem>
              ) : (
                data.anos.map((ano) => (
                  <SelectItem key={ano.code} value={ano.code}>
                    {ano.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Resultado FIPE */}
        {data.precoFipe && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Dados FIPE Encontrados</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Veículo:</span>
                <span className="font-medium">
                  {data.precoFipe.brand} {data.precoFipe.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ano:</span>
                <span className="font-medium">{data.precoFipe.modelYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Combustível:</span>
                <span className="font-medium">{data.precoFipe.fuel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor FIPE:</span>
                <span className="font-bold text-green-700">
                  {data.precoFipe.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referência:</span>
                <span className="text-xs text-gray-500">{data.precoFipe.referenceMonth}</span>
              </div>
            </div>
            
            <Button 
              onClick={aplicarDadosFipe}
              className="w-full mt-3 bg-green-600 hover:bg-green-700"
            >
              Aplicar Dados ao Formulário
            </Button>
          </div>
        )}

        {/* Loading do preço */}
        {loading.preco && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500 mr-2" />
            <span className="text-sm text-gray-600">Consultando preço FIPE...</span>
          </div>
        )}

        {/* Erro do preço */}
        {errors.preco && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">
              Erro ao consultar preço FIPE: {errors.preco}
            </p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={resetarSelecoes}
            className="flex-1"
          >
            Limpar Seleção
          </Button>
          
          {data.precoFipe && (
            <Button 
              onClick={aplicarDadosFipe}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Aplicar Dados
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 