import { createClient } from "./client"

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FotoVeiculo {
  url: string
  path?: string
  categoria: FotoCategoria
  isPrincipal: boolean
  ordem?: number
}

export type FotoCategoria =
  | "principal"
  | "frente"
  | "traseira"
  | "lateral_esquerda"
  | "lateral_direita"
  | "interior_dianteiro"
  | "interior_traseiro"
  | "painel"
  | "bancos"
  | "porta_malas"
  | "rodas"
  | "motor"
  | "documentos"
  | "detalhes"
  | "outras"

export const FOTO_CATEGORIAS: { value: FotoCategoria; label: string; icon: string; descricao: string }[] = [
  { value: "principal", label: "Principal", icon: "⭐", descricao: "Foto de destaque do veículo" },
  { value: "frente", label: "Frente", icon: "🚗", descricao: "Vista frontal do veículo" },
  { value: "traseira", label: "Traseira", icon: "🔙", descricao: "Vista traseira do veículo" },
  { value: "lateral_esquerda", label: "Lateral Esquerda", icon: "⬅️", descricao: "Lado esquerdo do veículo" },
  { value: "lateral_direita", label: "Lateral Direita", icon: "➡️", descricao: "Lado direito do veículo" },
  { value: "interior_dianteiro", label: "Interior Dianteiro", icon: "🪑", descricao: "Bancos dianteiros e painel" },
  { value: "interior_traseiro", label: "Interior Traseiro", icon: "🛋️", descricao: "Bancos traseiros" },
  { value: "painel", label: "Painel", icon: "📊", descricao: "Painel de instrumentos" },
  { value: "bancos", label: "Bancos", icon: "💺", descricao: "Detalhes dos bancos" },
  { value: "porta_malas", label: "Porta-malas", icon: "🧳", descricao: "Compartimento de bagagem" },
  { value: "rodas", label: "Rodas", icon: "⚙️", descricao: "Rodas e pneus" },
  { value: "motor", label: "Motor", icon: "🔧", descricao: "Compartimento do motor" },
  { value: "documentos", label: "Documentos", icon: "📄", descricao: "Documentação do veículo" },
  { value: "detalhes", label: "Detalhes", icon: "🔍", descricao: "Detalhes específicos" },
  { value: "outras", label: "Outras", icon: "📷", descricao: "Outras fotos" },
]

// Função para fazer upload de foto de veículo
export async function uploadVeiculoFoto(
  veiculoId: string,
  file: File,
  categoria: FotoCategoria = "outras",
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  const supabase = createClient()

  try {
    // Verificar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      }
    }

    // Validar arquivo
    const validationResult = validateImageFile(file)
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error,
      }
    }

    // Redimensionar imagem se necessário
    const resizedFile = await resizeVeiculoImage(file)

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const fileName = `${user.id}/${veiculoId}/${categoria}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from("veiculos").upload(fileName, resizedFile, {
      cacheControl: "3600",
      upsert: false, // Não substituir, criar novo
    })

    if (error) {
      console.error("Erro no upload:", error)
      return {
        success: false,
        error: `Erro no upload: ${error.message}`,
      }
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("veiculos").getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error("Erro inesperado no upload:", error)
    return {
      success: false,
      error: "Erro inesperado durante o upload",
    }
  }
}

// Função para fazer upload de múltiplas fotos
export async function uploadMultipleVeiculoFotos(
  veiculoId: string,
  files: { file: File; categoria: FotoCategoria }[],
  onProgress?: (index: number, progress: UploadProgress) => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const { file, categoria } = files[i]
    const result = await uploadVeiculoFoto(veiculoId, file, categoria, (progress) => {
      onProgress?.(i, progress)
    })
    results.push(result)
  }

  return results
}

// Função para deletar foto de veículo
export async function deleteVeiculoFoto(fotoPath: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return false
    }

    // Verificar se o path pertence ao usuário
    if (!fotoPath.startsWith(`${user.id}/`)) {
      console.error("Tentativa de deletar arquivo de outro usuário")
      return false
    }

    const { error } = await supabase.storage.from("veiculos").remove([fotoPath])

    if (error) {
      console.error("Erro ao deletar foto:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao deletar foto:", error)
    return false
  }
}

// Função para deletar todas as fotos de um veículo
export async function deleteAllVeiculoFotos(veiculoId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return false
    }

    // Listar todas as fotos do veículo
    const { data: files, error: listError } = await supabase.storage.from("veiculos").list(`${user.id}/${veiculoId}`)

    if (listError) {
      console.error("Erro ao listar fotos:", listError)
      return false
    }

    if (!files || files.length === 0) {
      return true // Nenhuma foto para deletar
    }

    // Deletar todas as fotos
    const filePaths = files.map((file) => `${user.id}/${veiculoId}/${file.name}`)
    const { error: deleteError } = await supabase.storage.from("veiculos").remove(filePaths)

    if (deleteError) {
      console.error("Erro ao deletar fotos:", deleteError)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao deletar fotos:", error)
    return false
  }
}

// Função para obter URL pública de uma foto
export function getVeiculoFotoPublicUrl(fotoPath: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from("veiculos").getPublicUrl(fotoPath)
  return publicUrl
}

// Função para validar arquivo de imagem
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de arquivo
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP.",
    }
  }

  // Verificar tamanho (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Tamanho máximo: 5MB.",
    }
  }

  // Verificar se é realmente uma imagem
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Arquivo deve ser uma imagem.",
    }
  }

  return { valid: true }
}

// Função para redimensionar imagem para veículos
export function resizeVeiculoImage(file: File, maxWidth = 1200, maxHeight = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          } else {
            reject(new Error("Erro ao redimensionar imagem"))
          }
        },
        file.type,
        0.85, // Qualidade (85%)
      )
    }

    img.onerror = () => reject(new Error("Erro ao carregar imagem"))
    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

// Função para converter arquivo para base64 (preview)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Função para extrair path do storage de uma URL
export function extractVeiculoStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const bucketIndex = pathParts.findIndex((part) => part === "veiculos")
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join("/")
    }
    return null
  } catch {
    return null
  }
}

// Função para gerar ID temporário para veículo (antes de salvar no banco)
export function generateTempVeiculoId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

// Função para organizar fotos por categoria
export function organizarFotosPorCategoria(fotos: FotoVeiculo[]): Record<FotoCategoria, FotoVeiculo[]> {
  const fotosOrganizadas: Record<FotoCategoria, FotoVeiculo[]> = {
    principal: [],
    frente: [],
    traseira: [],
    lateral_esquerda: [],
    lateral_direita: [],
    interior_dianteiro: [],
    interior_traseiro: [],
    painel: [],
    bancos: [],
    porta_malas: [],
    rodas: [],
    motor: [],
    documentos: [],
    detalhes: [],
    outras: [],
  }

  fotos.forEach((foto) => {
    fotosOrganizadas[foto.categoria].push(foto)
  })

  return fotosOrganizadas
}

// Função para obter categoria da foto pelo nome do arquivo
export function getCategoriaFromPath(path: string): FotoCategoria {
  const fileName = path.split("/").pop() || ""
  const categoria = fileName.split("-")[0] as FotoCategoria

  if (FOTO_CATEGORIAS.find((cat) => cat.value === categoria)) {
    return categoria
  }

  return "outras"
}
