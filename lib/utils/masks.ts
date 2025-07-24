// Função para formatar número de telefone/whatsapp
export function formatPhone(value: string): string {
  const numbers = cleanPhone(value)
  
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 3) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7)}`
  return numbers
}

// Função para formatar CEP
export function formatCep(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 8 dígitos
  const cep = numbers.slice(0, 8)
  
  // Aplica a máscara conforme a quantidade de números
  if (cep.length <= 2) {
    return cep
  }
  if (cep.length <= 5) {
    return `${cep.slice(0, 2)}.${cep.slice(2)}`
  }
  if (cep.length <= 8) {
    return `${cep.slice(0, 2)}.${cep.slice(2, 5)}.${cep.slice(5)}`
  }
  return `${cep.slice(0, 2)}.${cep.slice(2, 5)}.${cep.slice(5, 8)}`
}

// Função para limpar telefone (remover tudo exceto números)
export function cleanPhone(value: string): string {
  return value.replace(/\D/g, "")
}

// Função para limpar formatação do CEP
export function cleanCep(value: string): string {
  return value.replace(/\D/g, '')
}

// Função para limpar CNPJ (remover tudo exceto números)
export function cleanCnpj(value: string): string {
  return value.replace(/\D/g, "")
}

// Função para formatar CNPJ
export function formatCnpj(value: string): string {
  const numbers = cleanCnpj(value)
  
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
  if (numbers.length <= 14) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`
  return numbers
}

// Função para validar telefone
export function validatePhone(value: string): boolean {
  // Garantir que estamos trabalhando apenas com números
  const numbers = cleanPhone(value)
  
  // Deve ter entre 10 e 11 dígitos (DDD + número)
  if (numbers.length < 10 || numbers.length > 11) {
    console.log("❌ [VALIDATE-PHONE] Comprimento inválido:", numbers.length)
    return false
  }
  
  // DDD deve começar com um dígito de 1 a 9
  if (!/^[1-9]/.test(numbers)) {
    console.log("❌ [VALIDATE-PHONE] DDD inválido (primeiro dígito):", numbers.slice(0, 1))
    return false
  }
  
  // Segundo dígito do DDD deve ser um número de 1 a 9
  if (!/^[1-9][1-9]/.test(numbers)) {
    console.log("❌ [VALIDATE-PHONE] DDD inválido (segundo dígito):", numbers.slice(1, 2))
    return false
  }
  
  // Se tiver 11 dígitos (celular), o primeiro após o DDD deve ser 9
  if (numbers.length === 11 && numbers[2] !== "9") {
    console.log("❌ [VALIDATE-PHONE] Celular deve começar com 9:", numbers.slice(2, 3))
    return false
  }
  
  // Se tiver 10 dígitos (fixo), o primeiro após o DDD deve ser entre 2 e 8
  if (numbers.length === 10 && (numbers[2] < "2" || numbers[2] > "8")) {
    console.log("❌ [VALIDATE-PHONE] Telefone fixo com primeiro dígito inválido:", numbers.slice(2, 3))
    return false
  }
  
  console.log("✅ [VALIDATE-PHONE] Número válido:", numbers)
  return true
}

// Função para validar CEP
export function validateCep(value: string): boolean {
  const numbers = cleanCep(value)
  return numbers.length === 8
} 

// Função para validar CNPJ
export function validateCnpj(value: string): boolean {
  const numbers = cleanCnpj(value)
  
  // Deve ter 14 dígitos
  if (numbers.length !== 14) {
    console.log("❌ [VALIDATE-CNPJ] Comprimento inválido:", numbers.length)
    return false
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) {
    console.log("❌ [VALIDATE-CNPJ] Dígitos repetidos:", numbers)
    return false
  }

  // Validar dígitos verificadores
  let soma = 0
  let pos = 5

  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    soma += parseInt(numbers[i]) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(numbers[12])) {
    console.log("❌ [VALIDATE-CNPJ] Primeiro dígito verificador inválido")
    return false
  }

  // Segundo dígito verificador
  soma = 0
  pos = 6
  for (let i = 0; i < 13; i++) {
    soma += parseInt(numbers[i]) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(numbers[13])) {
    console.log("❌ [VALIDATE-CNPJ] Segundo dígito verificador inválido")
    return false
  }

  console.log("✅ [VALIDATE-CNPJ] CNPJ válido:", numbers)
  return true
} 