import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCheck, FileText, Goal, CheckCircle } from "lucide-react";
import { useState } from "react";

const AdminPendingOds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSdgIds, setSelectedSdgIds] = useState<Record<number, string>>({});
  
  // Fetch payment proofs without SDG
  const { data: proofsWithoutSdg, isLoading: isLoadingProofs } = useQuery({
    queryKey: ['/api/admin/payment-proofs/without-sdg'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 1, // 1 minute
  });
  
  // Fetch all SDGs for selection
  const { data: sdgs, isLoading: isLoadingSdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Assign SDG mutation
  const assignSdgMutation = useMutation({
    mutationFn: async ({ id, sdgId }: { id: number, sdgId: string }) => {
      const res = await apiRequest("PUT", `/api/admin/payment-proofs/${id}/sdg`, { sdgId });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-proofs/without-sdg'] });
      
      toast({
        title: "ODS atribuído",
        description: "ODS foi atribuído com sucesso ao comprovativo.",
      });
      
      // Clear the selected SDG for this proof
      setSelectedSdgIds(prev => {
        const newState = { ...prev };
        delete newState[variables.id];
        return newState;
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atribuir ODS",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle assigning SDG
  const handleAssignSdg = (proofId: number) => {
    const sdgId = selectedSdgIds[proofId];
    if (!sdgId) {
      toast({
        title: "Selecione um ODS",
        description: "Por favor, selecione um ODS para atribuir ao comprovativo.",
        variant: "destructive",
      });
      return;
    }
    
    assignSdgMutation.mutate({ id: proofId, sdgId });
  };
  
  // Handle SDG selection change
  const handleSdgChange = (proofId: number, sdgId: string) => {
    setSelectedSdgIds(prev => ({
      ...prev,
      [proofId]: sdgId
    }));
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Atribuir ODS a Comprovativos</h1>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Goal className="h-5 w-5 text-primary" />
                  Comprovativos sem ODS Definido
                </CardTitle>
                <CardDescription>
                  Atribua Objetivos de Desenvolvimento Sustentável aos comprovativos que foram aprovados mas não tiveram um ODS selecionado pela empresa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProofs || isLoadingSdgs ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : proofsWithoutSdg && proofsWithoutSdg.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Comprovativo</TableHead>
                          <TableHead>Selecionar ODS</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proofsWithoutSdg.map((proof: any) => (
                          <TableRow key={proof.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={proof.company.logoUrl} alt={proof.company.name} />
                                  <AvatarFallback className="bg-primary text-white">
                                    {getInitials(proof.company.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{proof.company.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(proof.createdAt)}</TableCell>
                            <TableCell>{formatCurrency(proof.amount)}</TableCell>
                            <TableCell>
                              <a 
                                href={proof.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Ver
                              </a>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={selectedSdgIds[proof.id] || ""}
                                onValueChange={(value) => handleSdgChange(proof.id, value)}
                              >
                                <SelectTrigger className="w-full max-w-xs">
                                  <SelectValue placeholder="Selecione um ODS" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sdgs && sdgs.map((sdg: any) => (
                                    <SelectItem 
                                      key={sdg.id} 
                                      value={sdg.id.toString()}
                                      className="flex items-center"
                                    >
                                      <div className="flex items-center">
                                        <span 
                                          className="w-3 h-3 rounded-full mr-2"
                                          style={{ backgroundColor: sdg.color }}
                                        ></span>
                                        ODS {sdg.number}: {sdg.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-primary-50 border-primary-200 text-primary hover:bg-primary-100"
                                onClick={() => handleAssignSdg(proof.id)}
                                disabled={!selectedSdgIds[proof.id] || assignSdgMutation.isPending}
                              >
                                <Goal className="h-4 w-4 mr-1" />
                                <span>Atribuir ODS</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-700">Não há comprovativos pendentes de atribuição de ODS.</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Todos os comprovativos aprovados já possuem um ODS atribuído.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* SDGs Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sobre os ODS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Os Objetivos de Desenvolvimento Sustentável (ODS) são uma coleção de 17 objetivos globais estabelecidos pela Assembleia Geral das Nações Unidas.
                  </p>
                  <p className="text-gray-600">
                    Atribuir um ODS a um comprovativo permite direcionar o investimento da empresa para projetos específicos que contribuem para alcançar esses objetivos.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instruções</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-gray-600 list-decimal pl-5">
                    <li>Selecione um ODS apropriado para cada comprovativo.</li>
                    <li>Considere o setor da empresa e o valor do investimento.</li>
                    <li>Clique em "Atribuir ODS" para confirmar a seleção.</li>
                    <li>Após a atribuição, o sistema direcionará o investimento para projetos relacionados ao ODS selecionado.</li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próximos Passos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Após atribuir um ODS a um comprovativo, você pode criar ou atualizar projetos relacionados a esse ODS.
                  </p>
                  <Button asChild className="w-full">
                    <a href="/admin/publicacoes" className="flex items-center justify-center">
                      <FileCheck className="h-4 w-4 mr-2" />
                      <span>Gerenciar Publicações</span>
                    </a>
                  </Button>
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

export default AdminPendingOds;
