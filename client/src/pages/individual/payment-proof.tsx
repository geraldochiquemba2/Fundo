import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download
} from "lucide-react";

// Form validation schema
const paymentProofSchema = z.object({
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
  sdgId: z.string().min(1, "Selecione um ODS"),
  consumptionRecordId: z.string().optional(),
});

type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;

const IndividualPaymentProof = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch consumption records
  const { data: consumptionRecords, isLoading: isLoadingConsumption } = useQuery({
    queryKey: ['/api/individual/consumption'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch SDGs
  const { data: sdgs, isLoading: isLoadingSdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  // Fetch payment proofs
  const { data: paymentProofs, isLoading: isLoadingProofs } = useQuery({
    queryKey: ['/api/individual/payment-proofs'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Create payment proof mutation
  const createPaymentProofMutation = useMutation({
    mutationFn: async (data: PaymentProofFormValues & { file: File }) => {
      const formData = new FormData();
      formData.append('paymentProof', data.file);
      formData.append('amount', data.amount.toString());
      formData.append('sdgId', data.sdgId);
      if (data.consumptionRecordId && data.consumptionRecordId !== 'none') {
        formData.append('consumptionRecordId', data.consumptionRecordId);
      }
      
      const res = await fetch('/api/individual/payment-proofs', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Erro ao enviar comprovativo');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/individual/payment-proofs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/individual/stats'] });
      toast({
        title: "Comprovativo enviado",
        description: "Seu comprovativo foi enviado com sucesso e está aguardando aprovação!",
      });
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar",
        description: error.message || "Ocorreu um erro ao enviar o comprovativo.",
        variant: "destructive",
      });
    },
  });
  
  // Initialize form
  const form = useForm<PaymentProofFormValues>({
    resolver: zodResolver(paymentProofSchema),
    defaultValues: {
      amount: 0,
      sdgId: '',
      consumptionRecordId: '',
    },
  });
  
  const onSubmit = (data: PaymentProofFormValues) => {
    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione o arquivo do comprovativo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    createPaymentProofMutation.mutate({ ...data, file: selectedFile });
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um arquivo PDF ou imagem (JPG, PNG).",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Format currency
  const formatCurrency = (value: string | number) => {
    if (!value) return "0 Kz";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0 Kz";
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) + " Kz";
  };
  
  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pendente
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          Aprovado
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejeitado
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Comprovativo de Pagamento
            </h1>
            <p className="text-gray-600 mt-2">
              Envie seu comprovativo de pagamento para compensar a pegada de carbono
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Enviar Comprovativo
                  </CardTitle>
                  <CardDescription>
                    Envie o comprovativo de pagamento para compensar sua pegada de carbono
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* File upload */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Arquivo do Comprovativo *
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={triggerFileInput}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Selecionar Arquivo
                          </Button>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        {selectedFile && (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFile(null)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Formatos aceitos: PDF, JPG, PNG. Tamanho máximo: 10MB.
                        </p>
                      </div>
                      
                      <Separator />
                      
                      {/* Amount */}
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Pago (Kz)</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 50000"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Valor em Kwanzas que foi pago para compensar a pegada de carbono
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* SDG Selection */}
                      <FormField
                        control={form.control}
                        name="sdgId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objetivo de Desenvolvimento Sustentável (ODS)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um ODS" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px] overflow-y-auto">
                                {!isLoadingSdgs && sdgs && Array.isArray(sdgs) && sdgs.map((sdg: any) => (
                                  <SelectItem key={sdg.id} value={sdg.id.toString()}>
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-4 h-4 rounded-sm" 
                                        style={{ backgroundColor: sdg.color }}
                                      />
                                      <span>ODS {sdg.number}: {sdg.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Selecione o ODS para o qual deseja destinar seu investimento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Consumption Record (optional) */}
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
                              <SelectContent className="max-h-[300px] overflow-y-auto">
                                <SelectItem value="none">Nenhum (pagamento avulso)</SelectItem>
                                {!isLoadingConsumption && consumptionRecords && Array.isArray(consumptionRecords) && consumptionRecords.map((record: any) => (
                                  <SelectItem key={record.id} value={record.id.toString()}>
                                    {record.period} - {record.month}/{record.year} - {formatCurrency(record.compensationValueKz)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Vincule este pagamento a um registro de consumo específico (opcional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isUploading || createPaymentProofMutation.isPending}
                      >
                        {isUploading || createPaymentProofMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar Comprovativo
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            {/* Info Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    Como Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Calcule sua pegada</p>
                        <p className="text-sm text-gray-600">Use a calculadora para saber quanto CO₂ você emite</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Faça o pagamento</p>
                        <p className="text-sm text-gray-600">Pague o valor para compensar sua pegada</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Envie o comprovativo</p>
                        <p className="text-sm text-gray-600">Faça upload do comprovativo aqui</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Aprovação</p>
                        <p className="text-sm text-gray-600">Aguarde a aprovação do admin</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Payment Proofs History */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Comprovativos</CardTitle>
                <CardDescription>
                  Seus comprovativos enviados e seus status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProofs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Carregando...
                  </div>
                ) : paymentProofs && paymentProofs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>ODS</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentProofs.map((proof: any) => (
                          <TableRow key={proof.id}>
                            <TableCell>
                              {new Date(proof.createdAt).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>{formatCurrency(proof.amount)}</TableCell>
                            <TableCell>
                              {proof.sdg ? (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: proof.sdg.color }}
                                  />
                                  <span className="text-sm">ODS {proof.sdg.number}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(proof.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a href={proof.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum comprovativo enviado ainda</p>
                    <p className="text-sm text-gray-400">Envie seu primeiro comprovativo usando o formulário acima</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default IndividualPaymentProof;