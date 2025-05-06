import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Droplets, 
  FileText, 
  Goal,
  CheckCircle, 
  XCircle, 
  Clock,
  FileUp,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

const CompanyHistory = () => {
  const { user } = useAuth();
  
  // Fetch consumption records
  const { data: consumptionRecords, isLoading: isLoadingConsumption } = useQuery({
    queryKey: ['/api/company/consumption'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch payment proofs
  const { data: paymentProofs, isLoading: isLoadingPaymentProofs } = useQuery({
    queryKey: ['/api/company/payment-proofs'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch investments
  const { data: investments, isLoading: isLoadingInvestments } = useQuery({
    queryKey: ['/api/company/investments'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Format number
  const formatNumber = (value: string | number) => {
    if (!value) return "0";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0";
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };
  
  // Format currency
  const formatCurrency = (value: string | number) => {
    if (!value) return "0 Kz";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0 Kz";
    
    return new Intl.NumberFormat('pt-BR', {
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
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 flex items-center gap-1"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex items-center gap-1"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 flex items-center gap-1"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="company" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Histórico Completo</h1>
            
            <Tabs defaultValue="consumption" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="consumption" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  <span>Consumo</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  <span>Comprovativos</span>
                </TabsTrigger>
                <TabsTrigger value="investments" className="flex items-center gap-2">
                  <Goal className="h-4 w-4" />
                  <span>Investimentos</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Consumption Records Tab */}
              <TabsContent value="consumption">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-primary" />
                      Histórico de Consumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingConsumption ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : consumptionRecords && consumptionRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Energia (kWh)</TableHead>
                              <TableHead>Combustível (l)</TableHead>
                              <TableHead>Transporte (km)</TableHead>
                              <TableHead>Água (m³)</TableHead>
                              <TableHead>Emissão (kg CO₂)</TableHead>
                              <TableHead>Valor (Kz)</TableHead>
                              <TableHead>Período</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {consumptionRecords.map((record: any) => (
                              <TableRow key={record.id}>
                                <TableCell>{formatDate(record.createdAt)}</TableCell>
                                <TableCell>{formatNumber(record.energyKwh || 0)}</TableCell>
                                <TableCell>
                                  {formatNumber(record.fuelLiters || 0)}
                                  {record.fuelType && ` (${
                                    record.fuelType === "diesel" ? "Diesel" :
                                    record.fuelType === "gasoline" ? "Gasolina" : "Gás Natural"
                                  })`}
                                </TableCell>
                                <TableCell>
                                  {formatNumber(record.transportKm || 0)}
                                  {record.transportType && ` (${
                                    record.transportType === "car" ? "Carro" :
                                    record.transportType === "truck" ? "Caminhão" : "Avião"
                                  })`}
                                </TableCell>
                                <TableCell>{formatNumber(record.waterM3 || 0)}</TableCell>
                                <TableCell>{formatNumber(record.emissionKgCo2)}</TableCell>
                                <TableCell>{formatCurrency(record.compensationValueKz)}</TableCell>
                                <TableCell>
                                  {record.period === "monthly" ? "Mensal" :
                                   record.period === "quarterly" ? "Trimestral" : "Anual"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-4">Nenhum registro de consumo encontrado.</p>
                        <Button asChild>
                          <Link href="/empresa/consumo">Registrar Consumo</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Payment Proofs Tab */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileUp className="h-5 w-5 text-primary" />
                      Histórico de Comprovativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPaymentProofs ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : paymentProofs && paymentProofs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead>Consumo Relacionado</TableHead>
                              <TableHead>ODS</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paymentProofs.map((proof: any) => (
                              <TableRow key={proof.id}>
                                <TableCell>{formatDate(proof.createdAt)}</TableCell>
                                <TableCell>{formatCurrency(proof.amount)}</TableCell>
                                <TableCell>
                                  {proof.consumptionRecord ? (
                                    <span className="text-sm">
                                      {formatDate(proof.consumptionRecord.createdAt)} -&nbsp;
                                      {formatCurrency(proof.consumptionRecord.compensationValueKz)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">Pagamento avulso</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {proof.sdg ? (
                                    <span className="inline-flex items-center">
                                      <span 
                                        className="w-3 h-3 rounded-full mr-1"
                                        style={{ backgroundColor: proof.sdg.color }}
                                      ></span>
                                      ODS {proof.sdg.number}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">Não definido</span>
                                  )}
                                </TableCell>
                                <TableCell>{getStatusBadge(proof.status)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <a 
                                      href={proof.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline inline-flex items-center"
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      Ver
                                    </a>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-4">Nenhum comprovativo enviado ainda.</p>
                        <Button asChild>
                          <Link href="/empresa/comprovativo">Enviar Comprovativo</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Investments Tab */}
              <TabsContent value="investments">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Goal className="h-5 w-5 text-primary" />
                      Histórico de Investimentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingInvestments ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : investments && investments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Projeto</TableHead>
                              <TableHead>ODS</TableHead>
                              <TableHead>Valor Investido</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {investments.map((investment: any) => (
                              <TableRow key={investment.id}>
                                <TableCell>{formatDate(investment.createdAt)}</TableCell>
                                <TableCell>{investment.project.name}</TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center">
                                    <span 
                                      className="w-3 h-3 rounded-full mr-1"
                                      style={{ backgroundColor: investment.project.sdg.color }}
                                    ></span>
                                    ODS {investment.project.sdg.number}
                                  </span>
                                </TableCell>
                                <TableCell>{formatCurrency(investment.amount)}</TableCell>
                                <TableCell>
                                  <Link 
                                    href={`/projeto/${investment.project.id}`}
                                    className="text-primary hover:underline inline-flex items-center"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Ver Projeto
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Goal className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-4">Nenhum investimento realizado ainda.</p>
                        <p className="text-sm text-gray-500">
                          Seus investimentos aparecerão aqui depois que seus comprovativos forem aprovados.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Emissions Summary */}
              <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <Droplets className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Total de Emissões</h3>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {!isLoadingConsumption && consumptionRecords
                      ? formatNumber(
                          consumptionRecords.reduce(
                            (sum: number, record: any) => sum + parseFloat(record.emissionKgCo2), 
                            0
                          )
                        )
                      : "0"} kg CO₂
                  </div>
                  <p className="text-sm text-gray-600">Desde o início do registro</p>
                </CardContent>
              </Card>
              
              {/* Payments Summary */}
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <FileUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Total Compensado</h3>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {!isLoadingPaymentProofs && paymentProofs
                      ? formatCurrency(
                          paymentProofs
                            .filter((proof: any) => proof.status === 'approved')
                            .reduce((sum: number, proof: any) => sum + parseFloat(proof.amount), 0)
                        )
                      : "0 Kz"}
                  </div>
                  <p className="text-sm text-gray-600">Total de pagamentos aprovados</p>
                </CardContent>
              </Card>
              
              {/* Investments Summary */}
              <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <Goal className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Projetos Apoiados</h3>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {!isLoadingInvestments && investments
                      ? new Set(investments.map((inv: any) => inv.project.id)).size
                      : "0"}
                  </div>
                  <p className="text-sm text-gray-600">Total de projetos diferentes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompanyHistory;
