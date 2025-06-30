"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAsaas } from "@/hooks/use-asaas"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TesteCpfPage() {
  const [cpf, setCpf] = useState("")
  const [resultado, setResultado] = useState<{ valido: boolean; mensagem: string } | null>(null)
  const { validateCpfCnpj, formatCpfCnpj } = useAsaas()

  // CPFs de teste conhecidos
  const cpfsValidos = [
    "11144477735", // Válido
    "22233344456", // Válido
    "33366699988", // Válido
    "12345678909", // Válido
    "98765432100", // Válido
  ]

  const cpfsInvalidos = [
    "11111111111", // Todos iguais
    "00000000000", // Todos zeros
    "12345678901", // Dígitos verificadores incorretos
    "24971563792", // O que estava sendo usado antes (inválido)
    "86423335882", // O que estava sendo usado antes (inválido)
  ]

  const testeCpf = () => {
    if (!cpf) {
      setResultado({ valido: false, mensagem: "Digite um CPF" })
      return
    }

    const isValid = validateCpfCnpj(cpf)
    setResultado({
      valido: isValid,
      mensagem: isValid ? "CPF válido!" : "CPF inválido!"
    })
  }

  const testarCpf = (cpfTeste: string) => {
    setCpf(cpfTeste)
    const isValid = validateCpfCnpj(cpfTeste)
    setResultado({
      valido: isValid,
      mensagem: `${cpfTeste}: ${isValid ? "VÁLIDO" : "INVÁLIDO"}`
    })
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste de Validação de CPF</h1>
        <p className="text-gray-600">Verificar se os CPFs são válidos antes de enviar para o Asaas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teste Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Teste Manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cpf">CPF para testar</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="Digite um CPF"
                maxLength={14}
              />
            </div>
            
            <Button onClick={testeCpf} className="w-full">
              Validar CPF
            </Button>

            {resultado && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                resultado.valido ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {resultado.valido ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span>{resultado.mensagem}</span>
              </div>
            )}

            {cpf && (
              <div className="text-sm text-gray-600">
                <strong>Formatado:</strong> {formatCpfCnpj(cpf)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teste Automático */}
        <Card>
          <CardHeader>
            <CardTitle>Teste Automático</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-green-800">CPFs que DEVEM ser válidos:</h3>
              <div className="space-y-2">
                {cpfsValidos.map((cpfTeste) => {
                  const isValid = validateCpfCnpj(cpfTeste)
                  return (
                    <div key={cpfTeste} className="flex items-center justify-between">
                      <button
                        onClick={() => testarCpf(cpfTeste)}
                        className="text-left hover:underline"
                      >
                        {formatCpfCnpj(cpfTeste)}
                      </button>
                      <Badge variant={isValid ? "default" : "destructive"}>
                        {isValid ? "VÁLIDO" : "INVÁLIDO"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-800">CPFs que DEVEM ser inválidos:</h3>
              <div className="space-y-2">
                {cpfsInvalidos.map((cpfTeste) => {
                  const isValid = validateCpfCnpj(cpfTeste)
                  return (
                    <div key={cpfTeste} className="flex items-center justify-between">
                      <button
                        onClick={() => testarCpf(cpfTeste)}
                        className="text-left hover:underline"
                      >
                        {formatCpfCnpj(cpfTeste)}
                      </button>
                      <Badge variant={!isValid ? "default" : "destructive"}>
                        {!isValid ? "INVÁLIDO" : "VÁLIDO (ERRO!)"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>CPFs válidos para usar no teste:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            {cpfsValidos.map(cpf => (
              <li key={cpf}>{formatCpfCnpj(cpf)}</li>
            ))}
          </ul>
          <p className="mt-4 text-gray-600">
            Estes CPFs têm algoritmo de validação correto e devem ser aceitos pelo Asaas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 