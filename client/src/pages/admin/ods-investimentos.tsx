import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft, Target, Save } from "lucide-react";

const AdminOdsInvestimentos = () => {
  const { user } = useAuth();
  
  // Fetch admin dashboard stats
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60, // 1 minute - reduced time to refresh more often
  });
  
  // Fetch all SDGs
  const { data: sdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Format currency
  const formatCurrency = (value: string | number) => {
    if (!value) return "0 Kz";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0 Kz";
    
    // Ensure we're dealing with the actual number without any previous formatting
    const cleanNum = Number(String(num).replace(/[^0-9.-]/g, ''));
    
    return new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cleanNum) + " Kz";
  };
  
  // Get SDG name by number
  const getSdgName = (sdgNumber: number) => {
    if (!sdgs) return `ODS ${sdgNumber}`;
    const sdg = sdgs.find((s: any) => s.number === sdgNumber);
    return sdg ? sdg.name : `ODS ${sdgNumber}`;
  };
  
  // Get SDG color by number
  const getSdgColor = (sdgNumber: number) => {
    if (!sdgs) return "#cccccc";
    const sdg = sdgs.find((s: any) => s.number === sdgNumber);
    return sdg ? sdg.color : "#cccccc";
  };
  
  // Calculate total investment
  const calculateTotalInvestment = () => {
    if (!stats?.investmentsBySDG) return 0;
    
    // Get the total from the actual investment amounts
    const total = stats.investmentsBySDG.reduce((acc: number, item: any) => {
      const amount = Number(String(item.total_amount).replace(/[^0-9.-]/g, ''));
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return total;
  };
  
  // Estado para armazenar as metas de cada ODS
  const [sdgTargets, setSdgTargets] = useState<{[key: string]: number}>({
    // Definindo meta padrão de 10.000.000 Kz para todos os ODS
    default: 10000000,
    // Metas específicas para ODS individuais
    1: 10000000,
    2: 10000000,
    3: 10000000, 
    4: 10000000,
    5: 10000000,
    6: 10000000,
    7: 10000000,
    8: 10000000,
    9: 10000000,
    10: 10000000,
    11: 10000000, 
    12: 10000000,
    13: 10000000,
    14: 10000000,
    15: 10000000,
    16: 10000000,
    17: 10000000
  });
  
  // Estado para controlar se o modal de edição de metas está aberto
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  
  // Estado para armazenar as metas em edição
  const [editingTargets, setEditingTargets] = useState<{[key: string]: number}>({...sdgTargets});
  
  // Função para atualizar meta de um ODS específico
  const updateSdgTarget = (sdgNumber: number, value: string) => {
    // Remove todos os caracteres exceto números e pontos
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    // Permite apagar todo o conteúdo do input (resultando em 0)
    const numValue = cleanValue === '' ? 0 : parseInt(cleanValue);
    
    setEditingTargets({
      ...editingTargets,
      [sdgNumber]: numValue
    });
  };
  
  // Calculate percentage based on target for each SDG
  const calculatePercentage = (amount: string, sdgNumber?: number) => {
    // Se o valor for zero, retorna zero
    if (parseFloat(amount) === 0) return 0;
    
    // Obtém a meta para este ODS específico ou usa a meta padrão
    const targetAmount = sdgNumber && sdgTargets[sdgNumber as keyof typeof sdgTargets] 
      ? sdgTargets[sdgNumber as keyof typeof sdgTargets]
      : sdgTargets.default;
    
    // Calcula o percentual baseado na meta (limitado a 100%)
    const percentage = (parseFloat(amount) / targetAmount) * 100;
    
    // Limita o percentual a 100% no máximo
    return Math.min(percentage, 100);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="admin" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
              <Link href="/admin/dashboard">
                <Button variant="ghost" className="-ml-2 mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="font-bold text-2xl text-gray-800">Investimentos por ODS</h1>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Visão Geral</CardTitle>
                <CardDescription>
                  Distribuição de investimentos em todos os Objetivos de Desenvolvimento Sustentável
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-700">Total de Investimentos</h3>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xl text-primary">
                        {formatCurrency(calculateTotalInvestment())}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => setIsEditingTargets(true)}
                      >
                        <Target className="h-4 w-4" />
                        <span>Definir Metas</span>
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Investimentos acumulados em todos os ODS</p>
                  </div>
                </div>
                
                {/* Dialog para edição de metas */}
                <Dialog open={isEditingTargets} onOpenChange={setIsEditingTargets}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Definir Metas de Investimento para ODS</DialogTitle>
                      <DialogDescription>
                        Defina uma meta de investimento para cada ODS. O progresso será calculado com base nessas metas.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      {Array.from({length: 17}, (_, i) => i + 1).map(sdgNumber => (
                        <div key={sdgNumber} className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: getSdgColor(sdgNumber) }}
                          >
                            <span className="text-white font-bold text-sm">{sdgNumber}</span>
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`target-${sdgNumber}`} className="text-sm font-medium">
                              {getSdgName(sdgNumber)}
                            </Label>
                            <div className="flex items-center">
                              <Input
                                id={`target-${sdgNumber}`}
                                value={formatCurrency(editingTargets[sdgNumber] || 0)}
                                onChange={(e) => updateSdgTarget(sdgNumber, e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditingTargets(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => {
                          setSdgTargets(editingTargets);
                          setIsEditingTargets(false);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Metas
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : stats?.investmentsBySDG && stats.investmentsBySDG.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Número</TableHead>
                          <TableHead className="w-[300px]">Nome do ODS</TableHead>
                          <TableHead>Valor Investido</TableHead>
                          <TableHead className="text-right">Percentual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.investmentsBySDG
                          .sort((a: any, b: any) => parseFloat(a.sdg_number) - parseFloat(b.sdg_number))
                          .map((item: any) => (
                            <TableRow key={item.sdg_number}>
                              <TableCell>
                                <div className="flex items-center">
                                  <div 
                                    className="w-8 h-8 rounded-md flex items-center justify-center mr-2"
                                    style={{ backgroundColor: getSdgColor(parseInt(item.sdg_number)) }}
                                  >
                                    <span className="text-white font-bold text-sm">{item.sdg_number}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{getSdgName(parseInt(item.sdg_number))}</TableCell>
                              <TableCell>{formatCurrency(Number(item.total_amount || 0))}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end">
                                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full" 
                                      style={{ 
                                        width: `${calculatePercentage(item.total_amount, parseInt(item.sdg_number))}%`,
                                        backgroundColor: getSdgColor(parseInt(item.sdg_number))
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">{calculatePercentage(item.total_amount, parseInt(item.sdg_number)).toFixed(1)}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">Nenhum investimento encontrado.</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Ainda não foram registrados investimentos em ODS.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sobre os ODS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Os Objetivos de Desenvolvimento Sustentável (ODS) são uma coleção de 17 objetivos globais estabelecidos pela Assembleia Geral das Nações Unidas.
                  </p>
                  <p className="text-gray-600">
                    Estes objetivos cobrem questões de desenvolvimento social e econômico, incluindo pobreza, fome, saúde, educação, aquecimento global, igualdade de gênero, água, saneamento, energia, urbanização, meio ambiente e justiça social.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações e Recursos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button asChild className="w-full justify-start">
                      <Link href="/admin/ods-pendentes" className="inline-flex">
                        Atribuir ODS a Comprovativos
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/publications" className="inline-flex">
                        Gerenciar Projetos e Publicações
                      </Link>
                    </Button>
                    
                    <Button asChild variant="secondary" className="w-full justify-start">
                      <Link href="/admin/empresas" className="inline-flex">
                        Ver Empresas Investidoras
                      </Link>
                    </Button>
                  </div>
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

export default AdminOdsInvestimentos;