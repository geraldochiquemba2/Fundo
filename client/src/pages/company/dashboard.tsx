import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
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
import {
  TrendingUp,
  TrendingDown,
  Droplets,
  FileUp,
  Goal,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const CompanyDashboard = () => {
  const { user } = useAuth();
  
  // Fetch company stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/company/stats'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Format currency
  const formatCurrency = (value: string) => {
    if (!value) return "0 Kz";
    const num = parseFloat(value);
    if (isNaN(num)) return "0 Kz";
    
    return new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " Kz";
  };
  
  // Format number
  const formatNumber = (value: string) => {
    if (!value) return "0";
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    
    return new Intl.NumberFormat('pt-AO', {
      maximumFractionDigits: 2,
    }).format(num);
  };
  
  // Format date for charts
  const formatMonthYear = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
    } catch (error) {
      return dateString;
    }
  };
  
  // Cores específicas para cada ODS conforme padrão oficial da ONU
  const ODS_COLORS = {
    1: '#e5243b', // Vermelho - Erradicação da Pobreza
    2: '#DDA63A', // Amarelo - Fome Zero
    3: '#4C9F38', // Verde - Saúde e Bem-estar
    4: '#C5192D', // Vermelho escuro - Educação de Qualidade
    5: '#FF3A21', // Laranja avermelhado - Igualdade de Gênero
    6: '#26BDE2', // Azul claro - Água Potável
    7: '#FCC30B', // Amarelo escuro - Energia Limpa
    8: '#A21942', // Bordô - Trabalho Decente
    9: '#FD6925', // Laranja - Indústria e Inovação
    10: '#DD1367', // Rosa escuro - Redução das Desigualdades
    11: '#FD9D24', // Laranja claro - Cidades Sustentáveis
    12: '#BF8B2E', // Marrom dourado - Consumo Responsável
    13: '#3F7E44', // Verde escuro - Ação Climática
    14: '#0A97D9', // Azul - Vida na Água
    15: '#56C02B', // Verde lima - Vida Terrestre
    16: '#00689D', // Azul marinho - Paz e Justiça
    17: '#19486A'  // Azul escuro - Parcerias
  };
  
  // Cores de fallback se não encontrar o ODS específico
  const FALLBACK_COLORS = ['#2E7D32', '#1565C0', '#00BFA5', '#FFB300', '#D32F2F'];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="company" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Dashboard da Empresa</h1>
            
            {isLoading ? (
              // Loading state
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
                
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : (
              // Dashboard content
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Emissions Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Emissões Totais</h3>
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">CO₂</Badge>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-800">{formatNumber(stats?.totalEmissions || '0')}</p>
                          <p className="text-sm text-gray-500">kg de CO₂</p>
                        </div>
                        {parseFloat(stats?.totalEmissions || '0') > 0 && (
                          <div className="text-red-500">
                            <TrendingUp className="h-4 w-4 inline" />
                            <span className="text-sm ml-1">12.3%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Compensation Amount Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Valor Compensado</h3>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">KZ</Badge>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-800">{formatCurrency(stats?.totalCompensation || '0').split(' ')[0]}</p>
                          <p className="text-sm text-gray-500">Kwanzas</p>
                        </div>
                        {parseFloat(stats?.totalCompensation || '0') > 0 && (
                          <div className="text-green-500">
                            <TrendingUp className="h-4 w-4 inline" />
                            <span className="text-sm ml-1">3.2%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Projects Supported Card */}
                  <Card className="group hover:shadow-md transition-shadow">
                    <Link href="/empresa/historico?tab=investments">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-gray-500 text-sm font-medium">Projetos Apoiados</h3>
                          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">ODS</Badge>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-bold text-gray-800">{stats?.projectsCount || 0}</p>
                            <p className="text-sm text-gray-500">projetos</p>
                          </div>
                          {(stats?.projectsCount || 0) > 0 ? (
                            <div className="flex items-center text-blue-500">
                              <span className="text-sm mr-1">Ver detalhes</span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          ) : (
                            <div className="text-blue-500">
                              <span className="text-sm">Nenhum projeto</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                  
                  {/* Status Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Status</h3>
                        {stats?.pendingProof ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">PENDENTE</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">OK</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium text-gray-800">Comprovativo</p>
                          <p className="text-sm text-gray-500">
                            {stats?.pendingProof ? "Aguardando aprovação" : "Nenhum pendente"}
                          </p>
                        </div>
                        {stats?.pendingProof && (
                          <Link href="/empresa/comprovativo" className="text-primary hover:underline">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Emissions Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Emissões Mensais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.monthlyEmissions && stats.monthlyEmissions.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={stats.monthlyEmissions.map((item: any) => ({
                              month: formatMonthYear(item.month),
                              emission: parseFloat(item.total_emission)
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${formatNumber(value.toString())} kg CO₂`, "Emissão"]} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="emission"
                              stroke="#2E7D32"
                              activeDot={{ r: 8 }}
                              name="Emissão CO₂"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-gray-500 text-center">
                            Sem dados de emissões disponíveis
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* ODS Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição de Investimentos por ODS</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {stats?.investmentsBySDG && stats.investmentsBySDG.length > 0 ? (
                        <div className="space-y-4">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={stats.investmentsBySDG.map((item: any) => ({
                                  name: `ODS ${item.sdg_number}`,
                                  value: parseFloat(item.total_amount),
                                  sdgNumber: item.sdg_number,
                                  fullName: item.sdg_name || `Objetivo ${item.sdg_number}`
                                }))}
                                outerRadius={100}
                                innerRadius={40}
                                paddingAngle={3}
                                cx="50%"
                                cy="50%"
                                dataKey="value"
                                nameKey="name"
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {stats.investmentsBySDG.map((entry: any) => {
                                  const sdgNumber = parseInt(entry.sdg_number);
                                  const color = ODS_COLORS[sdgNumber as keyof typeof ODS_COLORS] || 
                                                entry.sdg_color || 
                                                FALLBACK_COLORS[sdgNumber % FALLBACK_COLORS.length];
                                  
                                  return (
                                    <Cell 
                                      key={`cell-${sdgNumber}`} 
                                      fill={color}
                                      stroke="#fff"
                                      strokeWidth={1}
                                    />
                                  );
                                })}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => formatCurrency(value.toString())}
                                labelFormatter={(name) => `Investimento: ${name}`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          {/* Legenda melhorada */}
                          <div className="mt-6">
                            <p className="text-sm font-medium text-gray-700 mb-2 px-2">Legenda:</p>
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
                              {stats.investmentsBySDG.map((entry: any) => {
                                const sdgNumber = parseInt(entry.sdg_number);
                                const color = ODS_COLORS[sdgNumber as keyof typeof ODS_COLORS] || 
                                              entry.sdg_color || 
                                              FALLBACK_COLORS[sdgNumber % FALLBACK_COLORS.length];
                                
                                return (
                                  <div 
                                    key={`legend-${sdgNumber}`} 
                                    className="flex items-center space-x-1"
                                  >
                                    <div 
                                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                                      style={{ backgroundColor: color }}
                                    />
                                    <div className="text-xs whitespace-nowrap">
                                      <span>ODS {sdgNumber}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Valores por ODS */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-4 px-2">
                              {stats.investmentsBySDG
                                .sort((a: any, b: any) => parseInt(a.sdg_number) - parseInt(b.sdg_number))
                                .map((entry: any) => {
                                const sdgNumber = parseInt(entry.sdg_number);
                                const color = ODS_COLORS[sdgNumber as keyof typeof ODS_COLORS] || 
                                              entry.sdg_color || 
                                              FALLBACK_COLORS[sdgNumber % FALLBACK_COLORS.length];
                                
                                return (
                                  <div 
                                    key={`legend-value-${sdgNumber}`} 
                                    className="flex items-center justify-between border-b border-gray-100 pb-1"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-3 h-3 rounded-sm flex-shrink-0" 
                                        style={{ backgroundColor: color }}
                                      />
                                      <span className="text-xs font-medium">ODS {sdgNumber}</span>
                                    </div>
                                    <span className="text-xs text-gray-600">{formatCurrency(entry.total_amount)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-gray-500 text-center">
                            Sem dados de investimentos por ODS disponíveis
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Atividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {stats.recentActivity.map((activity: any) => (
                          <div key={activity.id} className="py-4 flex items-start">
                            <div className="bg-blue-100 rounded-full p-2 mr-4">
                              {activity.fuelType ? (
                                <Droplets className="h-5 w-5 text-blue-500" />
                              ) : (
                                <FileUp className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.fuelType ? "Consumo registrado" : "Comprovativo enviado"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {activity.energyKwh && `${formatNumber(activity.energyKwh)} kWh de energia, `}
                                {activity.fuelLiters && `${formatNumber(activity.fuelLiters)} litros de ${activity.fuelType || 'combustível'}, `}
                                {activity.transportKm && `${formatNumber(activity.transportKm)} km de transporte`}
                                {!activity.fuelType && "Aguardando aprovação do administrador"}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">Nenhuma atividade recente.</p>
                      </div>
                    )}
                    
                    <div className="mt-4 text-center">
                      <Link href="/empresa/historico" className="text-sm text-primary hover:underline">
                        Ver histórico completo
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                {/* CTA Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Register Consumption CTA */}
                  <Card className="bg-primary-50 border-primary/10">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Droplets className="h-10 w-10 text-primary mr-4" />
                        <h3 className="font-semibold text-xl text-gray-800">Registre seu Consumo</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Registre seu consumo de energia, combustíveis e transporte para calcular sua pegada de carbono.
                      </p>
                      <Button asChild>
                        <Link href="/empresa/consumo" className="inline-flex items-center">
                          Inserir Consumo
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Upload Proof CTA */}
                  <Card className="bg-secondary-50 border-secondary/10">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <FileUp className="h-10 w-10 text-secondary mr-4" />
                        <h3 className="font-semibold text-xl text-gray-800">Envie seu Comprovativo</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Envie o comprovante de pagamento e escolha o ODS para direcionar seu investimento.
                      </p>
                      <Button variant="secondary" asChild>
                        <Link href="/empresa/comprovativo" className="inline-flex items-center">
                          Enviar Comprovativo
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompanyDashboard;
