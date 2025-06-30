import { useState, useEffect, useCallback } from 'react'
import {
  buscarMarcas,
  buscarModelos,
  buscarAnos,
  buscarPrecoFipe,
  mapearCombustivelFipe,
  extrairAnoDoCodigo,
  formatarPrecoFipe,
  type FipeMarca,
  type FipeModelo,
  type FipeAno,
  type FipePreco
} from '@/lib/fipe-api'

interface UseFipeOptions {
  tipoVeiculo: string
  enableCache?: boolean
}

interface FipeData {
  marcas: FipeMarca[]
  modelos: FipeModelo[]
  anos: FipeAno[]
  precoFipe: FipePreco | null
  valorFipe: number
}

interface FipeLoading {
  marcas: boolean
  modelos: boolean
  anos: boolean
  preco: boolean
}

interface FipeErrors {
  marcas: string | null
  modelos: string | null
  anos: string | null
  preco: string | null
}

export function useFipe({ tipoVeiculo, enableCache = true }: UseFipeOptions) {
  const [data, setData] = useState<FipeData>({
    marcas: [],
    modelos: [],
    anos: [],
    precoFipe: null,
    valorFipe: 0
  })

  const [loading, setLoading] = useState<FipeLoading>({
    marcas: false,
    modelos: false,
    anos: false,
    preco: false
  })

  const [errors, setErrors] = useState<FipeErrors>({
    marcas: null,
    modelos: null,
    anos: null,
    preco: null
  })

  const [selectedMarca, setSelectedMarca] = useState<string | undefined>(undefined)
  const [selectedModelo, setSelectedModelo] = useState<string | undefined>(undefined)
  const [selectedAno, setSelectedAno] = useState<string | undefined>(undefined)

  // Cache para evitar requisições desnecessárias
  const [cache, setCache] = useState<Record<string, any>>({})

  // Carregar marcas quando o tipo de veículo mudar
  useEffect(() => {
    if (!tipoVeiculo) return

    const carregarMarcas = async () => {
      setLoading(prev => ({ ...prev, marcas: true }))
      setErrors(prev => ({ ...prev, marcas: null }))

      try {
        const cacheKey = `marcas-${tipoVeiculo}`
        
        if (enableCache && cache[cacheKey]) {
          setData(prev => ({ ...prev, marcas: cache[cacheKey] }))
        } else {
          const marcas = await buscarMarcas(tipoVeiculo)
          setData(prev => ({ ...prev, marcas }))
          
          if (enableCache) {
            setCache(prev => ({ ...prev, [cacheKey]: marcas }))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar marcas:', error)
        setErrors(prev => ({ ...prev, marcas: 'Erro ao carregar marcas' }))
      } finally {
        setLoading(prev => ({ ...prev, marcas: false }))
      }
    }

    carregarMarcas()
  }, [tipoVeiculo, enableCache, cache])

  // Carregar modelos quando a marca for selecionada
  useEffect(() => {
    if (!selectedMarca || !tipoVeiculo) return

    const carregarModelos = async () => {
      setLoading(prev => ({ ...prev, modelos: true }))
      setErrors(prev => ({ ...prev, modelos: null }))

      try {
        const cacheKey = `modelos-${tipoVeiculo}-${selectedMarca}`
        
        if (enableCache && cache[cacheKey]) {
          setData(prev => ({ ...prev, modelos: cache[cacheKey] }))
        } else {
          const modelos = await buscarModelos(tipoVeiculo, selectedMarca)
          setData(prev => ({ ...prev, modelos }))
          
          if (enableCache) {
            setCache(prev => ({ ...prev, [cacheKey]: modelos }))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar modelos:', error)
        setErrors(prev => ({ ...prev, modelos: 'Erro ao carregar modelos' }))
      } finally {
        setLoading(prev => ({ ...prev, modelos: false }))
      }
    }

    carregarModelos()
  }, [selectedMarca, tipoVeiculo, enableCache, cache])

  // Carregar anos quando o modelo for selecionado
  useEffect(() => {
    if (!selectedModelo || !selectedMarca || !tipoVeiculo) return

    const carregarAnos = async () => {
      setLoading(prev => ({ ...prev, anos: true }))
      setErrors(prev => ({ ...prev, anos: null }))

      try {
        const cacheKey = `anos-${tipoVeiculo}-${selectedMarca}-${selectedModelo}`
        
        if (enableCache && cache[cacheKey]) {
          setData(prev => ({ ...prev, anos: cache[cacheKey] }))
        } else {
          const anos = await buscarAnos(tipoVeiculo, selectedMarca, selectedModelo)
          setData(prev => ({ ...prev, anos }))
          
          if (enableCache) {
            setCache(prev => ({ ...prev, [cacheKey]: anos }))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar anos:', error)
        setErrors(prev => ({ ...prev, anos: 'Erro ao carregar anos' }))
      } finally {
        setLoading(prev => ({ ...prev, anos: false }))
      }
    }

    carregarAnos()
  }, [selectedModelo, selectedMarca, tipoVeiculo, enableCache, cache])

  // Handlers para mudança de seleção
  const handleMarcaChange = useCallback((codigoMarca: string) => {
    setSelectedMarca(codigoMarca)
    setSelectedModelo(undefined)
    setSelectedAno(undefined)
    setData(prev => ({ ...prev, modelos: [], anos: [], precoFipe: null, valorFipe: 0 }))
  }, [])

  const handleModeloChange = useCallback((codigoModelo: string) => {
    setSelectedModelo(codigoModelo)
    setSelectedAno(undefined)
    setData(prev => ({ ...prev, anos: [], precoFipe: null, valorFipe: 0 }))
  }, [])

  const handleAnoChange = useCallback((codigoAno: string) => {
    setSelectedAno(codigoAno)
  }, [])

  // Buscar preço FIPE
  const buscarPreco = useCallback(async (codigoMarca: string, codigoModelo: string, codigoAno: string) => {
    if (!codigoMarca || !codigoModelo || !codigoAno) return

    setLoading(prev => ({ ...prev, preco: true }))
    setErrors(prev => ({ ...prev, preco: null }))

    try {
      const precoFipe = await buscarPrecoFipe(tipoVeiculo, codigoMarca, codigoModelo, codigoAno)
      const valorFipe = formatarPrecoFipe(precoFipe.price)
      
      setData(prev => ({ ...prev, precoFipe, valorFipe }))
    } catch (error) {
      console.error('Erro ao buscar preço FIPE:', error)
      setErrors(prev => ({ ...prev, preco: 'Erro ao buscar preço FIPE' }))
    } finally {
      setLoading(prev => ({ ...prev, preco: false }))
    }
  }, [tipoVeiculo])

  // Resetar seleções
  const resetarSelecoes = useCallback(() => {
    setSelectedMarca(undefined)
    setSelectedModelo(undefined)
    setSelectedAno(undefined)
    setData(prev => ({ ...prev, modelos: [], anos: [], precoFipe: null, valorFipe: 0 }))
  }, [])

  return {
    data,
    loading,
    errors,
    selectedMarca,
    selectedModelo,
    selectedAno,
    handleMarcaChange,
    handleModeloChange,
    handleAnoChange,
    buscarPreco,
    mapearCombustivelFipe,
    resetarSelecoes
  }
} 