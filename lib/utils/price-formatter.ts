/**
 * Formata valores monetários de forma mais amigável
 * Exemplos:
 * - R$ 57.000 -> "57 mil"
 * - R$ 50.900 -> "50.9 mil"
 * - R$ 1.200.000 -> "1.2 milhão"
 * - R$ 850 -> "R$ 850"
 */
export function formatFriendlyPrice(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value
  
  if (isNaN(numValue) || numValue <= 0) {
    return 'Consulte'
  }

  // Para valores menores que 1000, exibe o valor completo
  if (numValue < 1000) {
    return `R$ ${numValue.toLocaleString('pt-BR')}`
  }

  // Para valores entre 1000 e 999999 (milhares)
  if (numValue < 1000000) {
    const thousands = numValue / 1000
    
    // Se for um número inteiro de milhares
    if (thousands % 1 === 0) {
      return `${thousands.toLocaleString('pt-BR')} mil`
    }
    
    // Se tiver decimais, mostra até 1 casa decimal
    const rounded = Math.round(thousands * 10) / 10
    return `${rounded.toLocaleString('pt-BR')} mil`
  }

  // Para valores de 1 milhão ou mais
  const millions = numValue / 1000000
  
  // Se for um número inteiro de milhões
  if (millions % 1 === 0) {
    return `${millions.toLocaleString('pt-BR')} ${millions === 1 ? 'milhão' : 'milhões'}`
  }
  
  // Se tiver decimais, mostra até 1 casa decimal
  const rounded = Math.round(millions * 10) / 10
  return `${rounded.toLocaleString('pt-BR')} ${rounded === 1 ? 'milhão' : 'milhões'}`
}

/**
 * Formata preço com prefixo "A partir de" quando necessário
 */
export function formatPriceWithPrefix(value: number | string, showPrefix: boolean = false): string {
  const formattedPrice = formatFriendlyPrice(value)
  return showPrefix ? `A partir de ${formattedPrice}` : formattedPrice
}