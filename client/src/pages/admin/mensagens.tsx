import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  User, 
  Building, 
  MessageCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminMensagens() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [content, setContent] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/admin/messages'],
    enabled: user?.role === 'admin',
  });

  // Fetch companies and individuals for recipient selection
  const { data: companies } = useQuery({
    queryKey: ['/api/admin/companies'],
    enabled: user?.role === 'admin',
  });

  const { data: individuals } = useQuery({
    queryKey: ['/api/admin/individuals'],
    enabled: user?.role === 'admin',
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest('POST', '/api/admin/messages/send', messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messages'] });
      setIsDialogOpen(false);
      setSelectedRecipient("");
      setContent("");
    },
  });

  const handleSendMessage = () => {
    if (!selectedRecipient || !content.trim()) {
      return;
    }

    sendMessageMutation.mutate({
      toUserId: parseInt(selectedRecipient),
      content: content.trim(),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getUserName = (message: any) => {
    if (message.fromUser.company) {
      return message.fromUser.company.name;
    } else if (message.fromUser.individual) {
      return `${message.fromUser.individual.firstName} ${message.fromUser.individual.lastName}`;
    }
    return "Usuário desconhecido";
  };

  const getRecipientName = (message: any) => {
    if (message.toUser.company) {
      return message.toUser.company.name;
    } else if (message.toUser.individual) {
      return `${message.toUser.individual.firstName} ${message.toUser.individual.lastName}`;
    }
    return "Usuário desconhecido";
  };

  const getUserType = (message: any) => {
    if (message.fromUser.company) return "company";
    if (message.fromUser.individual) return "individual";
    return "unknown";
  };

  if (messagesLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Mensagens</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Mensagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Nova Mensagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Destinatário</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um destinatário" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="font-semibold text-sm text-gray-500 px-2 py-1">Empresas</div>
                    {companies?.map((company: any) => (
                      <SelectItem key={`company-${company.userId}`} value={company.userId.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {company.name}
                        </div>
                      </SelectItem>
                    ))}
                    <div className="font-semibold text-sm text-gray-500 px-2 py-1 mt-2">Pessoas</div>
                    {individuals?.map((individual: any) => (
                      <SelectItem key={`individual-${individual.userId}`} value={individual.userId.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {individual.firstName} {individual.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              

              
              <div>
                <Label htmlFor="content">Mensagem</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!selectedRecipient || !content.trim() || sendMessageMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sendMessageMutation.isError && (
        <Alert className="mb-4">
          <AlertDescription>
            Erro ao enviar mensagem. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {messages?.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma mensagem encontrada</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          messages?.map((message: any) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getUserType(message) === "company" ? (
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold">{getUserName(message)}</p>
                          <p className="text-sm text-gray-500">Empresa</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">{getUserName(message)}</p>
                          <p className="text-sm text-gray-500">Pessoa</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(message.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Para: {getRecipientName(message)}
                      </p>
                    </div>
                    {message.isRead ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Não lida
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}