"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TesteValidacaoCartaoPage() {
  const [validade, setValidade] = useState("")
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    type: "success" | "error" | "warning"
  } | null>(null)

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 4) // Limitar a 4 dígitos
    
    if (numbers.length <= 2) {
      return numbers
    }
    
    // Formatar como MM/YY
    const month = numbers.slice(0, 2)
    const year = numbers.slice(2, 4)
    
    // Validar mês enquanto digita
    if (parseInt(month) > 12) {
      return value.slice(0, -1) // Remove o último dígito se mês > 12
    }
    
    return `${month}/${year}`
  }

  const validateExpiry = (validadeValue: string) => {
    if (!validadeValue.trim()) {
      return {
        isValid: false,
        message: "Validade do cartão é obrigatória",
        type: "error" as const
      }
    }
    
    // Validar formato da data de validade (MM/YY)
    const validadeRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!validadeRegex.test(validadeValue)) {
      return {
        isValid: false,
        message: "Validade deve estar no formato MM/AA (ex: 12/26)",
        type: "error" as const
      }
    }
    
    // Validar se a data não está vencida
    const [month, year] = validadeValue.split("/")
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100 // Últimos 2 dígitos
    const currentMonth = currentDate.getMonth() + 1
    
    const cardYear = parseInt(year)
    const cardMonth = parseInt(month)
    
    if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
      return {
        isValid: false,
        message: "Cartão vencido. Verifique a data de validade",
        type: "error" as const
      }
    }

    return {
      isValid: true,
      message: `Data válida: ${month}/${20}${year}`,
      type: "success" as const
    }
  }

  const handleValidadeChange = (value: string) => {
    const formatted = formatExpiry(value)
    setValidade(formatted)
    
    // Validar apenas se tiver formato completo
    if (formatted.length === 5) {
      const result = validateExpiry(formatted)
      setValidationResult(result)
    } else {
      setValidationResult(null)
    }
  }

  const testCases = [
    { input: "1226", expected: "12/26", description: "Formato normal" },
    { input: "1326", expected: "12/6", description: "Mês inválido (13) - deve corrigir" },
    { input: "0525", expected: "05/25", description: "Mês válido com zero" },
    { input: "1234", expected: "12/34", description: "Ano futuro" },
    { input: "0122", expected: "01/22", description: "Data passada (deve dar erro)" },
  ]

  const runTest = (testCase: typeof testCases[0]) => {
    const result = formatExpiry(testCase.input)
    const validation = result.length === 5 ? validateExpiry(result) : null
    
    return {
      input: testCase.input,
      result,
      expected: testCase.expected,
      passed: result === testCase.expected,
      validation
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Validação - Data de Validade do Cartão
          </h1>
          <p className="text-gray-600">
            Teste as correções implementadas na formatação e validação da data de validade
          </p>
        </div>

        {/* Teste Interativo */}
        <Card>
          <CardHeader>
            <CardTitle>Teste Interativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="validade">Digite a validade do cartão:</Label>
              <Input
                id="validade"
                value={validade}
                onChange={(e) => handleValidadeChange(e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
                className="mt-1"
              />
            </div>

            {validationResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                validationResult.type === "success" 
                  ? "bg-green-50 border border-green-200" 
                  : validationResult.type === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}>
                {validationResult.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {validationResult.type === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                {validationResult.type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                <span className={`text-sm font-medium ${
                  validationResult.type === "success" 
                    ? "text-green-800" 
                    : validationResult.type === "error"
                    ? "text-red-800"
                    : "text-yellow-800"
                }`}>
                  {validationResult.message}
                </span>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p><strong>Regras implementadas:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Formato obrigatório: MM/AA (ex: 12/26)</li>
                <li>Mês deve estar entre 01 e 12</li>
                <li>Não permite mês maior que 12 durante a digitação</li>
                <li>Valida se o cartão não está vencido</li>
                <li>Limita entrada a 4 dígitos numéricos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Casos de Teste Automáticos */}
        <Card>
          <CardHeader>
            <CardTitle>Casos de Teste Automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testCases.map((testCase, index) => {
                const result = runTest(testCase)
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Input: <code className="bg-gray-200 px-1 rounded">{result.input}</code>
                      </div>
                      <div className="text-sm text-gray-600">
                        {testCase.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm">
                          Resultado: <code className="bg-gray-200 px-1 rounded">{result.result}</code>
                        </div>
                        <div className="text-xs text-gray-500">
                          Esperado: <code>{result.expected}</code>
                        </div>
                      </div>
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? "✓ PASS" : "✗ FAIL"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Testar no Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">1. Teste com dados válidos:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Validade: 12/26 (dezembro de 2026)</li>
                  <li>Deve aceitar e processar normalmente</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">2. Teste com mês inválido:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Tente digitar: 1326</li>
                  <li>Deve impedir a digitação do "3" (mês 13 é inválido)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">3. Teste com data vencida:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Validade: 01/22 (janeiro de 2022)</li>
                  <li>Deve mostrar erro: "Cartão vencido"</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">4. Teste com formato inválido:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Deixe o campo vazio ou com formato incompleto</li>
                  <li>Deve mostrar erro: "Validade deve estar no formato MM/AA"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = "/checkout?plano=empresarial"}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Testar no Checkout Real
          </Button>
        </div>
      </div>
    </div>
  )
} 