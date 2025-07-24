'use client'

import { WhatsAppFloatButton, WhatsAppFloatButtonCompact, WhatsAppInlineButton } from '@/components/whatsapp-float-button'

export default function TesteWhatsAppPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Teste - Botões WhatsApp</h1>
        
        <div className="grid gap-8">
          {/* Informações sobre os botões */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Botões Disponíveis</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-green-600">1. Botão Flutuante (Padrão)</h3>
                <p className="text-sm text-gray-600">
                  Aparece fixo no canto inferior direito, visível em todas as páginas.
                  Inclui tooltip, indicador de horário comercial e animações.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-green-600">2. Botão Compacto</h3>
                <p className="text-sm text-gray-600">
                  Versão menor e mais simples, ideal para dispositivos móveis.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-green-600">3. Botão Inline</h3>
                <p className="text-sm text-gray-600">
                  Para usar dentro de cards, seções ou formulários.
                </p>
              </div>
            </div>
          </div>

          {/* Exemplos de botões inline */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Botões Inline - Exemplos</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <WhatsAppInlineButton
                  context="veiculo"
                  message="Olá! Vi um veículo no site e gostaria de mais informações."
                >
                  Falar sobre Veículo
                </WhatsAppInlineButton>
                
                <WhatsAppInlineButton
                  context="agencia"
                  variant="outline"
                  message="Olá! Sou uma agência e gostaria de saber sobre parcerias."
                >
                  Parcerias Agências
                </WhatsAppInlineButton>
                
                <WhatsAppInlineButton
                  context="planos"
                  variant="ghost"
                  message="Olá! Gostaria de saber mais sobre os planos de assinatura."
                >
                  Dúvidas sobre Planos
                </WhatsAppInlineButton>
              </div>
            </div>
          </div>

          {/* Card de exemplo com WhatsApp */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Exemplo em Card de Veículo</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center">
                  🚗
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Honda Civic 2022</h3>
                  <p className="text-gray-600">1.5 Turbo CVT</p>
                  <p className="text-lg font-bold text-green-600">R$ 89.900</p>
                </div>
                <div className="flex flex-col gap-2">
                  <WhatsAppInlineButton
                    context="veiculo"
                    message="Olá! Vi o Honda Civic 2022 no site e gostaria de mais informações."
                    className="text-sm px-3 py-1"
                  >
                    Tenho Interesse
                  </WhatsAppInlineButton>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Configurações</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Número:</strong> (73) 99937-7300</p>
              <p><strong>Horário Comercial:</strong> Segunda a Sexta, 08:00 às 18:00</p>
              <p><strong>Mensagem Padrão:</strong> "Olá! Gostaria de saber mais informações sobre os veículos da RX Autos."</p>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Funcionalidades Implementadas</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Botão flutuante fixo em todas as páginas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Tooltip interativo com informações
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Indicador de horário comercial
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Mensagens contextuais por seção
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Animações e efeitos visuais
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Design responsivo
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Acessibilidade (ARIA labels)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 