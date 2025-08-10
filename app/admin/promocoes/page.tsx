"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Plus, Edit, BarChart3, Calendar, Users, TrendingUp, Gift, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  getCampaignStatistics, 
  toggleCampaignStatus, 
  createPromotionalCampaign,
  type CampaignStatistics 
} from "@/lib/supabase/promotions"

export default function AdminPromocoesPage() {
  const [campaigns, setCampaigns] = useState<CampaignStatistics[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()

  // Estados do formulário de criação
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    free_days: 30,
    start_date: '',
    end_date: '',
    is_active: true,
    applies_to_new_users: true,
    requires_valid_document: true,
    max_uses: null as number | null
  })

  // Carregar campanhas
  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const data = await getCampaignStatistics()
      setCampaigns(data)
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar campanhas promocionais",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  // Alternar status da campanha
  const handleToggleStatus = async (campaignId: string, currentStatus: boolean) => {
    try {
      const result = await toggleCampaignStatus(campaignId, !currentStatus)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message
        })
        loadCampaigns() // Recarregar dados
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar campanha",
        variant: "destructive"
      })
    }
  }

  // Criar nova campanha
  const handleCreateCampaign = async () => {
    try {
      setCreating(true)
      
      const result = await createPromotionalCampaign(newCampaign)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message
        })
        setShowCreateForm(false)
        setNewCampaign({
          name: '',
          description: '',
          free_days: 30,
          start_date: '',
          end_date: '',
          is_active: true,
          applies_to_new_users: true,
          requires_valid_document: true,
          max_uses: null
        })
        loadCampaigns()
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar campanha",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  // Formatar data para display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Indefinida'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Calcular taxa de conversão
  const getConversionRate = (campaign: CampaignStatistics) => {
    if (campaign.total_users_enrolled === 0) return 0
    return (campaign.converted_to_paid / campaign.total_users_enrolled) * 100
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Administração de Promoções
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Gerencie campanhas promocionais de 30 dias gratuitos
                </p>
              </div>
              
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
            <TabsTrigger value="create" className={showCreateForm ? "bg-green-100" : ""}>
              Criar Campanha
            </TabsTrigger>
          </TabsList>

          {/* Lista de Campanhas */}
          <TabsContent value="campaigns" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Carregando campanhas...</div>
            ) : campaigns.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma campanha encontrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comece criando sua primeira campanha promocional
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <Badge variant={campaign.is_active ? "default" : "secondary"}>
                              {campaign.is_active ? (
                                <><CheckCircle className="h-3 w-3 mr-1" />Ativa</>
                              ) : (
                                <><XCircle className="h-3 w-3 mr-1" />Inativa</>
                              )}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">
                            {campaign.description || 'Sem descrição'}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Dias gratuitos:</span>
                              <div className="font-semibold">{campaign.free_days} dias</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Período:</span>
                              <div className="font-semibold">
                                {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Inscritos:</span>
                              <div className="font-semibold">{campaign.total_users_enrolled}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Conversão:</span>
                              <div className="font-semibold">{getConversionRate(campaign).toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <div className="text-gray-500">Status</div>
                            <Switch
                              checked={campaign.is_active}
                              onCheckedChange={() => handleToggleStatus(campaign.id, campaign.is_active)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {campaign.active_promotional_users}
                          </div>
                          <div className="text-xs text-gray-600">Ativos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {campaign.expired_promotional_users}
                          </div>
                          <div className="text-xs text-gray-600">Expirados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {campaign.converted_to_paid}
                          </div>
                          <div className="text-xs text-gray-600">Convertidos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-600">
                            {campaign.current_uses}
                          </div>
                          <div className="text-xs text-gray-600">Usos Totais</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Estatísticas Gerais */}
          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Resumo geral */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {campaigns.reduce((sum, c) => sum + c.total_users_enrolled, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total de Usuários</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {campaigns.reduce((sum, c) => sum + c.active_promotional_users, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Usuários Ativos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {campaigns.reduce((sum, c) => sum + c.converted_to_paid, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Convertidos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {campaigns.length > 0 ? (
                          (campaigns.reduce((sum, c) => sum + getConversionRate(c), 0) / campaigns.length).toFixed(1)
                        ) : (
                          '0.0'
                        )}%
                      </div>
                      <div className="text-sm text-gray-600">Taxa Média</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Formulário de Criação */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Campanha Promocional</CardTitle>
                <p className="text-gray-600">
                  Configure uma nova campanha de dias gratuitos para novos usuários
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Campanha *</Label>
                    <Input
                      id="name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Promoção Verão 2025"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="free_days">Dias Gratuitos *</Label>
                    <Input
                      id="free_days"
                      type="number"
                      min="1"
                      max="365"
                      value={newCampaign.free_days}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, free_days: parseInt(e.target.value) || 30 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva os detalhes da promoção..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data de Início</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={newCampaign.start_date}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Data de Fim</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={newCampaign.end_date}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_uses">Limite de Usos (opcional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    value={newCampaign.max_uses || ''}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      max_uses: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    placeholder="Deixe vazio para ilimitado"
                  />
                </div>

                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Configurações</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Campanha Ativa</div>
                      <div className="text-sm text-gray-600">
                        Se a campanha estará ativa imediatamente
                      </div>
                    </div>
                    <Switch
                      checked={newCampaign.is_active}
                      onCheckedChange={(checked) => setNewCampaign(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Apenas Novos Usuários</div>
                      <div className="text-sm text-gray-600">
                        Se aplica apenas a novos cadastros
                      </div>
                    </div>
                    <Switch
                      checked={newCampaign.applies_to_new_users}
                      onCheckedChange={(checked) => setNewCampaign(prev => ({ ...prev, applies_to_new_users: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Exigir Documento Válido</div>
                      <div className="text-sm text-gray-600">
                        Requer CPF ou CNPJ válido para ativar
                      </div>
                    </div>
                    <Switch
                      checked={newCampaign.requires_valid_document}
                      onCheckedChange={(checked) => setNewCampaign(prev => ({ ...prev, requires_valid_document: checked }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={creating || !newCampaign.name}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {creating ? "Criando..." : "Criar Campanha"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}