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
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);

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

    // Admin user ID
    const adminUserId = 15;

    sendMessageMutation.mutate({
      toUserId: adminUserId,
      content: content.trim(),
    });
  };

  const handleSendConversationMessage = () => {
    if (!content.trim()) {
      return;
    }

    // Send to admin (user view can only send to admin)
    const adminUserId = 15; 

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

  // Group messages by conversation (for user, it's just with admin)
  const getConversations = (messages: any[]) => {
    if (!messages || messages.length === 0) return [];
    
    // Since users can only chat with admin, we create a single conversation
    const adminMessages = messages.filter(msg => 
      msg.fromUserId === 15 || msg.toUserId === 15 // Admin user ID
    );
    
    if (adminMessages.length === 0) return [];
    
    const unreadCount = adminMessages.filter(msg => 
      msg.fromUserId === 15 && !msg.isRead
    ).length;
    
    const lastMessage = adminMessages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    return [{
      userId: 15,
      user: { role: 'admin' },
      lastMessage,
      unreadCount,
      messages: adminMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }];
  };

  const openConversation = (userId: number) => {
    setSelectedConversation(userId);
    const conversations = getConversations(messages || []);
    const conversation = conversations.find(c => c.userId === userId);
    setConversationMessages(conversation ? conversation.messages : []);
  };

  const closeConversation = () => {
    setSelectedConversation(null);
    setConversationMessages([]);
  };

  if (!user) {
    return null;
  }

  const conversations = getConversations(messages || []);

  // If viewing a specific conversation (with admin)
  if (selectedConversation) {
    const conversation = conversations.find(c => c.userId === selectedConversation);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={closeConversation}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar às Mensagens
              </Button>
              <h1 className="text-2xl font-bold">Conversa com Administrador</h1>
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
        
        <Footer />
      </div>
    );
  }

  // Main conversation list view
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/individual/dashboard')}
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
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhuma mensagem encontrada</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Clique em "Nova Mensagem" para começar
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
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-lg">Administrador</p>
                            <p className="text-sm text-gray-500">Sistema</p>
                          </div>
                        </div>
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
                      {conversation.lastMessage.fromUserId === user.id ? 'Você: ' : 'Admin: '}
                      {conversation.lastMessage.content}
                    </p>
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