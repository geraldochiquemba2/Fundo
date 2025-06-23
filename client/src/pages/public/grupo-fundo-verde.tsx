import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Link2, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GrupoFundoVerde() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Mock data for demonstration - in production this would come from API
  const groupInfo = {
    name: "Fundo Verde - Sustentabilidade",
    description: "Grupo dedicado a discussões sobre projetos ambientais, ODS e sustentabilidade. Receba atualizações em tempo real sobre investimentos verdes e iniciativas de carbono neutro.",
    members: 247,
    inviteLink: "https://chat.whatsapp.com/FundoVerde2024",
    features: [
      "Atualizações automáticas de projetos",
      "Relatórios semanais de sustentabilidade", 
      "Alertas de emissões de carbono",
      "Discussões sobre ODS",
      "Networking com empresas sustentáveis"
    ],
    recentTopics: [
      "Painéis Solares em Comunidades Rurais",
      "Sistemas de Purificação de Água",
      "Programa de Reflorestamento Urbano",
      "Relatório Semanal - Emissões CO₂",
      "Investimentos em Energia Limpa"
    ]
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupInfo.inviteLink);
    setCopied(true);
    toast({
      title: "Link copiado",
      description: "Link do grupo copiado para área de transferência"
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinGroup = () => {
    window.open(groupInfo.inviteLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{groupInfo.name}</h1>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    <Users className="w-4 h-4 mr-1" />
                    {groupInfo.members} membros
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    <Link2 className="w-4 h-4 mr-1" />
                    Grupo Público
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {groupInfo.description}
            </p>
          </div>

          {/* Join Group Card */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-green-800">Participe da Comunidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={groupInfo.inviteLink}
                  readOnly
                  className="bg-white"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className={copied ? "bg-green-100 text-green-800" : ""}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <Button 
                onClick={handleJoinGroup}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Entrar no Grupo WhatsApp
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Clique no botão acima ou copie o link para entrar
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>O que você receberá</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {groupInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recent Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Tópicos Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {groupInfo.recentTopics.map((topic, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{topic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Diretrizes do Grupo</CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <ul className="space-y-2 text-sm">
                <li>• Mantenha o foco em sustentabilidade e meio ambiente</li>
                <li>• Seja respeitoso com todos os membros</li>
                <li>• Compartilhe conteúdo relevante e educativo</li>
                <li>• Evite spam ou mensagens comerciais não relacionadas</li>
                <li>• Use as notificações automáticas para se manter atualizado</li>
              </ul>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center bg-white rounded-lg p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Faça parte da mudança
            </h2>
            <p className="text-gray-600 mb-6">
              Junte-se a centenas de pessoas comprometidas com um futuro mais sustentável
            </p>
            <Button 
              onClick={handleJoinGroup}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              size="lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Entrar Agora no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}