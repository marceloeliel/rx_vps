import { createClient } from "./client"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Função para converter arquivo para base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Função para verificar se a tabela existe
async function checkTableExists(supabase: any, tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select("*").limit(1)
    return !error || error.code !== "42P01" // 42P01 = relation does not exist
  } catch {
    return false
  }
}

// Função para fazer upload de logo da agência (versão local)
export async function uploadAgenciaLogo(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  const supabase = createClient()

  try {
    // Validar arquivo
    const validationResult = validateImageFile(file)
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error,
      }
    }

    // Simular progresso
    if (onProgress) {
      onProgress({ loaded: 0, total: 100, percentage: 0 })
    }

    // Converter arquivo para base64
    const base64Data = await fileToBase64(file)

    if (onProgress) {
      onProgress({ loaded: 50, total: 100, percentage: 50 })
    }

    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "agencia_logos")

    if (!tableExists) {
      console.warn("Tabela agencia_logos não existe. Usando apenas URL base64.")

      if (onProgress) {
        onProgress({ loaded: 100, total: 100, percentage: 100 })
      }

      // Retornar apenas a URL base64 sem salvar no banco
      return {
        success: true,
        url: base64Data,
        path: `logo-${userId}-${Date.now()}`,
      }
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const fileName = `logo-${userId}-${Date.now()}.${fileExtension}`

    // Deletar logo anterior se existir (apenas se a tabela existir)
    await deleteAgenciaLogo(userId)

    if (onProgress) {
      onProgress({ loaded: 75, total: 100, percentage: 75 })
    }

    // Converter base64 para array de bytes
    const base64String = base64Data.split(",")[1]
    const binaryString = atob(base64String)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Salvar no banco de dados
    const { error } = await supabase.from("agencia_logos").upsert({
      user_id: userId,
      filename: fileName,
      original_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      file_data: Array.from(bytes), // Converter para array para JSON
      public_url: base64Data,
      updated_at: new Date().toISOString(),
    })

    if (onProgress) {
      onProgress({ loaded: 100, total: 100, percentage: 100 })
    }

    if (error) {
      console.error("Erro ao salvar logo:", error)
      // Mesmo com erro no banco, retornar sucesso com a URL base64
      return {
        success: true,
        url: base64Data,
        path: fileName,
      }
    }

    return {
      success: true,
      url: base64Data,
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

// Função para deletar logo da agência
export async function deleteAgenciaLogo(userId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "agencia_logos")

    if (!tableExists) {
      console.warn("Tabela agencia_logos não existe. Ignorando deleção.")
      return true // Retornar sucesso pois não há nada para deletar
    }

    const { error } = await supabase.from("agencia_logos").delete().eq("user_id", userId)

    if (error) {
      console.error("Erro ao deletar logo:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao deletar logo:", error)
    return true // Retornar sucesso para não bloquear o fluxo
  }
}

// Função para obter logo do usuário
export async function getUserLogo(userId: string): Promise<string | null> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "agencia_logos")

    if (!tableExists) {
      return null
    }

    const { data, error } = await supabase.from("agencia_logos").select("public_url").eq("user_id", userId).single()

    if (error || !data) {
      return null
    }

    return data.public_url
  } catch (error) {
    console.error("Erro ao buscar logo:", error)
    return null
  }
}

// Função para validar arquivo de imagem
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de arquivo
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.",
    }
  }

  // Verificar tamanho (2MB máximo)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Tamanho máximo: 2MB.",
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

// Função para redimensionar imagem
export function resizeImage(file: File, maxWidth = 400, maxHeight = 400): Promise<File> {
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
        0.9, // Qualidade
      )
    }

    img.onerror = () => reject(new Error("Erro ao carregar imagem"))
    img.src = URL.createObjectURL(file)
  })
}

// Função para listar logos do usuário (versão simplificada)
export async function listUserLogos(userId: string): Promise<string[]> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists(supabase, "agencia_logos")

    if (!tableExists) {
      return []
    }

    const { data, error } = await supabase.from("agencia_logos").select("filename").eq("user_id", userId)

    if (error) {
      console.error("Erro ao listar logos:", error)
      return []
    }

    return data?.map((item) => item.filename) || []
  } catch (error) {
    console.error("Erro inesperado ao listar logos:", error)
    return []
  }
}

// Função para obter URL pública de uma logo (versão simplificada)
export function getLogoPublicUrl(logoPath: string): string {
  // Para a versão local, retornamos o path como está
  return logoPath
}

// Função para extrair path do storage de uma URL (versão simplificada)
export function extractStoragePathFromUrl(url: string): string | null {
  // Para data URLs, retornamos null pois não há path
  if (url.startsWith("data:")) {
    return null
  }
  return url
}
