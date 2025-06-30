"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FipeSelector } from '@/components/fipe-selector'
import { Badge } from '@/components/ui/badge'
import { Car, DollarSign, Info } from 'lucide-react'

// Exemplo de como integrar o componente FIPE no formulário de cadastro
export function FipeIntegrationExample() {
  const [tipoVeiculo, setTipoVeiculo] = useState('carro')
  const [showFipeSelector, setShowFipeSelector] = useState(false)
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: 0,
    preco: 0,
    combustivel: '',
    cor: '',
    quilometragem: 0,
    descricao: '',
  })

  // Handler para quando dados FIPE são selecionados
  const handleFipeDataSelect = (fipeData: {
    marca: string
    modelo: string
    ano: number
    valorFipe: number
    combustivel: string
  }) => {
    setFormData(prev => ({
      ...prev,
      marca: fipeData.marca,
      modelo: fipeData.modelo,
      ano: fipeData.ano,
      preco: fipeData.valorFipe,
      combustivel: fipeData.combustivel,
    }))
    
    // Fechar o seletor FIPE após aplicar os dados
    setShowFipeSelector(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cadastro de Veículo com Tabela FIPE
        </h1>
        <p className="text-gray-600">
          Exemplo de integração da API FIPE para facilitar o cadastro de veículos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Dados do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Veículo */}
            <div>
              <Label htmlFor="tipo-veiculo">Tipo de Veículo</Label>
              <Select value={tipoVeiculo} onValueChange={setTipoVeiculo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão para abrir consulta FIPE */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFipeSelector(!showFipeSelector)}
                variant="outline"
                className="flex-1"
              >
                <Info className="h-4 w-4 mr-2" />
                Consultar Tabela FIPE
              </Button>
            </div>

            {/* Campos do formulário */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                  placeholder="Ex: Fiat"
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                  placeholder="Ex: Palio"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  value={formData.ano || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ano: parseInt(e.target.value) || 0 }))}
                  placeholder="Ex: 2020"
                />
              </div>
              <div>
                <Label htmlFor="combustivel">Combustível</Label>
                <Input
                  id="combustivel"
                  value={formData.combustivel}
                  onChange={(e) => setFormData(prev => ({ ...prev, combustivel: e.target.value }))}
                  placeholder="Ex: Flex"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  value={formData.cor}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                  placeholder="Ex: Branco"
                />
              </div>
              <div>
                <Label htmlFor="quilometragem">Quilometragem</Label>
                <Input
                  id="quilometragem"
                  type="number"
                  value={formData.quilometragem || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quilometragem: parseInt(e.target.value) || 0 }))}
                  placeholder="Ex: 50000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preco">Preço</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="preco"
                  type="number"
                  value={formData.preco || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
              {formData.preco > 0 && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-sm">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(formData.preco)}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o veículo..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>

            <Button className="w-full" size="lg">
              Salvar Veículo
            </Button>
          </CardContent>
        </Card>

        {/* Componente FIPE */}
        {showFipeSelector && (
          <div className="lg:col-span-1">
            <FipeSelector
              tipoVeiculo={tipoVeiculo}
              onSelect={handleFipeDataSelect}
            />
          </div>
        )}
      </div>

      {/* Resumo dos dados */}
      {(formData.marca || formData.modelo || formData.preco > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {formData.marca && (
                <div>
                  <span className="text-gray-600">Marca:</span>
                  <div className="font-medium">{formData.marca}</div>
                </div>
              )}
              {formData.modelo && (
                <div>
                  <span className="text-gray-600">Modelo:</span>
                  <div className="font-medium">{formData.modelo}</div>
                </div>
              )}
              {formData.ano > 0 && (
                <div>
                  <span className="text-gray-600">Ano:</span>
                  <div className="font-medium">{formData.ano}</div>
                </div>
              )}
              {formData.preco > 0 && (
                <div>
                  <span className="text-gray-600">Preço:</span>
                  <div className="font-medium text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(formData.preco)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 