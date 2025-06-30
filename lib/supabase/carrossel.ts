import { createClient } from "./client"

export interface ImagemCarrossel {
  id: string
  url: string
  titulo: string
  descricao: string
  ordem: number
  ativo: boolean
}

// Função para obter todas as imagens do carrossel
export async function getImagensCarrossel(): Promise<ImagemCarrossel[]> {
  const supabase = createClient()

  try {
    console.log("🎠 Buscando imagens da tabela carrossel...")

    const { data, error } = await supabase.from("carrossel").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("❌ Erro ao buscar imagens:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.log("⚠️ Nenhuma linha encontrada na tabela carrossel")
      return []
    }

    // Converter as múltiplas colunas URL em array de imagens
    const imagens: ImagemCarrossel[] = []

    data.forEach((row, rowIndex) => {
      // Verificar cada coluna de URL (url_1 até url_6)
      for (let i = 1; i <= 6; i++) {
        const urlKey = `url_${i}`
        const url = row[urlKey]

        if (url && url.trim()) {
          imagens.push({
            id: `${row.id}_${i}`, // ID único combinando row ID + número da URL
            url: url.trim(),
            titulo: `Imagem ${imagens.length + 1}`,
            descricao: `Imagem ${imagens.length + 1} do carrossel`,
            ordem: imagens.length + 1,
            ativo: true,
          })
        }
      }
    })

    console.log(`✅ ${imagens.length} imagens válidas encontradas`)
    return imagens
  } catch (error) {
    console.error("💥 Erro inesperado:", error)
    return []
  }
}

// Função para obter todas as imagens para admin (mesmo que a função acima neste caso)
export async function getTodasImagensCarrossel(): Promise<ImagemCarrossel[]> {
  return getImagensCarrossel()
}

// Função para adicionar nova imagem
export async function adicionarImagemCarrossel(url: string, titulo?: string, descricao?: string): Promise<boolean> {
  const supabase = createClient()

  try {
    console.log("➕ Adicionando nova imagem...")

    // Buscar a primeira linha da tabela (assumindo que há apenas uma linha de configuração)
    const { data: existingData, error: fetchError } = await supabase.from("carrossel").select("*").limit(1).single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("❌ Erro ao buscar dados existentes:", fetchError)
      return false
    }

    const updateData: any = {}
    let foundEmptySlot = false

    if (existingData) {
      // Procurar primeiro slot vazio
      for (let i = 1; i <= 6; i++) {
        const urlKey = `url_${i}`
        if (!existingData[urlKey] || !existingData[urlKey].trim()) {
          updateData[urlKey] = url.trim()
          foundEmptySlot = true
          break
        }
      }

      if (foundEmptySlot) {
        // Atualizar linha existente
        const { error } = await supabase.from("carrossel").update(updateData).eq("id", existingData.id)

        if (error) {
          console.error("❌ Erro ao atualizar:", error)
          return false
        }
      } else {
        console.log("⚠️ Todos os slots de URL estão ocupados (máximo 6 imagens)")
        return false
      }
    } else {
      // Criar nova linha se não existir
      updateData.url_1 = url.trim()

      const { error } = await supabase.from("carrossel").insert(updateData)

      if (error) {
        console.error("❌ Erro ao inserir:", error)
        return false
      }
    }

    console.log("✅ Imagem adicionada com sucesso")
    return true
  } catch (error) {
    console.error("💥 Erro inesperado ao adicionar:", error)
    return false
  }
}

// Função para remover imagem
export async function removerImagemCarrossel(imageId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    console.log("🗑️ Removendo imagem:", imageId)

    // Extrair row ID e URL index do imageId (formato: "rowId_urlIndex")
    const [rowId, urlIndex] = imageId.split("_")
    const urlKey = `url_${urlIndex}`

    // Buscar a linha
    const { data: existingData, error: fetchError } = await supabase
      .from("carrossel")
      .select("*")
      .eq("id", rowId)
      .single()

    if (fetchError) {
      console.error("❌ Erro ao buscar linha:", fetchError)
      return false
    }

    // Limpar a URL específica
    const updateData = { [urlKey]: null }

    const { error } = await supabase.from("carrossel").update(updateData).eq("id", rowId)

    if (error) {
      console.error("❌ Erro ao remover:", error)
      return false
    }

    console.log("✅ Imagem removida com sucesso")
    return true
  } catch (error) {
    console.error("💥 Erro inesperado ao remover:", error)
    return false
  }
}

// Função para limpar todas as imagens
export async function limparTodasImagensCarrossel(): Promise<boolean> {
  const supabase = createClient()

  try {
    console.log("🧹 Limpando todas as imagens...")

    // Buscar todas as linhas
    const { data: allRows, error: fetchError } = await supabase.from("carrossel").select("id")

    if (fetchError) {
      console.error("❌ Erro ao buscar linhas:", fetchError)
      return false
    }

    if (!allRows || allRows.length === 0) {
      console.log("⚠️ Nenhuma linha encontrada")
      return true
    }

    // Limpar todas as URLs de todas as linhas
    const updateData = {
      url_1: null,
      url_2: null,
      url_3: null,
      url_4: null,
      url_5: null,
      url_6: null,
    }

    for (const row of allRows) {
      const { error } = await supabase.from("carrossel").update(updateData).eq("id", row.id)

      if (error) {
        console.error("❌ Erro ao limpar linha:", row.id, error)
      }
    }

    console.log("✅ Todas as imagens foram removidas")
    return true
  } catch (error) {
    console.error("💥 Erro inesperado ao limpar:", error)
    return false
  }
}

// Função para adicionar múltiplas URLs de uma vez
export async function adicionarMultiplasImagensCarrossel(urls: string[]): Promise<boolean> {
  const supabase = createClient()

  try {
    console.log("📝 Adicionando múltiplas imagens...")

    // Limitar a 6 URLs (máximo de slots disponíveis)
    const urlsLimitadas = urls.slice(0, 6).filter((url) => url && url.trim())

    if (urlsLimitadas.length === 0) {
      console.log("⚠️ Nenhuma URL válida fornecida")
      return true
    }

    // Limpar imagens existentes primeiro
    await limparTodasImagensCarrossel()

    // Preparar dados para inserção/atualização
    const updateData: any = {}
    urlsLimitadas.forEach((url, index) => {
      updateData[`url_${index + 1}`] = url.trim()
    })

    // Verificar se já existe uma linha
    const { data: existingData, error: fetchError } = await supabase.from("carrossel").select("id").limit(1).single()

    if (existingData) {
      // Atualizar linha existente
      const { error } = await supabase.from("carrossel").update(updateData).eq("id", existingData.id)

      if (error) {
        console.error("❌ Erro ao atualizar múltiplas imagens:", error)
        return false
      }
    } else {
      // Criar nova linha
      const { error } = await supabase.from("carrossel").insert(updateData)

      if (error) {
        console.error("❌ Erro ao inserir múltiplas imagens:", error)
        return false
      }
    }

    console.log(`✅ ${urlsLimitadas.length} imagens adicionadas com sucesso`)
    return true
  } catch (error) {
    console.error("💥 Erro inesperado ao adicionar múltiplas imagens:", error)
    return false
  }
}

// Função para testar conexão e estrutura da tabela
export async function testarTabelaCarrossel(): Promise<void> {
  const supabase = createClient()

  try {
    console.log("=== 🧪 TESTE DA TABELA CARROSSEL ===")

    const { data, error } = await supabase.from("carrossel").select("*")

    if (error) {
      console.error("❌ Erro ao acessar tabela:", error)
      return
    }

    console.log("✅ Tabela acessível!")

    if (!data || data.length === 0) {
      console.log("⚠️ Tabela existe mas está vazia")
      console.log("📋 Estrutura esperada: id, created_at, url_1, url_2, url_3, url_4, url_5, url_6")
      return
    }

    console.log("📋 Estrutura da primeira linha:", Object.keys(data[0]))
    console.log("📄 Dados da primeira linha:", data[0])
    console.log(`📊 Total de linhas na tabela: ${data.length}`)

    // Contar URLs preenchidas
    let totalUrls = 0
    data.forEach((row) => {
      for (let i = 1; i <= 6; i++) {
        if (row[`url_${i}`] && row[`url_${i}`].trim()) {
          totalUrls++
        }
      }
    })

    console.log(`🖼️ Total de URLs preenchidas: ${totalUrls}`)
  } catch (error) {
    console.error("❌ Erro inesperado no teste:", error)
  }
}

// Funções de compatibilidade (não aplicáveis a esta estrutura)
export async function atualizarImagemCarrossel(): Promise<boolean> {
  console.log("⚠️ Função não aplicável a esta estrutura de tabela")
  return false
}

export async function toggleImagemCarrossel(): Promise<boolean> {
  console.log("⚠️ Função não aplicável a esta estrutura de tabela")
  return false
}

export async function reordenarImagensCarrossel(): Promise<boolean> {
  console.log("⚠️ Função não aplicável a esta estrutura de tabela")
  return false
}
