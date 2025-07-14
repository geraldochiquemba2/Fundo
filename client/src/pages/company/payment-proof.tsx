import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, FileText, CheckCircle, XCircle, Clock, Target } from "lucide-react";

// Define the form schema
const paymentProofSchema = z.object({
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "O valor deve ser um número positivo",
  }),
  sdgId: z.string().optional(),
  consumptionRecordId: z.string().optional(),
});

type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;

const CompanyPaymentProof = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [sdgDetails, setSdgDetails] = useState<Record<string, any>>({});
  
  // Fetch SDGs for the selection dropdown
  const { data: sdgs, isLoading: isLoadingSdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Metas de investimento para cada ODS (em Kz)
  const sdgTargets = {
    default: 10000000, // Meta padrão: 10.000.000 Kz
    // Metas específicas para cada ODS podem ser adicionadas aqui
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
  };
  
  // Função para formatar valor em Kz
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
      .replace('AOA', 'Kz')
      .replace(',00', '');
  };
  
  // Fetch consumption records for dropdown
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
  
  // Fetch SDG details for each SDG
  useEffect(() => {
    const fetchSdgDetails = async () => {
      if (sdgs && Array.isArray(sdgs) && sdgs.length > 0) {
        const details: Record<string, any> = {};
        
        for (const sdg of sdgs) {
          try {
            const response = await fetch(`/api/sdgs/${sdg.id}`);
            if (response.ok) {
              const data = await response.json();
              details[sdg.id] = data;
            }
          } catch (error) {
            console.error(`Erro ao buscar detalhes do ODS ${sdg.id}:`, error);
          }
        }
        
        setSdgDetails(details);
      }
    };
    
    fetchSdgDetails();
  }, [sdgs]);
  
  // Initialize form
  const form = useForm<PaymentProofFormValues>({
    resolver: zodResolver(paymentProofSchema),
    defaultValues: {
      amount: "",
      sdgId: "",
      consumptionRecordId: "",
    },
  });
  
  // Upload payment proof mutation
  const uploadProofMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/company/payment-proof", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erro ao fazer upload do comprovativo");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company/payment-proofs'] });
      toast({
        title: "Comprovativo enviado",
        description: "Seu comprovativo foi enviado com sucesso e está aguardando aprovação.",
      });
      
      // Reset form
      form.reset();
      setProofFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar comprovativo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: PaymentProofFormValues) => {
    if (!proofFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, anexe um comprovativo de pagamento.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("proof", proofFile);
    formData.append("amount", data.amount);
    
    if (data.sdgId) {
      formData.append("sdgId", data.sdgId);
    }
    
    if (data.consumptionRecordId) {
      formData.append("consumptionRecordId", data.consumptionRecordId);
    }
    
    uploadProofMutation.mutate(formData);
  };
  
  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="company" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Enviar Comprovativo de Pagamento</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Novo Comprovativo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6 bg-primary-50 border-primary/30 text-primary">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      O comprovativo deve ser um arquivo PDF ou imagem contendo o comprovante de transferência ou pagamento.
                    </AlertDescription>
                  </Alert>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comprovativo de Pagamento</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="proof-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600"
                              >
                                <span>Carregar um arquivo</span>
                                <input
                                  id="proof-upload"
                                  name="proof-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleProofChange}
                                  accept=".pdf,.png,.jpg,.jpeg"
                                />
                              </label>
                              <p className="pl-1">ou arraste e solte</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF, PNG, JPG até 5MB
                            </p>
                            {proofFile && (
                              <p className="text-xs text-green-500 font-medium">
                                {proofFile.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor (Kz)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 50000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="consumptionRecordId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registro de Consumo (opcional)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um registro de consumo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent
                                className="max-h-[300px] overflow-y-auto" 
                                position="popper" 
                                align="center"
                                sideOffset={-75}
                                alignOffset={0}>
                                <SelectItem value="none">Nenhum (pagamento avulso)</SelectItem>
                                {!isLoadingConsumption && consumptionRecords && Array.isArray(consumptionRecords) && consumptionRecords.map((record: any) => (
                                  <SelectItem key={record.id} value={record.id.toString()}>
                                    {new Date(record.createdAt).toLocaleDateString('pt-BR')} - {formatCurrency(record.compensationValueKz)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sdgId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objetivo de Desenvolvimento Sustentável (opcional)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um ODS para direcionar seu investimento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent 
                                className="max-h-[300px] overflow-y-auto" 
                                position="popper" 
                                align="center"
                                sideOffset={-75}
                                alignOffset={0}>
                                <SelectItem value="unselected">Não selecionado (será definido pelo admin)</SelectItem>
                                {!isLoadingSdgs && sdgs && Array.isArray(sdgs) && sdgs.map((sdg: any) => {
                                  const sdgDetail = sdgDetails[sdg.id];
                                  const investingCompanies = sdgDetail?.investingCompanies || [];
                                  const totalInvested = investingCompanies.reduce((sum: number, company: any) => {
                                    return sum + parseFloat(company.totalInvested || '0');
                                  }, 0);
                                  
                                  // Get target value for this SDG or use default
                                  const targetValue = sdgTargets[sdg.number as keyof typeof sdgTargets] || sdgTargets.default;
                                  const progressPercentage = Math.min(100, (totalInvested / targetValue) * 100);
                                  
                                  return (
                                    <SelectItem 
                                      key={sdg.id} 
                                      value={sdg.id.toString()}
                                    >
                                      <div className="flex items-center gap-2 w-full">
                                        <div 
                                          className="w-10 h-10 min-w-10 rounded flex items-center justify-center text-white text-xs font-medium" 
                                          style={{ backgroundColor: sdg.color }}
                                        >
                                          <div className="flex flex-col items-center justify-center">
                                            <span className="font-bold">{sdg.number}</span>
                                          </div>
                                        </div>
                                        <div className="flex flex-col w-full">
                                          <span className="font-medium">{sdg.name}</span>
                                          <div className="flex items-center justify-between w-full">
                                            <span className="text-xs text-gray-600">
                                              {totalInvested > 0 ? 
                                                `Investido: ${formatCurrency(totalInvested)}` :
                                                "Sem investimentos ainda"}
                                            </span>
                                            <span className="text-xs font-medium text-primary">
                                              Meta: {formatCurrency(targetValue)}
                                            </span>
                                          </div>
                                          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                                            <div 
                                              className="h-full bg-primary rounded-full"
                                              style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        disabled={uploadProofMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        {uploadProofMutation.isPending ? "Enviando..." : "Enviar Comprovativo"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Instructions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instruções</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">1. Realize o pagamento</h3>
                      <p className="text-sm text-gray-600">
                        Realize o pagamento do valor calculado para compensação de carbono através de transferência bancária para a nossa conta.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">2. Informações Bancárias</h3>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <p className="font-medium">Banco: Banco Nacional de Angola</p>
                        <p>Titular: Fundo Verde de Carbono</p>
                        <p>Conta: 00000000-0</p>
                        <p>IBAN: AO00 0000 0000 0000 0000 0000 0</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">3. Envie o Comprovativo</h3>
                      <p className="text-sm text-gray-600">
                        Anexe o comprovativo de transferência ou pagamento e envie para aprovação.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">4. Selecione um ODS (opcional)</h3>
                      <p className="text-sm text-gray-600">
                        Você pode escolher para qual Objetivo de Desenvolvimento Sustentável seu investimento será destinado. Se não selecionar, o administrador irá direcionar para um projeto adequado.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Payment Proofs History */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Comprovativos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPaymentProofs ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : paymentProofs && Array.isArray(paymentProofs) && paymentProofs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>ODS</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Comprovativo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentProofs.map((proof: any) => (
                          <TableRow key={proof.id}>
                            <TableCell>
                              {new Date(proof.createdAt).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(proof.amount)}
                            </TableCell>
                            <TableCell>
                              {proof.sdgName ? (
                                <div className="flex items-center gap-1">
                                  <div 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: proof.sdgColor }}
                                  />
                                  <span>ODS {proof.sdgNumber}: {proof.sdgName}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">Não selecionado</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(proof.status)}
                            </TableCell>
                            <TableCell>
                              <a 
                                href={proof.proofUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Ver
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum comprovativo enviado ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompanyPaymentProof;