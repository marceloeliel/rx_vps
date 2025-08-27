"use client"
import { useState, useEffect } from "react"
import { getVeiculosPublicos, type Veiculo } from "@/lib/supabase/veiculos"

export default function DebugVeiculosPage() {
  const [vehicles, setVehicles] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const { data, error } = await getVeiculosPublicos({ limit: 5 })
      
      if (error) {
        setError(error.message)
        return
      }
      
      setVehicles(data || [])
      console.log('🚗 Dados dos veículos:', data)
    } catch (err) {
      console.error('Erro ao carregar veículos:', err)
      setError('Erro ao carregar veículos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Veículos</h1>
        <p>Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Veículos</h1>
        <p className="text-red-600">Erro: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Veículos</h1>
      <p className="mb-4">Total de veículos: {vehicles.length}</p>
      
      <div className="space-y-4">
        {vehicles.map((vehicle, index) => (
          <div key={vehicle.id || index} className="border p-4 rounded">
            <h3 className="font-bold">{vehicle.titulo || `${vehicle.marca_nome} ${vehicle.modelo_nome}`}</h3>
            <p><strong>ID:</strong> {vehicle.id}</p>
            <p><strong>Foto Principal:</strong> {vehicle.foto_principal || 'VAZIO'}</p>
            <p><strong>Fotos Array:</strong> {vehicle.fotos ? JSON.stringify(vehicle.fotos) : 'VAZIO'}</p>
            <p><strong>Status:</strong> {vehicle.status}</p>
            <p><strong>User ID:</strong> {vehicle.user_id}</p>
            
            {vehicle.foto_principal && (
              <div className="mt-2">
                <p><strong>Preview da imagem:</strong></p>
                <img 
                  src={vehicle.foto_principal} 
                  alt="Preview" 
                  className="w-32 h-24 object-cover border"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', vehicle.foto_principal)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={() => {
                    console.log('Imagem carregada com sucesso:', vehicle.foto_principal)
                  }}
                />
              </div>
            )}
            
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">Ver dados completos</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(vehicle, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}