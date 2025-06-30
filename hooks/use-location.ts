"use client"

import { useState, useEffect } from 'react'

interface LocationData {
  city: string
  state: string
  stateCode: string
  country: string
  latitude: number
  longitude: number
}

interface LocationHookReturn {
  location: LocationData | null
  loading: boolean
  error: string | null
  requestLocation: () => void
  hasPermission: boolean
}

// Mapeamento de estados brasileiros para siglas
const ESTADOS_BRASIL: Record<string, string> = {
  'acre': 'AC',
  'alagoas': 'AL',
  'amapá': 'AP',
  'amapa': 'AP',
  'amazonas': 'AM',
  'bahia': 'BA',
  'ceará': 'CE',
  'ceara': 'CE',
  'distrito federal': 'DF',
  'espírito santo': 'ES',
  'espirito santo': 'ES',
  'goiás': 'GO',
  'goias': 'GO',
  'maranhão': 'MA',
  'maranhao': 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  'pará': 'PA',
  'para': 'PA',
  'paraíba': 'PB',
  'paraiba': 'PB',
  'paraná': 'PR',
  'parana': 'PR',
  'pernambuco': 'PE',
  'piauí': 'PI',
  'piaui': 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  'rondônia': 'RO',
  'rondonia': 'RO',
  'roraima': 'RR',
  'santa catarina': 'SC',
  'são paulo': 'SP',
  'sao paulo': 'SP',
  'sergipe': 'SE',
  'tocantins': 'TO'
}

const getStateCode = (stateName: string): string => {
  const normalized = stateName.toLowerCase().trim()
  return ESTADOS_BRASIL[normalized] || stateName.substring(0, 2).toUpperCase()
}

export function useLocation(): LocationHookReturn {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  // Função para obter localização via coordenadas
  const getLocationFromCoords = async (lat: number, lon: number): Promise<LocationData> => {
    try {
      // Usar API de geocoding reverso - OpenStreetMap Nominatim (gratuita)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`
      )
      
      if (!response.ok) {
        throw new Error('Erro ao obter dados de localização')
      }

      const data = await response.json()
      
      // Extrair informações da resposta
      const address = data.address || {}
      const stateName = address.state || 'Estado não encontrado'
      
      return {
        city: address.city || address.town || address.village || 'Cidade não encontrada',
        state: stateName,
        stateCode: getStateCode(stateName),
        country: address.country || 'Brasil',
        latitude: lat,
        longitude: lon
      }
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error)
      throw new Error('Não foi possível obter informações da localização')
    }
  }

  // Função para solicitar localização
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo navegador')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos de cache
          }
        )
      })

      const { latitude, longitude } = position.coords
      
      // Obter informações da cidade/estado
      const locationData = await getLocationFromCoords(latitude, longitude)
      
      setLocation(locationData)
      setHasPermission(true)
      
      // Salvar no localStorage para próximas visitas
      localStorage.setItem('user-location', JSON.stringify({
        ...locationData,
        timestamp: Date.now()
      }))
      
    } catch (error: any) {
      let errorMessage = 'Erro ao obter localização'
      
      if (error.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Permissão de localização negada'
            break
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Localização indisponível'
            break
          case 3: // TIMEOUT
            errorMessage = 'Tempo limite para obter localização'
            break
        }
      }
      
      setError(errorMessage)
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }

  // Carregar localização salva ou solicitar nova
  useEffect(() => {
    const savedLocation = localStorage.getItem('user-location')
    
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000 // 24 horas
        
        if (!isExpired) {
          setLocation({
            city: parsed.city,
            state: parsed.state,
            stateCode: parsed.stateCode || getStateCode(parsed.state || ''),
            country: parsed.country,
            latitude: parsed.latitude,
            longitude: parsed.longitude
          })
          setHasPermission(true)
          return
        } else {
          // Remover se expirado
          localStorage.removeItem('user-location')
        }
      } catch (e) {
        localStorage.removeItem('user-location')
      }
    }

    // Verificar permissão silenciosamente
    if (navigator.geolocation && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setHasPermission(true)
          // Se já tem permissão, pode solicitar automaticamente
          requestLocation()
        } else if (result.state === 'prompt') {
          setHasPermission(false)
        } else {
          setHasPermission(false)
          setError('Permissão de localização negada')
        }
      }).catch(() => {
        // Fallback se não suportar permissions API
        setHasPermission(false)
      })
    }
  }, [])

  return {
    location,
    loading,
    error,
    requestLocation,
    hasPermission
  }
} 