import { createClient } from "./client"

export interface Veiculo {
  id?: string
  codigo_fipe?: string
  marca_nome: string
  modelo_nome: string
  titulo: string
  descricao?: string
  ano_fabricacao: number
  ano_modelo: number
  quilometragem?: number
  preco: number
  tipo_preco?: string
  cor?: string
  combustivel?: string
  cambio?: string
  portas?: number
  final_placa?: string
  status?: string
  destaque?: boolean
  vendido_em?: string
  created_at?: string
  updated_at?: string
  aceita_financiamento?: boolean
  aceita_troca?: boolean
  aceita_parcelamento?: boolean
  parcelas_maximas?: number
  entrada_minima?: number
  foto_principal?: string
  fotos?: string[]
  video?: string
  estado_veiculo?: string
  tipo_veiculo?: string
  profile_id?: string
  user_id?: string
}

export interface VeiculoFormData {
  // Informações básicas
  marca_nome: string
  modelo_nome: string
  titulo: string
  descricao: string
  codigo_fipe?: string
  tipo_veiculo: string

  // Especificações técnicas
  ano_fabricacao: number
  ano_modelo: number
  quilometragem: number
  cor: string
  combustivel: string
  cambio: string
  portas: number
  final_placa: string
  estado_veiculo: string

  // Preço e condições
  preco: number
  tipo_preco: string
  aceita_financiamento: boolean
  aceita_troca: boolean
  aceita_parcelamento: boolean
  parcelas_maximas?: number
  entrada_minima?: number

  // Mídia
  foto_principal?: string
  fotos: string[]
  video?: string

  // Status
  status: string
  destaque: boolean
}

export const TIPOS_VEICULO = [
  { value: "carro", label: "Carro", icon: "🚗" },
  { value: "moto", label: "Moto", icon: "🏍️" },
  { value: "caminhao", label: "Caminhão", icon: "🚛" },
  { value: "maquina_pesada", label: "Máquina Pesada", icon: "🚜" },
]

export const MARCAS_VEICULOS = {
  carro: [
    "Audi",
    "BMW",
    "Chevrolet",
    "Citroën",
    "Fiat",
    "Ford",
    "Honda",
    "Hyundai",
    "Jeep",
    "Kia",
    "Land Rover",
    "Mercedes-Benz",
    "Mitsubishi",
    "Nissan",
    "Peugeot",
    "Renault",
    "Toyota",
    "Volkswagen",
    "Volvo",
    "Outros",
  ],
  moto: [
    "Honda",
    "Yamaha",
    "Suzuki",
    "Kawasaki",
    "Ducati",
    "BMW",
    "Harley-Davidson",
    "Triumph",
    "KTM",
    "Aprilia",
    "Dafra",
    "Shineray",
    "Traxx",
    "Outros",
  ],
  caminhao: [
    "Mercedes-Benz",
    "Volvo",
    "Scania",
    "Iveco",
    "Ford",
    "Volkswagen",
    "DAF",
    "MAN",
    "Renault",
    "Agrale",
    "International",
    "Outros",
  ],
  maquina_pesada: [
    "Caterpillar",
    "Komatsu",
    "JCB",
    "Case",
    "New Holland",
    "Liebherr",
    "Hitachi",
    "Volvo",
    "Doosan",
    "Hyundai",
    "XCMG",
    "Outros",
  ],
}

export const COMBUSTIVEIS = {
  carro: ["Flex", "Gasolina", "Etanol", "Diesel", "Elétrico", "Híbrido", "GNV"],
  moto: ["Gasolina", "Etanol", "Elétrico"],
  caminhao: ["Diesel", "Elétrico", "GNV"],
  maquina_pesada: ["Diesel", "Elétrico", "Híbrido"],
}

export const CAMBIOS = {
  carro: ["Manual", "Automático", "Automatizado", "CVT"],
  moto: ["Manual", "Automático", "CVT"],
  caminhao: ["Manual", "Automatizado", "Automático"],
  maquina_pesada: ["Manual", "Automático", "Hidrostático"],
}

export const CORES = [
  "Branco",
  "Preto",
  "Prata",
  "Cinza",
  "Azul",
  "Vermelho",
  "Verde",
  "Amarelo",
  "Marrom",
  "Bege",
  "Dourado",
  "Laranja",
  "Rosa",
  "Roxo",
  "Outros",
]

export const ESTADOS_VEICULO = ["Novo", "Seminovo", "Usado"]

export const TIPOS_PRECO = ["Fixo", "Negociável", "A combinar"]

export async function createVeiculo(veiculo: VeiculoFormData): Promise<{ data: Veiculo | null; error: any }> {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { data: null, error: { message: "Usuário não autenticado" } }
    }

    // Buscar profile_id do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.warn("Profile não encontrado, continuando sem profile_id")
    }

    const veiculoData = {
      ...veiculo,
      user_id: user.id,
      profile_id: profile?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("veiculos").insert([veiculoData]).select().single()

    return { data, error }
  } catch (error) {
    console.error("Erro ao criar veículo:", error)
    return { data: null, error }
  }
}

export async function updateVeiculo(
  id: string,
  veiculo: Partial<VeiculoFormData>,
): Promise<{ data: Veiculo | null; error: any }> {
  const supabase = createClient()

  try {
    const veiculoData = {
      ...veiculo,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("veiculos").update(veiculoData).eq("id", id).select().single()

    return { data, error }
  } catch (error) {
    console.error("Erro ao atualizar veículo:", error)
    return { data: null, error }
  }
}

export async function getVeiculo(id: string): Promise<{ data: Veiculo | null; error: any }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("veiculos").select("*").eq("id", id).single()

    return { data, error }
  } catch (error) {
    console.error("Erro ao buscar veículo:", error)
    return { data: null, error }
  }
}

export async function getVeiculosUsuario(): Promise<{ data: Veiculo[] | null; error: any }> {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { data: null, error: { message: "Usuário não autenticado" } }
    }

    const { data, error } = await supabase
      .from("veiculos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    return { data, error }
  } catch (error) {
    console.error("Erro ao buscar veículos do usuário:", error)
    return { data: null, error }
  }
}

export async function deleteVeiculo(id: string): Promise<{ error: any }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("veiculos").delete().eq("id", id)

    return { error }
  } catch (error) {
    console.error("Erro ao deletar veículo:", error)
    return { error }
  }
}

export async function getVeiculosPublicos(filters?: {
  tipo_veiculo?: string
  marca?: string
  modelo?: string
  preco_min?: number
  preco_max?: number
  ano_min?: number
  ano_max?: number
  combustivel?: string
  cambio?: string
  estado?: string
  page?: number
  limit?: number
}): Promise<{ data: Veiculo[] | null; error: any; count: number }> {
  const supabase = createClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 12
  const start = (page - 1) * limit
  const end = start + limit - 1

  try {
    // Criar a consulta base
    let query = supabase.from("veiculos").select("*", { count: "exact" }).eq("status", "ativo")

    // Aplicar filtros
    if (filters) {
      if (filters.tipo_veiculo) {
        query = query.eq("tipo_veiculo", filters.tipo_veiculo)
      }
      if (filters.marca) {
        query = query.eq("marca_nome", filters.marca)
      }
      if (filters.modelo) {
        query = query.ilike("modelo_nome", `%${filters.modelo}%`)
      }
      if (filters.preco_min) {
        query = query.gte("preco", filters.preco_min)
      }
      if (filters.preco_max) {
        query = query.lte("preco", filters.preco_max)
      }
      if (filters.ano_min) {
        query = query.gte("ano_fabricacao", filters.ano_min)
      }
      if (filters.ano_max) {
        query = query.lte("ano_fabricacao", filters.ano_max)
      }
      if (filters.combustivel) {
        query = query.eq("combustivel", filters.combustivel)
      }
      if (filters.cambio) {
        query = query.eq("cambio", filters.cambio)
      }
      if (filters.estado) {
        query = query.eq("estado_veiculo", filters.estado)
      }
    }

    // Adicionar ordenação e paginação
    query = query.order("created_at", { ascending: false }).range(start, end)

    // Executar a consulta
    const { data, error, count } = await query

    return { data, error, count: count || 0 }
  } catch (error) {
    console.error("Erro ao buscar veículos públicos:", error)
    return { data: null, error, count: 0 }
  }
}
