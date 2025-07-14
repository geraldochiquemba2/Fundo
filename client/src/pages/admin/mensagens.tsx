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
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);

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
      const response = await apiRequest('POST', '/api/admin/messages/send', messageData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messages'] });
      setIsDialogOpen(false);
      setSelectedRecipient("");
      setContent("");
    },
    onError: (error) => {
      console.error('Error sending message:', error);
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

  const handleSendConversationMessage = () => {
    if (!selectedConversation || !content.trim()) {
      return;
    }

    sendMessageMutation.mutate({
      toUserId: selectedConversation,
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

  // Group messages by conversation (unique pairs of users)
  const getConversations = (messages: any[]) => {
    if (!messages) return [];
    
    const conversationMap = new Map();
    
    messages.forEach(message => {
      const adminId = user?.id;
      const otherUserId = message.fromUserId === adminId ? message.toUserId : message.fromUserId;
      const otherUser = message.fromUserId === adminId ? message.toUser : message.fromUser;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        });
      }
      
      const conversation = conversationMap.get(otherUserId);
      conversation.messages.push(message);
      
      // Update last message if this one is newer
      if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = message;
      }
      
      // Count unread messages (messages sent to admin that are not read)
      if (message.toUserId === adminId && !message.isRead) {
        conversation.unreadCount++;
      }
    });
    
    return Array.from(conversationMap.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  };

  const getConversationMessages = (conversations: any[], userId: number) => {
    const conversation = conversations.find(c => c.userId === userId);
    return conversation ? conversation.messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ) : [];
  };

  const openConversation = (userId: number) => {
    setSelectedConversation(userId);
    const conversations = getConversations(messages || []);
    const conversationMessages = getConversationMessages(conversations, userId);
    setConversationMessages(conversationMessages);
  };

  const closeConversation = () => {
    setSelectedConversation(null);
    setConversationMessages([]);
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

  const conversations = getConversations(messages || []);

  // If viewing a specific conversation
  if (selectedConversation) {
    const conversation = conversations.find(c => c.userId === selectedConversation);
    const conversationName = conversation?.user?.company?.name || 
                           (conversation?.user?.individual ? `${conversation.user.individual.firstName} ${conversation.user.individual.lastName}` : 'Usuário');
    
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={closeConversation}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar às Conversas
            </Button>
            <h1 className="text-2xl font-bold">{conversationName}</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {conversationMessages.map((message: any) => (
              <div 
                key={message.id} 
                className={`flex ${message.fromUserId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.fromUserId === user.id 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.fromUserId === user.id ? 'text-green-200' : 'text-gray-500'
                  }`}>
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendConversationMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendConversationMessage}
                disabled={sendMessageMutation.isPending || !content.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main conversation list view
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
          <h1 className="text-2xl font-bold">Conversas</h1>
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
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma conversa encontrada</p>
                <p className="text-sm text-gray-400 mt-2">
                  Clique em "Nova Mensagem" para começar uma conversa
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conversation: any) => (
            <Card 
              key={conversation.userId} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => openConversation(conversation.userId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {conversation.user.company ? (
                      <div className="flex items-center gap-2">
                        <Building className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-semibold text-lg">{conversation.user.company.name}</p>
                          <p className="text-sm text-gray-500">Empresa</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-lg">
                            {conversation.user.individual ? 
                              `${conversation.user.individual.firstName} ${conversation.user.individual.lastName}` : 
                              'Usuário'
                            }
                          </p>
                          <p className="text-sm text-gray-500">Pessoa</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <div className="text-right">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(conversation.lastMessage.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 truncate">
                  {conversation.lastMessage.fromUserId === user.id ? 'Você: ' : ''}
                  {conversation.lastMessage.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}