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
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function Mensagens() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  // Send message mutation (to admin)
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest('POST', '/api/messages', messageData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setIsDialogOpen(false);
      setContent("");
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest('PATCH', `/api/messages/${messageId}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error) => {
      console.error('Error marking message as read:', error);
    },
  });

  const handleSendMessage = () => {
    if (!content.trim()) {
      return;
    }

    // Find admin user ID (assuming admin has ID 1 or we need to get it from an API)
    // For now, we'll use a hardcoded admin ID - in production, this should come from an API
    const adminUserId = 15; // This should be fetched from an API endpoint

    sendMessageMutation.mutate({
      toUserId: adminUserId,
      content: content.trim(),
    });
  };

  const handleMarkAsRead = (messageId: number) => {
    markAsReadMutation.mutate(messageId);
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
    return "Administrador";
  };

  const getUserType = (message: any) => {
    if (message.fromUser.company) return "company";
    if (message.fromUser.individual) return "individual";
    return "admin";
  };

  const isFromAdmin = (message: any) => {
    return message.fromUser.role === 'admin';
  };

  const isMessageUnread = (message: any) => {
    return !message.isRead && message.toUserId === user?.id;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
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
                <DialogTitle>Enviar Mensagem para o Administrador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                    disabled={!content.trim() || sendMessageMutation.isPending}
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

        {messagesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="grid gap-4">
            {messages?.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhuma mensagem encontrada</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Clique em "Nova Mensagem" para enviar uma mensagem para o administrador.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              messages?.map((message: any) => (
                <Card 
                  key={message.id} 
                  className={`hover:shadow-md transition-shadow ${isMessageUnread(message) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {isFromAdmin(message) ? (
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-semibold">Administrador</p>
                              <p className="text-sm text-gray-500">Sistema</p>
                            </div>
                          </div>
                        ) : getUserType(message) === "company" ? (
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
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{message.content}</p>
                    {isMessageUnread(message) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(message.id)}
                        disabled={markAsReadMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Marcar como lida
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}