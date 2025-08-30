import { createClient } from './client'

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

// Função para fazer upload de imagem de agência em destaque
export async function uploadFeaturedAgencyImage(
  agencyId: string,
  file: File,
  type: 'image' | 'banner' = 'image',
  onProgress?: (progress: UploadProgress) => void
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

    // Simular progresso inicial
    if (onProgress) {
      onProgress({ loaded: 0, total: 100, percentage: 0 })
    }

    // Redimensionar imagem se necessário
    const resizedFile = await resizeImage(file, type)

    if (onProgress) {
      onProgress({ loaded: 30, total: 100, percentage: 30 })
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileName = `featured-agencies/${agencyId}/${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    if (onProgress) {
      onProgress({ loaded: 50, total: 100, percentage: 50 })
    }

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage
      .from('featured-agencies')
      .upload(fileName, resizedFile, {
        cacheControl: '3600',
        upsert: false, // Não substituir, criar novo
      })

    if (error) {
      console.error('Erro no upload:', error)
      return {
        success: false,
        error: `Erro no upload: ${error.message}`,
      }
    }

    if (onProgress) {
      onProgress({ loaded: 80, total: 100, percentage: 80 })
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('featured-agencies').getPublicUrl(fileName)

    if (onProgress) {
      onProgress({ loaded: 100, total: 100, percentage: 100 })
    }

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error('Erro inesperado no upload:', error)
    return {
      success: false,
      error: 'Erro inesperado durante o upload',
    }
  }
}

// Função para deletar imagem de agência em destaque
export async function deleteFeaturedAgencyImage(imagePath: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from('featured-agencies')
      .remove([imagePath])

    if (error) {
      console.error('Erro ao deletar imagem:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro inesperado ao deletar imagem:', error)
    return false
  }
}

// Função para deletar todas as imagens de uma agência em destaque
export async function deleteAllFeaturedAgencyImages(agencyId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Listar todas as imagens da agência
    const { data: files, error: listError } = await supabase.storage
      .from('featured-agencies')
      .list(`featured-agencies/${agencyId}`)

    if (listError) {
      console.error('Erro ao listar imagens:', listError)
      return false
    }

    if (!files || files.length === 0) {
      return true // Nenhuma imagem para deletar
    }

    // Deletar todas as imagens
    const filePaths = files.map((file) => `featured-agencies/${agencyId}/${file.name}`)
    const { error: deleteError } = await supabase.storage
      .from('featured-agencies')
      .remove(filePaths)

    if (deleteError) {
      console.error('Erro ao deletar imagens:', deleteError)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro inesperado ao deletar imagens:', error)
    return false
  }
}

// Função para obter URL pública de uma imagem
export function getFeaturedAgencyImageUrl(imagePath: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from('featured-agencies').getPublicUrl(imagePath)
  return publicUrl
}

// Função para validar arquivo de imagem
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.',
    }
  }

  // Verificar tamanho (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
    }
  }

  // Verificar se é realmente uma imagem
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Arquivo deve ser uma imagem.',
    }
  }

  return { valid: true }
}

// Função para redimensionar imagem
async function resizeImage(file: File, type: 'image' | 'banner'): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Definir dimensões baseadas no tipo
      let maxWidth: number
      let maxHeight: number

      if (type === 'banner') {
        maxWidth = 1200
        maxHeight = 400
      } else {
        maxWidth = 800
        maxHeight = 600
      }

      // Calcular novas dimensões mantendo proporção
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Redimensionar
      canvas.width = width
      canvas.height = height
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
      }

      // Converter de volta para File
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          } else {
            resolve(file) // Fallback para arquivo original
          }
        },
        file.type,
        0.9 // Qualidade 90%
      )
    }

    img.onerror = () => {
      resolve(file) // Fallback para arquivo original em caso de erro
    }

    img.src = URL.createObjectURL(file)
  })
}

// Função para extrair path do storage de uma URL
export function extractStoragePathFromUrl(url: string): string | null {
  try {
    // Padrão: https://[project].supabase.co/storage/v1/object/public/featured-agencies/[path]
    const match = url.match(/\/storage\/v1\/object\/public\/featured-agencies\/(.+)$/)
    return match ? match[1] : null
  } catch (error) {
    console.error('Erro ao extrair path da URL:', error)
    return null
  }
}