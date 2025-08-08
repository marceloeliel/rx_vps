"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermosCondicoesPage() {
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
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Termos e Condições de Uso - RX Veículos</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Aceitação dos Termos</h2>
          
          <div className="mb-6">
            <p className="mb-4 text-gray-700">
              Ao acessar e utilizar a plataforma RX Veículos, você concorda com estes Termos e Condições de Uso, bem como com nossa Política de Privacidade. Se você não concordar com qualquer parte destes termos, solicitamos que não utilize nossos serviços.
            </p>
            <p className="mb-4 text-gray-700">
              Estes termos constituem um acordo legal entre você (pessoa física ou jurídica) e a RX Veículos, estabelecendo as regras para utilização de todos os serviços disponibilizados pela plataforma.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Descrição dos Serviços</h2>
          
          <div className="mb-6">
            <p className="mb-4 text-gray-700">
              A RX Veículos é uma plataforma de marketplace que conecta compradores e vendedores de veículos, oferecendo serviços de anúncios, simulação de financiamento, e intermediação de negociações.
            </p>
            <p className="mb-4 text-gray-700">
              Nossos serviços incluem, mas não se limitam a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Publicação de anúncios de veículos</li>
              <li>Busca e filtro de veículos disponíveis</li>
              <li>Simulação de financiamento e condições de pagamento</li>
              <li>Perfil para vendedores e compradores</li>
              <li>Sistema de mensagens entre usuários</li>
              <li>Avaliação de usuários</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Cadastro e Conta</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">3.1 Requisitos para Cadastro</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Ser maior de 18 anos ou estar legalmente emancipado</li>
              <li>Possuir CPF ou CNPJ válido</li>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Possuir capacidade jurídica para realizar transações</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">3.2 Responsabilidades da Conta</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Manter a confidencialidade de sua senha e dados de acesso</li>
              <li>Não transferir ou compartilhar sua conta com terceiros</li>
              <li>Notificar imediatamente qualquer uso não autorizado</li>
              <li>Responsabilizar-se por todas as atividades realizadas em sua conta</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Anúncios e Transações</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">4.1 Publicação de Anúncios</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Os anúncios devem conter informações precisas e verdadeiras sobre o veículo</li>
              <li>As fotos devem ser reais e atuais do veículo anunciado</li>
              <li>É proibido anunciar veículos com procedência duvidosa ou ilegal</li>
              <li>A RX Veículos se reserva o direito de remover anúncios que violem estes termos</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">4.2 Responsabilidade nas Transações</h3>
            <p className="mb-4 text-gray-700">
              A RX Veículos atua como plataforma intermediária e não é parte nas transações realizadas entre usuários. Portanto:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Não garantimos a qualidade, segurança ou legalidade dos veículos anunciados</li>
              <li>Não nos responsabilizamos por negociações realizadas fora da plataforma</li>
              <li>Recomendamos que todas as verificações necessárias sejam feitas antes da compra</li>
              <li>Sugerimos a utilização de contratos formais para as transações</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Planos e Pagamentos</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">5.1 Planos de Assinatura</h3>
            <p className="mb-4 text-gray-700">
              A RX Veículos oferece diferentes planos de assinatura para vendedores, com variações de recursos e limites de anúncios. Os detalhes específicos de cada plano estão disponíveis na página de planos da plataforma.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-gray-700">5.2 Pagamentos e Renovação</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Os pagamentos são processados através do sistema Asaas</li>
              <li>As assinaturas são renovadas automaticamente, salvo cancelamento prévio</li>
              <li>O cancelamento deve ser solicitado com pelo menos 7 dias de antecedência</li>
              <li>Não realizamos reembolsos proporcionais por cancelamentos no meio do período</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Regras de Conduta</h2>
          
          <div className="mb-6">
            <p className="mb-4 text-gray-700">
              Ao utilizar a plataforma RX Veículos, você concorda em não:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Violar leis ou regulamentos aplicáveis</li>
              <li>Publicar conteúdo falso, enganoso, ofensivo ou ilegal</li>
              <li>Tentar acessar áreas restritas da plataforma</li>
              <li>Utilizar a plataforma para fins fraudulentos</li>
              <li>Interferir no funcionamento normal da plataforma</li>
              <li>Coletar informações de outros usuários sem autorização</li>
              <li>Utilizar mecanismos automatizados para acessar a plataforma</li>
              <li>Realizar transações fora da plataforma para evitar taxas</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Propriedade Intelectual</h2>
          
          <div className="mb-6">
            <p className="mb-4 text-gray-700">
              Todo o conteúdo disponibilizado na plataforma RX Veículos, incluindo mas não limitado a textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é de propriedade da RX Veículos ou de seus fornecedores de conteúdo e está protegido pelas leis brasileiras e internacionais de direitos autorais.
            </p>
            <p className="mb-4 text-gray-700">
              É expressamente proibida a reprodução, distribuição, modificação, exibição pública, ou qualquer outro uso do conteúdo da plataforma sem autorização prévia por escrito da RX Veículos.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Limitação de Responsabilidade</h2>
          
          <div className="mb-6">
            <p className="mb-4 text-gray-700">
              A RX Veículos se esforça para manter a plataforma funcionando adequadamente, mas não pode garantir que estará sempre disponível, livre de erros ou segura. Portanto:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais</li>
              <li>Não garantimos a precisão ou completude das informações fornecidas pelos usuários</li>
              <li>Não somos responsáveis por conteúdo de sites externos vinculados à plataforma</li>
              <li>Nossa responsabilidade máxima está limitada ao valor pago pelo usuário pelos serviços</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Modificações dos Termos</h2>
          
          <div className="mb-6">
            <p className="mb-4 text-gray-700">
              A RX Veículos se reserva o direito de modificar estes Termos e Condições a qualquer momento, publicando a versão atualizada na plataforma. As alterações entrarão em vigor imediatamente após sua publicação.
            </p>
            <p className="mb-4 text-gray-700">
              É responsabilidade do usuário verificar periodicamente se houve alterações. O uso continuado da plataforma após a publicação de alterações constitui aceitação dessas alterações.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Disposições Gerais</h2>
          
          <div className="mb-6">
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>Estes Termos constituem o acordo integral entre o usuário e a RX Veículos</li>
              <li>A invalidade de qualquer disposição não afetará as demais disposições</li>
              <li>A falha em exercer qualquer direito não constitui renúncia a esse direito</li>
              <li>Estes Termos são regidos pelas leis brasileiras</li>
              <li>Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias</li>
            </ul>
          </div>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">Estes termos e condições foram atualizados pela última vez em 01/06/2024.</p>
          <div className="mt-4">
            <Link href="/politica-privacidade">
              <Button variant="outline" className="text-sm">Ver Política de Privacidade</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}