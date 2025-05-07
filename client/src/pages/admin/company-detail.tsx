import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Users,
  Calendar,
  Briefcase,
  ArrowUpRight,
  CloudCog
} from "lucide-react";
import { Link } from "wouter";

const AdminCompanyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: [`/api/admin/companies/${id}`],
    enabled: !!user && user.role === 'admin' && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };
  
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
  
  // Get user initials
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/admin/empresas" className="flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Voltar para empresas</span>
              </Link>
            </Button>
            
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Detalhes da Empresa</h1>
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : company ? (
              <div className="space-y-6">
                {/* Company Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={company.logoUrl} alt={company.name} />
                        <AvatarFallback className="text-2xl bg-primary text-white">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{company.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {company.sector.charAt(0).toUpperCase() + company.sector.slice(1)}
                          </Badge>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Registrada em {formatDate(company.createdAt)}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            {company.user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {company.phone || "Não informado"}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            {company.location || "Não informado"}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            {company.employeeCount || 0} funcionários
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500 flex items-center">
                        <CloudCog className="h-4 w-4 mr-1 text-orange-500" />
                        Emissões Totais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{company.stats?.totalEmissions || 0} kg CO<sub>2</sub></div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                        Compensação Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(company.stats?.totalCompensation || 0)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500 flex items-center">
                        <Briefcase className="h-4 w-4 mr-1 text-blue-500" />
                        Projetos Apoiados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{company.stats?.projectsCount || 0}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sobre a Empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {company.description || "Nenhuma descrição fornecida."}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Payments & Investments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Comprovativos de Pagamento
                      </CardTitle>
                      <CardDescription>
                        Histórico de pagamentos enviados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {company.paymentProofs && company.paymentProofs.length > 0 ? (
                        <div className="space-y-3">
                          {company.paymentProofs.map((proof: any) => (
                            <div key={proof.id} className="border rounded-md p-3">
                              <div className="flex justify-between">
                                <div className="font-medium">{formatCurrency(proof.amount)}</div>
                                <div className="flex items-center gap-2">
                                  {proof.sdgId && proof.sdg && (
                                    <Badge className="bg-white" style={{
                                      color: proof.sdg.color,
                                      borderColor: proof.sdg.color,
                                      backgroundColor: `${proof.sdg.color}15` // 15 = 10% opacity
                                    }}>
                                      ODS {proof.sdg.number}
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={proof.status === 'pending' ? 'outline' : 
                                            proof.status === 'approved' ? 'default' : 'destructive'}
                                    className={proof.status === 'approved' ? 'bg-green-100 text-green-700 border-green-300' : ''}>
                                    {proof.status === 'pending' ? 'Pendente' : 
                                     proof.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center justify-between mt-1">
                                <span>{formatDate(proof.createdAt)}</span>
                                {proof.status === 'approved' && !proof.sdgId && (
                                  <span className="text-amber-600 text-xs flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Sem ODS definido
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Nenhum comprovativo enviado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Building className="h-5 w-5 mr-2 text-primary" />
                        Investimentos em Projetos
                      </CardTitle>
                      <CardDescription>
                        Projetos apoiados pela empresa
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {company.investments && company.investments.length > 0 ? (
                        <div className="space-y-3">
                          {(() => {
                            // Agrupar investimentos por projeto para evitar duplicações
                            const projectMap = new Map();
                            
                            // Agrupar por projeto.id
                            company.investments.forEach((investment: any) => {
                              const projectId = investment.project.id;
                              if (!projectMap.has(projectId)) {
                                projectMap.set(projectId, {
                                  project: investment.project,
                                  totalAmount: 0,
                                  lastDate: investment.createdAt,
                                });
                              }
                              
                              const projectData = projectMap.get(projectId);
                              // Somar os valores de investimento
                              projectData.totalAmount += parseFloat(investment.amount);
                              
                              // Atualizar a data se for mais recente
                              if (new Date(investment.createdAt) > new Date(projectData.lastDate)) {
                                projectData.lastDate = investment.createdAt;
                              }
                            });
                            
                            // Converter o mapa em array e ordenar por data (mais recente primeiro)
                            return Array.from(projectMap.values())
                              .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())
                              .map((projectData: any, index: number) => (
                                <div key={projectData.project.id} className="border rounded-md p-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={projectData.project.imageUrl} alt={projectData.project.name} />
                                      <AvatarFallback className="bg-primary/20">
                                        {getInitials(projectData.project.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{projectData.project.name}</div>
                                      <div className="flex gap-2 items-center">
                                        <div className="text-sm text-gray-500">
                                          {formatDate(projectData.lastDate)}
                                        </div>
                                        <Badge
                                          style={{ 
                                            backgroundColor: projectData.project.sdg.color 
                                          }}
                                          className="text-white text-xs"
                                        >
                                          ODS {projectData.project.sdg.number}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="ml-auto font-bold">
                                      {formatCurrency(projectData.totalAmount)}
                                    </div>
                                  </div>
                                </div>
                              ));
                          })()}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Nenhum investimento realizado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Empresa não encontrada</h3>
                <p className="text-gray-500">Não foi possível encontrar informações para esta empresa.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/empresas">Voltar para lista de empresas</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyDetail;