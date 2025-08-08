import { createClient } from './client'
import { createLead } from './vehicle-favorites'

// Interface para os dados da simulação
export interface SimulacaoData {
  // Dados pessoais
  tipoDocumento: 'pf' | 'pj'
  cpfCnpj: string
  nomeCompleto: string
  email: string
  telefone: string
  
  // Dados do veículo
  veiculoId?: string  // ID do veículo específico (opcional)
  placa?: string
  condicaoVeiculo: '0km' | 'seminovo'
  tipoVeiculo: string
  marca: string
  marcaCodigo: string
  modelo: string
  modeloCodigo: string
  anoModelo: string
  anoFabricacao: string
  anoCodigo: string
  versao?: string
  transmissao?: string
  combustivel: string
  codigoFipe: string
  valorVeiculo: string
  entrada: string
  prazo: string
  
  // Para concluir
  tempoFechamento?: string
  viuPessoalmente?: 'sim' | 'nao'
  tipoVendedor?: string
  
  // Resultado
  valorFinanciado: number
  valorParcela: number
  taxaJuros: number
  aprovado: boolean
}

// Interface para simulação salva no banco
export interface SimulacaoSalva {
  id: string
  user_id: string
  veiculo_id?: string  // ID do veículo específico (opcional)
  tipo_documento: string
  cpf_cnpj: string
  nome_completo: string
  email: string
  telefone: string
  placa?: string
  condicao_veiculo: string
  tipo_veiculo: string
  marca: string
  marca_codigo: string
  modelo: string
  modelo_codigo: string
  ano_modelo: number
  ano_fabricacao: number
  ano_codigo: string
  versao?: string
  transmissao?: string
  combustivel: string
  codigo_fipe: string
  valor_veiculo: number
  entrada: number
  prazo: number
  tempo_fechamento?: string
  viu_pessoalmente?: string
  tipo_vendedor?: string
  valor_financiado: number
  valor_parcela: number
  taxa_juros: number
  aprovado: boolean
  created_at: string
  updated_at: string
}

// Função para converter valores monetários de string para número
function parseMoneyValue(value: string): number {
  if (!value) return 0
  // Remove R$, pontos e vírgulas, converte para número
  return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0
}

// Função para salvar simulação
export async function salvarSimulacao(dados: SimulacaoData): Promise<{ data: SimulacaoSalva | null, error: string | null }> {
  try {
    const supabase = createClient()
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { data: null, error: 'Usuário não autenticado' }
    }

    console.log('🔍 [SIMULACAO] Salvando simulação para usuário:', user.id)
    console.log('📋 [SIMULACAO] Dados recebidos:', {
      marca: dados.marca,
      modelo: dados.modelo,
      valorVeiculo: dados.valorVeiculo,
      valorFinanciado: dados.valorFinanciado,
      aprovado: dados.aprovado
    })

    // Preparar dados para inserção
    const dadosParaInserir = {
      user_id: user.id,
      veiculo_id: dados.veiculoId || null,  // ID do veículo específico (opcional)
      tipo_documento: dados.tipoDocumento,
      cpf_cnpj: dados.cpfCnpj,
      nome_completo: dados.nomeCompleto,
      email: dados.email,
      telefone: dados.telefone,
      placa: dados.placa || null,
      condicao_veiculo: dados.condicaoVeiculo,
      tipo_veiculo: dados.tipoVeiculo,
      marca: dados.marca,
      marca_codigo: dados.marcaCodigo,
      modelo: dados.modelo,
      modelo_codigo: dados.modeloCodigo,
      ano_modelo: parseInt(dados.anoModelo) || 0,
      ano_fabricacao: parseInt(dados.anoFabricacao) || 0,
      ano_codigo: dados.anoCodigo,
      versao: dados.versao || null,
      transmissao: dados.transmissao || null,
      combustivel: dados.combustivel,
      codigo_fipe: dados.codigoFipe,
      valor_veiculo: parseMoneyValue(dados.valorVeiculo),
      entrada: parseMoneyValue(dados.entrada),
      prazo: parseInt(dados.prazo) || 0,
      tempo_fechamento: dados.tempoFechamento || null,
      viu_pessoalmente: dados.viuPessoalmente || null,
      tipo_vendedor: dados.tipoVendedor || null,
      valor_financiado: dados.valorFinanciado,
      valor_parcela: dados.valorParcela,
      taxa_juros: dados.taxaJuros,
      aprovado: dados.aprovado
    }

    console.log('💾 [SIMULACAO] Dados preparados para inserção:', {
      ...dadosParaInserir,
      valor_veiculo: dadosParaInserir.valor_veiculo,
      entrada: dadosParaInserir.entrada
    })

    // Inserir no banco
    const { data, error } = await supabase
      .from('simulacoes')
      .insert(dadosParaInserir)
      .select()
      .single()

    if (error) {
      console.error('❌ [SIMULACAO] Erro ao salvar:', error)
      return { data: null, error: error.message }
    }

    console.log('✅ [SIMULACAO] Simulação salva com sucesso:', data.id)
    
    // Se há um veículo específico, criar lead no painel da agência
    if (dados.veiculoId) {
      try {
        // Buscar dados do veículo para obter o user_id da agência
        const { data: veiculo, error: veiculoError } = await supabase
          .from('veiculos')
          .select('user_id')
          .eq('id', dados.veiculoId)
          .single()
        
        if (!veiculoError && veiculo?.user_id) {
          await createLead(user.id, dados.veiculoId, veiculo.user_id, 'simulation')
          console.log('✅ [SIMULACAO] Lead criado no painel da agência para veículo:', dados.veiculoId)
        }
      } catch (leadError) {
        console.log('ℹ️ [SIMULACAO] Não foi possível criar lead no painel da agência:', leadError)
      }
    }
    
    return { data, error: null }

  } catch (error: any) {
    console.error('❌ [SIMULACAO] Erro inesperado:', error)
    return { data: null, error: error.message || 'Erro inesperado ao salvar simulação' }
  }
}

// Função para buscar simulações do usuário
export async function buscarSimulacoesUsuario(): Promise<{ data: SimulacaoSalva[] | null, error: string | null }> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { data: null, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('simulacoes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [SIMULACAO] Erro ao buscar simulações:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }

  } catch (error: any) {
    console.error('❌ [SIMULACAO] Erro inesperado ao buscar:', error)
    return { data: null, error: error.message || 'Erro inesperado ao buscar simulações' }
  }
}

// Função para buscar uma simulação específica
export async function buscarSimulacao(id: string): Promise<{ data: SimulacaoSalva | null, error: string | null }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('simulacoes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ [SIMULACAO] Erro ao buscar simulação:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }

  } catch (error: any) {
    console.error('❌ [SIMULACAO] Erro inesperado ao buscar simulação:', error)
    return { data: null, error: error.message || 'Erro inesperado ao buscar simulação' }
  }
}

// Função para buscar simulações de um veículo específico
export async function buscarSimulacoesPorVeiculo(veiculoId: string): Promise<{ data: SimulacaoSalva[] | null, error: string | null }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('simulacoes')
      .select('*')
      .eq('veiculo_id', veiculoId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [SIMULACAO] Erro ao buscar simulações por veículo:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }

  } catch (error: any) {
    console.error('❌ [SIMULACAO] Erro inesperado ao buscar por veículo:', error)
    return { data: null, error: error.message || 'Erro inesperado ao buscar simulações por veículo' }
  }
}

// Função para deletar simulação
export async function deletarSimulacao(id: string): Promise<{ success: boolean, error: string | null }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('simulacoes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ [SIMULACAO] Erro ao deletar simulação:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [SIMULACAO] Simulação deletada com sucesso:', id)
    return { success: true, error: null }

  } catch (error: any) {
    console.error('❌ [SIMULACAO] Erro inesperado ao deletar:', error)
    return { success: false, error: error.message || 'Erro inesperado ao deletar simulação' }
  }
}