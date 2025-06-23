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
import { MessageSquare, Users, Send, Settings, AlertCircle, CheckCircle, Smartphone } from "lucide-react";
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

  const connectMutation = useMutation({
    mutationFn: () => apiRequest('/api/whatsapp/connect', 'POST'),
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
    mutationFn: (data: { groupId: string; projectIds?: number[]; sdgIds?: number[] }) =>
      apiRequest('/api/whatsapp/configure-group', 'POST', data),
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

  const sendUpdateMutation = useMutation({
    mutationFn: (data: { projectId: number; message: string }) =>
      apiRequest('/api/whatsapp/send-update', 'POST', data),
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
    mutationFn: () => apiRequest('/api/whatsapp/send-report', 'POST'),
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

  const handleConfigureGroup = () => {
    if (!selectedGroup) return;
    
    configureGroupMutation.mutate({
      groupId: selectedGroup
    });
  };

  const handleSendUpdate = () => {
    if (!selectedProject || !updateMessage.trim()) return;
    
    sendUpdateMutation.mutate({
      projectId: parseInt(selectedProject),
      message: updateMessage.trim()
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
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
                        {group.name} {group.active && "✅"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <div key={group.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">{group.name}</span>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
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