"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PoliticaPrivacidadePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Política de Uso e Privacidade - RX Veículos</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Informações Básicas</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">1.1 Dados da Empresa</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome da empresa: RX Veículos</li>
              <li>CNPJ: 00.000.000/0001-00</li>
              <li>Endereço: Av. Principal, 1000 - Centro, Cidade - UF</li>
              <li>Email: contato@rxveiculos.com.br</li>
              <li>Telefone: (00) 0000-0000</li>
              <li>Responsável legal: Nome do Responsável</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">1.2 Definições Importantes</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usuário</strong>: Pessoa física ou jurídica que utiliza a plataforma</li>
              <li><strong>Plataforma</strong>: Sistema de marketplace de veículos RX Veículos</li>
              <li><strong>Serviços</strong>: Conjunto de funcionalidades oferecidas pela plataforma</li>
              <li><strong>Dados pessoais</strong>: Informações relacionadas a pessoa identificada ou identificável</li>
              <li><strong>Cookies</strong>: Pequenos arquivos armazenados no dispositivo do usuário</li>
              <li><strong>Dispositivos</strong>: Equipamentos utilizados para acessar a plataforma</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Coleta de Dados</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">2.1 Dados Coletados Diretamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome completo</li>
              <li>Email</li>
              <li>Telefone/WhatsApp</li>
              <li>CPF/CNPJ</li>
              <li>Endereço completo</li>
              <li>Dados bancários (para processamento de pagamentos)</li>
              <li>Fotos de perfil</li>
              <li>Documentos de veículos</li>
              <li>Informações de anúncios</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">2.2 Dados Coletados Automaticamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Endereço IP</li>
              <li>Localização geográfica</li>
              <li>Dispositivo utilizado</li>
              <li>Navegador</li>
              <li>Sistema operacional</li>
              <li>Cookies</li>
              <li>Histórico de navegação na plataforma</li>
              <li>Interações com anúncios</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Uso dos Dados</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">3.1 Finalidades do Uso</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificação e autenticação do usuário</li>
              <li>Prestação dos serviços contratados</li>
              <li>Processamento de pagamentos e assinaturas</li>
              <li>Comunicações sobre serviços e atualizações</li>
              <li>Marketing e publicidade direcionada</li>
              <li>Melhorias na plataforma e experiência do usuário</li>
              <li>Cumprimento de obrigações legais</li>
              <li>Prevenção de fraudes e segurança</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">3.2 Base Legal para Tratamento</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consentimento do usuário</li>
              <li>Execução de contrato</li>
              <li>Cumprimento de obrigação legal</li>
              <li>Interesse legítimo</li>
              <li>Proteção ao crédito</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Compartilhamento de Dados</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">4.1 Parceiros e Terceiros</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Asaas (processamento de pagamentos)</li>
              <li>Serviços de hospedagem em nuvem</li>
              <li>Serviços de análise e métricas</li>
              <li>Provedores de serviços de marketing</li>
              <li>Integrações com APIs (FIPE, CEP, etc.)</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">4.2 Situações de Compartilhamento</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Requisição judicial ou administrativa</li>
              <li>Proteção de direitos da empresa</li>
              <li>Transações comerciais (fusão, aquisição, etc.)</li>
              <li>Prevenção de fraudes</li>
              <li>Processamento de pagamentos</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Direitos do Usuário</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">5.1 Direitos Garantidos</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acesso aos dados pessoais</li>
              <li>Correção de dados incompletos ou desatualizados</li>
              <li>Exclusão de dados</li>
              <li>Portabilidade para outro serviço</li>
              <li>Revogação do consentimento</li>
              <li>Oposição ao tratamento</li>
              <li>Informação sobre compartilhamento</li>
              <li>Reclamação junto à ANPD</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">5.2 Como Exercer os Direitos</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Canal de atendimento: privacidade@rxveiculos.com.br</li>
              <li>Prazo de resposta: até 15 dias</li>
              <li>Verificação de identidade necessária</li>
              <li>Possíveis limitações técnicas ou legais</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Segurança dos Dados</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">6.1 Medidas de Proteção</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia em transmissão e armazenamento</li>
              <li>Controle de acesso restrito</li>
              <li>Monitoramento contínuo</li>
              <li>Backup regular</li>
              <li>Auditorias de segurança</li>
              <li>Treinamento da equipe</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">6.2 Tempo de Retenção</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Período de armazenamento: durante uso + obrigações legais</li>
              <li>Critérios de exclusão</li>
              <li>Backup e arquivamento seguro</li>
              <li>Anonimização quando possível</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Cookies e Tecnologias</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">7.1 Tipos de Cookies</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Necessários: funcionamento básico</li>
              <li>Funcionais: preferências e personalização</li>
              <li>Analíticos: métricas e desempenho</li>
              <li>Marketing: publicidade direcionada</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">7.2 Controle de Cookies</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configurações do navegador</li>
              <li>Opções de desativação</li>
              <li>Consequências da desativação</li>
              <li>Política específica de cookies</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Alterações na Política</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">8.1 Atualizações</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Notificação prévia de mudanças significativas</li>
              <li>Continuidade do uso como aceitação</li>
              <li>Arquivo de versões anteriores</li>
              <li>Data da última atualização: 01/06/2024</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">8.2 Contato</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dúvidas: privacidade@rxveiculos.com.br</li>
              <li>Suporte: suporte@rxveiculos.com.br</li>
              <li>DPO: dpo@rxveiculos.com.br</li>
              <li>Prazo de resposta: até 5 dias úteis</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Legislação Aplicável</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">9.1 Base Legal</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Lei Geral de Proteção de Dados (13.709/2018)</li>
              <li>Código de Defesa do Consumidor</li>
              <li>Marco Civil da Internet</li>
              <li>Demais legislações aplicáveis</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">9.2 Foro</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Jurisdição: São Paulo/SP</li>
              <li>Resolução de conflitos</li>
              <li>Mediação prévia quando aplicável</li>
            </ul>
          </div>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">Esta política de privacidade foi atualizada pela última vez em 01/06/2024.</p>
          <div className="mt-4">
            <Link href="/termos-condicoes">
              <Button variant="outline" className="text-sm">Ver Termos e Condições</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}