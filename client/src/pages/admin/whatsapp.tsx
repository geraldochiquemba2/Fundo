import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Users, Send, Settings, AlertCircle, CheckCircle, Smartphone, Plus, Link2, Copy, Bot, BarChart3, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WhatsAppGroup {
  id: string;
  name: string;
  active: boolean;
  projectIds?: number[];
  sdgIds?: number[];
}

interface WhatsAppStatus {
  connected: boolean;
  groups: WhatsAppGroup[];
}

export default function WhatsAppManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isPublicGroup, setIsPublicGroup] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testUserId, setTestUserId] = useState("");

  const { data: whatsappStatus, isLoading: statusLoading } = useQuery<WhatsAppStatus>({
    queryKey: ['/api/whatsapp/status'],
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects']
  });

  const { data: sdgs } = useQuery({
    queryKey: ['/api/sdgs']
  });

  const { data: assistantStats } = useQuery({
    queryKey: ['/api/whatsapp/assistant/stats'],
    refetchInterval: 10000 // Update every 10 seconds
  });

  const connectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/whatsapp/connect'),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "WhatsApp conectado",
          description: "Escaneie o QR Code que apareceu no console do servidor"
        });
      } else {
        toast({
          title: "Erro ao conectar",
          description: data.message,
          variant: "destructive"
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
    },
    onError: () => {
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar ao WhatsApp",
        variant: "destructive"
      });
    }
  });

  const configureGroupMutation = useMutation({
    mutationFn: (data: { groupId: string; projectIds?: number[]; sdgIds?: number[]; isPublic?: boolean }) =>
      apiRequest('POST', '/api/whatsapp/configure-group', data),
    onSuccess: () => {
      toast({
        title: "Grupo configurado",
        description: "Grupo configurado com sucesso para receber notificações"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
    },
    onError: () => {
      toast({
        title: "Erro ao configurar",
        description: "Não foi possível configurar o grupo",
        variant: "destructive"
      });
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { groupName: string }) =>
      apiRequest('POST', '/api/whatsapp/create-group', data),
    onSuccess: () => {
      toast({
        title: "Grupo criado",
        description: "Grupo público criado com sucesso"
      });
      setNewGroupName("");
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
    },
    onError: () => {
      toast({
        title: "Erro ao criar",
        description: "Não foi possível criar o grupo",
        variant: "destructive"
      });
    }
  });

  const sendUpdateMutation = useMutation({
    mutationFn: (data: { projectId: number; message: string }) =>
      apiRequest('POST', '/api/whatsapp/send-update', data),
    onSuccess: () => {
      toast({
        title: "Atualização enviada",
        description: "Mensagem enviada para os grupos configurados"
      });
      setUpdateMessage("");
      setSelectedProject("");
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a atualização",
        variant: "destructive"
      });
    }
  });

  const sendReportMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/whatsapp/send-report'),
    onSuccess: () => {
      toast({
        title: "Relatório enviado",
        description: "Relatório semanal enviado para todos os grupos ativos"
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o relatório",
        variant: "destructive"
      });
    }
  });

  const sendTestMessageMutation = useMutation({
    mutationFn: (data: { userId: string; message: string }) =>
      apiRequest('POST', '/api/whatsapp/send-message', data),
    onSuccess: () => {
      toast({
        title: "Mensagem enviada",
        description: "Mensagem de teste enviada com sucesso"
      });
      setTestMessage("");
      setTestUserId("");
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem de teste",
        variant: "destructive"
      });
    }
  });

  const handleConfigureGroup = () => {
    if (!selectedGroup) return;
    
    configureGroupMutation.mutate({
      groupId: selectedGroup,
      isPublic: isPublicGroup
    });
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    createGroupMutation.mutate({
      groupName: newGroupName.trim()
    });
  };

  const handleSendUpdate = () => {
    if (!selectedProject || !updateMessage.trim()) return;
    
    sendUpdateMutation.mutate({
      projectId: parseInt(selectedProject),
      message: updateMessage.trim()
    });
  };

  const handleSendTestMessage = () => {
    if (!testUserId.trim() || !testMessage.trim()) return;
    
    sendTestMessageMutation.mutate({
      userId: testUserId.trim(),
      message: testMessage.trim()
    });
  };

  if (statusLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando status do WhatsApp...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento WhatsApp</h1>
          <p className="text-gray-600">Configure notificações automáticas para grupos do WhatsApp</p>
        </div>
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5" />
          {whatsappStatus?.connected ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <AlertCircle className="w-4 h-4 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="assistant">Assistente</TabsTrigger>
          <TabsTrigger value="create">Criar Grupo</TabsTrigger>
          <TabsTrigger value="groups">Configurar</TabsTrigger>
          <TabsTrigger value="updates">Atualizações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Conexão WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Status: {whatsappStatus?.connected ? "Conectado" : "Desconectado"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Grupos encontrados: {whatsappStatus?.groups?.length || 0}
                  </p>
                </div>
                <Button 
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending || whatsappStatus?.connected}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {connectMutation.isPending ? "Conectando..." : "Conectar WhatsApp"}
                </Button>
              </div>
              
              {!whatsappStatus?.connected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    📱 Para conectar o WhatsApp, clique em "Conectar WhatsApp" e escaneie o QR Code que aparecerá no console do servidor.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Assistente WhatsApp</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">🤖 Assistente Inteligente Ativo</h3>
                  <p className="text-sm text-blue-700">
                    O assistente responde automaticamente a mensagens sobre sustentabilidade, projetos ambientais e ODS usando IA avançada.
                  </p>
                </div>

                {assistantStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{assistantStats.activeConversations}</div>
                      <div className="text-sm text-green-700">Conversas Ativas</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{assistantStats.companyUsers}</div>
                      <div className="text-sm text-blue-700">Empresas</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{assistantStats.publicUsers}</div>
                      <div className="text-sm text-purple-700">Usuários Públicos</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{assistantStats.totalUsers}</div>
                      <div className="text-sm text-orange-700">Total de Usuários</div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800">Funcionalidades do Assistente:</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• Responde perguntas sobre sustentabilidade usando IA</li>
                    <li>• Fornece informações sobre projetos ativos</li>
                    <li>• Explica ODS de forma educativa</li>
                    <li>• Mostra estatísticas de empresas</li>
                    <li>• Detecta automaticamente o tipo de usuário</li>
                    <li>• Mantém contexto da conversa</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Teste do Assistente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-user-id">ID do Usuário (Número WhatsApp)</Label>
                  <Input
                    id="test-user-id"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    placeholder="Ex: 5511999999999@c.us"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-message">Mensagem de Teste</Label>
                  <Textarea
                    id="test-message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Digite uma mensagem para testar o assistente..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSendTestMessage}
                  disabled={!testUserId.trim() || !testMessage.trim() || sendTestMessageMutation.isPending}
                  className="w-full"
                >
                  {sendTestMessageMutation.isPending ? "Enviando..." : "Enviar Mensagem de Teste"}
                </Button>

                <div className="text-sm text-gray-500">
                  <p>Use este formulário para testar o assistente enviando mensagens diretamente para usuários.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Criar Grupo Fundo Verde</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Grupo Público "Fundo Verde"</h3>
                <p className="text-sm text-green-700 mb-3">
                  Este grupo permitirá que qualquer pessoa interessada em sustentabilidade possa participar das discussões sobre projetos ambientais e ODS.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-name">Nome do Grupo</Label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Fundo Verde - Sustentabilidade"
                />
              </div>

              <Button 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || createGroupMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {createGroupMutation.isPending ? "Criando..." : "Criar Grupo Público"}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800">Como funciona:</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Grupo criado automaticamente pelo sistema</li>
                  <li>• Link público gerado para compartilhamento</li>
                  <li>• Página pública disponível em /grupo-fundo-verde</li>
                  <li>• Notificações automáticas de projetos e relatórios</li>
                  <li>• Moderação automática de conteúdo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Configurar Grupos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-select">Selecionar Grupo</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um grupo do WhatsApp" />
                  </SelectTrigger>
                  <SelectContent>
                    {whatsappStatus?.groups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} {group.active && "✅"} {group.isPublic && "🌐"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public-group"
                  checked={isPublicGroup}
                  onChange={(e) => setIsPublicGroup(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="public-group" className="text-sm">
                  Tornar grupo público (gerar link de acesso)
                </Label>
              </div>

              <Button 
                onClick={handleConfigureGroup}
                disabled={!selectedGroup || configureGroupMutation.isPending}
                className="w-full"
              >
                {configureGroupMutation.isPending ? "Configurando..." : "Ativar Notificações"}
              </Button>

              <div className="space-y-2">
                <h3 className="font-semibold">Grupos Ativos:</h3>
                <div className="space-y-2">
                  {whatsappStatus?.groups?.filter(g => g.active).map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{group.name}</span>
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          {group.isPublic && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              <Link2 className="w-3 h-3 mr-1" />
                              Público
                            </Badge>
                          )}
                        </div>
                        {group.inviteLink && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Input
                                value={group.inviteLink}
                                readOnly
                                className="text-xs bg-white"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(group.inviteLink!);
                                  toast({
                                    title: "Link copiado",
                                    description: "Link do grupo copiado para área de transferência"
                                  });
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            {group.name.toLowerCase().includes('fundo verde') && (
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={`${window.location.origin}/grupo-fundo-verde`}
                                  readOnly
                                  className="text-xs bg-blue-50"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/grupo-fundo-verde`);
                                    toast({
                                      title: "Link da página copiado",
                                      description: "Link da página pública copiado"
                                    });
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {whatsappStatus?.groups?.filter(g => g.active).length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum grupo ativo</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Enviar Atualizações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-select">Projeto</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project: any) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-message">Mensagem da Atualização</Label>
                <Textarea
                  id="update-message"
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="Digite a atualização do projeto..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendUpdate}
                disabled={!selectedProject || !updateMessage.trim() || sendUpdateMutation.isPending}
                className="w-full"
              >
                {sendUpdateMutation.isPending ? "Enviando..." : "Enviar Atualização"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Relatórios Automáticos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800">Relatórios Automáticos Configurados:</h3>
                <ul className="mt-2 text-sm text-blue-700">
                  <li>• Relatório semanal: Segundas-feiras às 9h</li>
                  <li>• Alertas de emissões: Diariamente às 18h</li>
                  <li>• Notificações de projetos: Em tempo real</li>
                </ul>
              </div>

              <Button 
                onClick={() => sendReportMutation.mutate()}
                disabled={sendReportMutation.isPending}
                className="w-full"
                variant="outline"
              >
                {sendReportMutation.isPending ? "Enviando..." : "Enviar Relatório Agora"}
              </Button>

              <div className="text-sm text-gray-500">
                <p>Os relatórios são enviados automaticamente para todos os grupos ativos. Você pode enviar um relatório manual usando o botão acima.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}