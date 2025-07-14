import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Target,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Link } from "wouter";

const AdminIndividualDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  // Fetch individual details
  const { data: individual, isLoading } = useQuery({
    queryKey: [`/api/admin/individuals/${id}`],
    enabled: !!user && user.role === 'admin' && !!id,
  });

  // Format currency
  const formatCurrency = (value: string | number) => {
    if (!value) return "0 Kz";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0 Kz";
    
    return new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " Kz";
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const getInitials = (firstName: string, lastName?: string) => {
    if (lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return firstName.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar type="admin" />
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <Skeleton className="h-10 w-48" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!individual) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar type="admin" />
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Pessoa não encontrada</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/individuals">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {individual.firstName} {individual.lastName}
                  </h1>
                  <p className="text-gray-500">Detalhes da pessoa individual</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={individual.photoUrl || undefined} alt={individual.firstName} />
                        <AvatarFallback className="bg-primary text-white text-lg">
                          {getInitials(individual.firstName, individual.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Nome</p>
                            <p className="text-gray-900">{individual.firstName} {individual.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-gray-900 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {individual.user?.email}
                            </p>
                          </div>
                          {individual.phone && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Telefone</p>
                              <p className="text-gray-900 flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {individual.phone}
                              </p>
                            </div>
                          )}
                          {individual.location && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Localização</p>
                              <p className="text-gray-900 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {individual.location}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-500">Data de Registro</p>
                            <p className="text-gray-900 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(individual.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Proofs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Comprovativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {individual.paymentProofs && individual.paymentProofs.length > 0 ? (
                      <div className="space-y-4">
                        {individual.paymentProofs.map((proof: any) => (
                          <div key={proof.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">{formatCurrency(proof.amount)}</p>
                                <p className="text-sm text-gray-500">
                                  {proof.sdg ? `ODS ${proof.sdg.number}: ${proof.sdg.name}` : 'ODS não atribuído'}
                                </p>
                              </div>
                              {getStatusBadge(proof.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{proof.description}</p>
                            <p className="text-xs text-gray-500">
                              Enviado em {formatDate(proof.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum comprovativo enviado ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Investments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Investimentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {individual.investments && individual.investments.length > 0 ? (
                      <div className="space-y-4">
                        {individual.investments.map((investment: any) => (
                          <div key={investment.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">{investment.project?.name}</p>
                                <p className="text-sm text-gray-500">
                                  {investment.project?.sdg ? `ODS ${investment.project.sdg.number}: ${investment.project.sdg.name}` : 'ODS não definido'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-green-600">{formatCurrency(investment.amount)}</p>
                                <p className="text-xs text-gray-500">{formatDate(investment.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum investimento realizado ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm">Total Investido</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(individual.stats?.totalInvested || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm">Comprovativos</span>
                      </div>
                      <span className="font-medium">
                        {individual.stats?.paymentProofsCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="text-sm">Projetos</span>
                      </div>
                      <span className="font-medium">
                        {individual.stats?.projectsCount || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status da Conta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tipo de Usuário</span>
                        <Badge variant="secondary">Individual</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Registro</span>
                        <span className="text-sm text-gray-600">
                          {formatDate(individual.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Último Login</span>
                        <span className="text-sm text-gray-600">
                          {individual.user?.lastLogin ? formatDate(individual.user.lastLogin) : 'Nunca'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminIndividualDetail;