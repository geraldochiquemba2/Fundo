import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  AlertCircle, 
  FileBarChart, 
  FileText, 
  BarChart3, 
  LineChart, 
  Download, 
  ArrowDownToLine,
  Calendar 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

// Cores para os ODS
const ODS_COLORS = {
  1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D",
  5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942",
  9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E",
  13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D",
  17: "#19486A"
};

function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
  });
}

export default function AdminRelatorios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("investimentos");
  const queryClient = useQueryClient();
  
  // Timestamp to force fresh requests
  const [timestamp, setTimestamp] = useState(Date.now());

  // Redirecionar se não for admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Buscar estatísticas do dashboard admin com cache-busting
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/stats', timestamp],
    enabled: user?.role === 'admin',
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async () => {
      const response = await fetch(`/api/admin/stats?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      return response.json();
    }
  });

  // Force cache invalidation and refetch on component mount
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const invalidateAndRefresh = async () => {
      const newTimestamp = Date.now();
      setTimestamp(newTimestamp);
      queryClient.removeQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      refetch();
    };

    invalidateAndRefresh();
  }, [user?.role, queryClient, refetch]);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise detalhada dos dados da plataforma
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados dos relatórios.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="investimentos" onValueChange={setActiveTab}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Relatórios Disponíveis</CardTitle>
                  <CardDescription>
                    Selecione o tipo de relatório que deseja visualizar
                  </CardDescription>
                </div>
                <div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Último mês</span>
                  </Button>
                </div>
              </div>
              <TabsList className="grid grid-cols-3 mt-4">
                <TabsTrigger value="investimentos">Investimentos</TabsTrigger>
                <TabsTrigger value="empresas">Empresas</TabsTrigger>
                <TabsTrigger value="emissoes">Emissões de Carbono</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="investimentos">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sumário de investimentos */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <FileBarChart className="h-8 w-8 text-primary mb-2" />
                          <h3 className="text-lg font-medium">Total Investido</h3>
                          <p className="text-3xl font-bold my-2">
                            {formatCurrency(stats?.investmentsBySDG?.reduce((acc: number, item: any) => acc + parseFloat(item.total_amount), 0) || 0)}
                          </p>
                          <p className="text-sm text-gray-500">Todos os ODS combinados</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-blue-500 mb-2" />
                          <h3 className="text-lg font-medium">ODS Apoiados</h3>
                          <p className="text-3xl font-bold my-2">
                            {stats?.investmentsBySDG?.filter((item: any) => parseFloat(item.total_amount) > 0).length || 0}
                          </p>
                          <p className="text-sm text-gray-500">Com investimentos ativos</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <BarChart3 className="h-8 w-8 text-green-500 mb-2" />
                          <h3 className="text-lg font-medium">Maior Investimento</h3>
                          <p className="text-3xl font-bold my-2">
                            {formatCurrency(
                              stats?.investmentsBySDG
                                ?.sort((a: any, b: any) => parseFloat(b.total_amount) - parseFloat(a.total_amount))[0]?.total_amount || 0
                            )}
                          </p>
                          <p className="text-sm text-gray-500">ODS mais financiado</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráfico de investimentos por ODS */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Investimentos por ODS</CardTitle>
                      <CardDescription>Distribuição de investimentos por objetivo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats?.investmentsBySDG && stats.investmentsBySDG.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats.investmentsBySDG.filter((item: any) => parseFloat(item.total_amount) > 0).map((item: any) => ({
                                name: `ODS ${item.sdg_number}`,
                                valor: parseFloat(item.total_amount),
                                sdgNumber: item.sdg_number
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value) => formatCurrency(value.toString())} />
                              <Legend />
                              <Bar dataKey="valor" name="Valor Investido">
                                {stats.investmentsBySDG.filter((item: any) => parseFloat(item.total_amount) > 0).map((entry: any) => (
                                  <Cell 
                                    key={`cell-${entry.sdg_number}`} 
                                    fill={ODS_COLORS[entry.sdg_number as keyof typeof ODS_COLORS] || '#8884d8'} 
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                          <p className="text-gray-500">Não há dados de investimentos disponíveis</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Exportar Dados</span>
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Tabela de investimentos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detalhamento de Investimentos</CardTitle>
                      <CardDescription>Lista detalhada de investimentos por ODS</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-3 px-4 text-left">ODS</th>
                              <th className="py-3 px-4 text-left">Nome</th>
                              <th className="py-3 px-4 text-right">Valor Investido</th>
                              <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats?.investmentsBySDG?.filter((item: any) => parseFloat(item.total_amount) > 0)
                              .map((item: any) => (
                                <tr key={item.sdg_id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center">
                                      <div 
                                        className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: ODS_COLORS[item.sdg_number as keyof typeof ODS_COLORS] || '#8884d8' }}
                                      >
                                        {item.sdg_number}
                                      </div>
                                      <span>ODS {item.sdg_number}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">{item.sdg_name}</td>
                                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.total_amount)}</td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge 
                                      variant={parseFloat(item.total_amount) > 50000 ? "default" : "outline"}
                                      className={parseFloat(item.total_amount) > 50000 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                                    >
                                      {parseFloat(item.total_amount) > 50000 ? "Alto" : "Regular"}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            {(!stats?.investmentsBySDG || stats.investmentsBySDG.filter((item: any) => parseFloat(item.total_amount) > 0).length === 0) && (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-gray-500">
                                  Não há dados de investimentos disponíveis
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <p className="text-sm text-gray-500">
                        Total: {stats?.investmentsBySDG?.filter((item: any) => parseFloat(item.total_amount) > 0).length || 0} ODS com investimentos
                      </p>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ArrowDownToLine className="h-4 w-4" />
                        <span>Exportar CSV</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="empresas">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cards de resumo de empresas */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <FileBarChart className="h-8 w-8 text-primary mb-2" />
                          <h3 className="text-lg font-medium">Total de Empresas</h3>
                          <p className="text-3xl font-bold my-2">
                            {stats?.companiesCount || 0}
                          </p>
                          <p className="text-sm text-gray-500">Empresas cadastradas</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-blue-500 mb-2" />
                          <h3 className="text-lg font-medium">Comprovativos</h3>
                          <p className="text-3xl font-bold my-2">
                            {stats?.pendingProofsCount || 0}
                          </p>
                          <p className="text-sm text-gray-500">Aguardando aprovação</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <BarChart3 className="h-8 w-8 text-green-500 mb-2" />
                          <h3 className="text-lg font-medium">Empresas Recentes</h3>
                          <p className="text-3xl font-bold my-2">
                            {stats?.recentCompanies?.length || 0}
                          </p>
                          <p className="text-sm text-gray-500">Últimos 30 dias</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lista de empresas recentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Empresas Recentes</CardTitle>
                      <CardDescription>Empresas mais recentemente registradas na plataforma</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-3 px-4 text-left">Empresa</th>
                              <th className="py-3 px-4 text-left">Setor</th>
                              <th className="py-3 px-4 text-left">Data de Registro</th>
                              <th className="py-3 px-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats?.recentCompanies?.map((company: any) => (
                              <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    {company.logoUrl ? (
                                      <img 
                                        src={company.logoUrl} 
                                        alt={company.name} 
                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-gray-600 text-xs font-bold">
                                        {company.name.substring(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="font-medium">{company.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">{company.sector || "Não especificado"}</td>
                                <td className="py-3 px-4">
                                  {new Date(company.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <Badge 
                                    variant="outline"
                                    className="bg-green-100 text-green-800 hover:bg-green-100"
                                  >
                                    Ativo
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                            {(!stats?.recentCompanies || stats.recentCompanies.length === 0) && (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-gray-500">
                                  Não há empresas recentes para exibir
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <p className="text-sm text-gray-500">
                        Total: {stats?.companiesCount || 0} empresas
                      </p>
                      <Button asChild variant="outline" className="flex items-center gap-2">
                        <Link href="/admin/empresas">
                          Ver todas as empresas
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="emissoes">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cards de resumo de emissões */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <FileBarChart className="h-8 w-8 text-red-500 mb-2" />
                          <h3 className="text-lg font-medium">Total de Emissões</h3>
                          <p className="text-3xl font-bold my-2">
                            {stats?.sectorEmissions
                              ?.reduce((acc: number, item: any) => acc + parseFloat(item.emissions || 0), 0)
                              .toLocaleString('pt-BR', { maximumFractionDigits: 2 }) || 0} kg CO₂
                          </p>
                          <p className="text-sm text-gray-500">Todas as empresas</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <LineChart className="h-8 w-8 text-green-500 mb-2" />
                          <h3 className="text-lg font-medium">Compensações</h3>
                          <p className="text-3xl font-bold my-2">
                            {stats?.sectorEmissions
                              ?.reduce((acc: number, item: any) => acc + parseFloat(item.compensations || 0), 0)
                              .toLocaleString('pt-BR', { maximumFractionDigits: 2 }) || 0} kg CO₂
                          </p>
                          <p className="text-sm text-gray-500">Total compensado</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                          <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                          <h3 className="text-lg font-medium">Média de Redução</h3>
                          <p className="text-3xl font-bold my-2">
                            {stats?.sectorEmissions && stats.sectorEmissions.length > 0 
                              ? (stats.sectorEmissions
                                  .reduce((acc: number, item: any) => acc + parseFloat(item.reduction || 0), 0) / 
                                  stats.sectorEmissions.length
                                ).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
                              : 0}%
                          </p>
                          <p className="text-sm text-gray-500">Entre todas empresas</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráfico de emissões por setor */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Emissões por Setor</CardTitle>
                      <CardDescription>Comparação de emissões de CO₂ por setor empresarial</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats?.sectorEmissions && stats.sectorEmissions.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={
                                Object.entries(
                                  stats.sectorEmissions.reduce((acc: any, item: any) => {
                                    // Certifique-se de que o setor é definido com a capitalização correta
                                    const sector = (item.sector || "Sem setor").trim();
                                    
                                    // Criar um registro para cada setor único
                                    if (!acc[sector]) {
                                      acc[sector] = {
                                        name: sector,
                                        emissions: 0,
                                        compensations: 0
                                      };
                                    }
                                    
                                    // Somar emissões e compensações
                                    const emissions = parseFloat(item.emissions || 0);
                                    const compensations = parseFloat(item.compensations || 0);
                                    
                                    acc[sector].emissions += emissions;
                                    acc[sector].compensations += compensations;
                                    
                                    // Logging para debug
                                    console.log(`Setor: ${sector}, Emissões: ${emissions}, Compensações: ${compensations}`);
                                    
                                    return acc;
                                  }, {})
                                ).map(([, value]) => value)
                              }
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value) => `${parseFloat(value.toString()).toLocaleString('pt-BR')} kg CO₂`} />
                              <Legend />
                              <Bar dataKey="emissions" name="Emissões" fill="#ff6b6b" />
                              <Bar dataKey="compensations" name="Compensações" fill="#51cf66" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                          <p className="text-gray-500">Não há dados de emissões disponíveis</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button asChild variant="outline" className="flex items-center gap-2">
                        <Link href="/admin/setores-poluentes">
                          Ver detalhes dos setores
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      )}
    </div>
  );
}