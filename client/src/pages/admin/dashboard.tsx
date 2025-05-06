import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Building, Goal, Clock, ArrowRight, Bell, FileCheck2 } from "lucide-react";
import { Link } from "wouter";

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Fetch admin dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 5, // 5 minutes
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
  
  // Format number
  const formatNumber = (value: string | number) => {
    if (!value) return "0";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0";
    
    return new Intl.NumberFormat('pt-AO', {
      maximumFractionDigits: 2,
    }).format(num);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const COLORS = ['#2E7D32', '#1565C0', '#00BFA5', '#FFB300', '#D32F2F', '#6A1B9A', '#0277BD', '#558B2F'];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="admin" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="font-bold text-2xl text-gray-800">Dashboard do Administrador</h1>
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Bell className="h-4 w-4 mr-1" />
                  <Badge className="ml-1 bg-red-500 text-white">3</Badge>
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <FileCheck2 className="h-4 w-4 mr-1" />
                  <span>Relatórios</span>
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Skeleton className="h-80 w-full rounded-lg" />
                  <Skeleton className="h-80 w-full rounded-lg" />
                </div>
                
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Companies Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Empresas Registradas</h3>
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-800">{stats?.companiesCount || 0}</p>
                          <p className="text-sm text-gray-500">empresas cadastradas</p>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href="/admin/empresas" className="text-primary">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* ODS Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Investimentos por ODS</h3>
                        <Goal className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-800">
                            {stats?.investmentsBySDG?.length || 0}
                          </p>
                          <p className="text-sm text-gray-500">ODS com investimentos</p>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href="/admin/ods-pendentes" className="text-primary">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Sectors Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Setores Mais Poluentes</h3>
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-800">
                            {stats?.sectorEmissions?.length || 0}
                          </p>
                          <p className="text-sm text-gray-500">setores analisados</p>
                        </div>
                        <div className="text-red-500">
                          {stats?.sectorEmissions && stats.sectorEmissions.length > 0 ? (
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                              {stats.sectorEmissions[0].sector}
                            </Badge>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Pending Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Comprovativos Pendentes</h3>
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-800">
                            {stats?.pendingProofsCount || 0}
                          </p>
                          <p className="text-sm text-gray-500">aguardando aprovação</p>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href="/admin/empresas" className="text-yellow-500">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Investments by SDG Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Investimentos por ODS</CardTitle>
                      <CardDescription>Distribuição total de investimentos por Objetivo de Desenvolvimento Sustentável</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats?.investmentsBySDG && stats.investmentsBySDG.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                            <Pie
                              data={stats.investmentsBySDG.map((item: any) => ({
                                name: `ODS ${item.sdg_number}`,
                                value: parseFloat(item.total_amount)
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              innerRadius={40}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={false}
                            >
                              {stats.investmentsBySDG.map((entry: any, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.sdg_color || COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value.toString())} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-gray-500 text-center">
                            Sem dados de investimentos por ODS disponíveis
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Sector Emissions Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Emissões por Setor</CardTitle>
                      <CardDescription>Total de emissões de CO₂ por setor de atividade</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats?.sectorEmissions && stats.sectorEmissions.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart
                            data={stats.sectorEmissions.map((item: any) => ({
                              sector: item.sector.charAt(0).toUpperCase() + item.sector.slice(1),
                              emissions: parseFloat(item.total_emission)
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="sector" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${formatNumber(value.toString())} kg CO₂`, "Emissão"]} />
                            <Legend />
                            <Bar 
                              dataKey="emissions" 
                              name="Emissões CO₂" 
                              fill="#D32F2F"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-gray-500 text-center">
                            Sem dados de emissões por setor disponíveis
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Companies */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Empresas Recentes</CardTitle>
                      <CardDescription>Últimas empresas registradas na plataforma</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/empresas">
                        Ver Todas
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stats?.recentCompanies && stats.recentCompanies.length > 0 ? (
                        stats.recentCompanies.map((company: any) => (
                          <Card key={company.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={company.logoUrl} alt={company.name} />
                                    <AvatarFallback className="bg-primary text-white">
                                      {getInitials(company.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium text-gray-900">{company.name}</h3>
                                    <p className="text-xs text-gray-500">Registrado em {formatDate(company.createdAt)}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Setor</p>
                                    <p className="font-medium text-gray-900">
                                      {company.sector.charAt(0).toUpperCase() + company.sector.slice(1)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900 truncate">
                                      {company.user?.email || '-'}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/admin/empresas/${company.id}`}>
                                      Ver Detalhes
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-3 text-center py-8 bg-gray-50 rounded-lg">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Nenhuma empresa registrada ainda.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
