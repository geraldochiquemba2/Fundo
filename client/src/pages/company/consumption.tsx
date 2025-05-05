import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Droplet, Car, CalculatorIcon, AlertCircle, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the form schema
const consumptionSchema = z.object({
  energyKwh: z.coerce.number().min(0, "Deve ser um número positivo").optional(),
  fuelLiters: z.coerce.number().min(0, "Deve ser um número positivo").optional(),
  fuelType: z.string().optional(),
  transportKm: z.coerce.number().min(0, "Deve ser um número positivo").optional(),
  transportType: z.string().optional(),
  period: z.string().min(1, "Selecione um período"),
  emissionKgCo2: z.coerce.number().min(0),
  compensationValueKz: z.coerce.number().min(0),
});

type ConsumptionFormValues = z.infer<typeof consumptionSchema>;

// Emission factors
const EMISSION_FACTORS = {
  energy: 0.5, // kg CO2 per kWh
  fuel: {
    diesel: 2.68, // kg CO2 per liter
    gasoline: 2.31, // kg CO2 per liter
    natural_gas: 2.02, // kg CO2 per m³
  },
  transport: {
    car: 0.12, // kg CO2 per km
    truck: 0.3, // kg CO2 per km
    airplane: 0.15, // kg CO2 per km
  },
};

// Compensation rate
const COMPENSATION_RATE = 50; // Kz per kg CO2

const CompanyConsumption = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalEmission, setTotalEmission] = useState(0);
  const [compensationValue, setCompensationValue] = useState(0);
  
  // Fetch consumption records
  const { data: consumptionRecords, isLoading } = useQuery({
    queryKey: ['/api/company/consumption'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Initialize form
  const form = useForm<ConsumptionFormValues>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      energyKwh: 0,
      fuelLiters: 0,
      fuelType: "diesel",
      transportKm: 0,
      transportType: "car",
      period: "monthly",
      emissionKgCo2: 0,
      compensationValueKz: 0,
    },
  });
  
  // Watch form values to calculate emission in real time
  const energyKwh = form.watch("energyKwh") || 0;
  const fuelLiters = form.watch("fuelLiters") || 0;
  const fuelType = form.watch("fuelType") || "diesel";
  const transportKm = form.watch("transportKm") || 0;
  const transportType = form.watch("transportType") || "car";
  
  // Update calculations when form values change
  useEffect(() => {
    // Calculate emissions
    const energyEmission = energyKwh * EMISSION_FACTORS.energy;
    
    const fuelEmission = fuelLiters * (
      fuelType === "diesel" ? EMISSION_FACTORS.fuel.diesel :
      fuelType === "gasoline" ? EMISSION_FACTORS.fuel.gasoline :
      EMISSION_FACTORS.fuel.natural_gas
    );
    
    const transportEmission = transportKm * (
      transportType === "car" ? EMISSION_FACTORS.transport.car :
      transportType === "truck" ? EMISSION_FACTORS.transport.truck :
      EMISSION_FACTORS.transport.airplane
    );
    
    const totalEmission = energyEmission + fuelEmission + transportEmission;
    setTotalEmission(totalEmission);
    
    // Calculate compensation value
    const compensationValue = totalEmission * COMPENSATION_RATE;
    setCompensationValue(compensationValue);
    
    // Update form values
    form.setValue("emissionKgCo2", totalEmission);
    form.setValue("compensationValueKz", compensationValue);
  }, [energyKwh, fuelLiters, fuelType, transportKm, transportType, form]);
  
  // Create consumption record
  const createConsumptionMutation = useMutation({
    mutationFn: async (data: ConsumptionFormValues) => {
      const res = await apiRequest("POST", "/api/company/consumption", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company/consumption'] });
      toast({
        title: "Consumo registrado",
        description: "Seu consumo foi registrado com sucesso.",
      });
      
      // Reset form
      form.reset({
        energyKwh: 0,
        fuelLiters: 0,
        fuelType: "diesel",
        transportKm: 0,
        transportType: "car",
        period: "monthly",
        emissionKgCo2: 0,
        compensationValueKz: 0,
      });
      
      setTotalEmission(0);
      setCompensationValue(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar consumo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ConsumptionFormValues) => {
    // Ensure at least one consumption type is provided
    if (
      (data.energyKwh === 0 || !data.energyKwh) &&
      (data.fuelLiters === 0 || !data.fuelLiters) &&
      (data.transportKm === 0 || !data.transportKm)
    ) {
      toast({
        title: "Dados insuficientes",
        description: "Informe pelo menos um tipo de consumo (energia, combustível ou transporte).",
        variant: "destructive",
      });
      return;
    }
    
    createConsumptionMutation.mutate(data);
  };
  
  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar type="company" />
        
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Inserir Consumo</h1>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Insira os dados de consumo da sua empresa para calcular a pegada de carbono e o valor a ser compensado.
                  </p>
                  
                  <Alert className="bg-primary-50 border-primary/30 text-primary">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Os cálculos são baseados em fatores de emissão padrão para o setor.
                    </AlertDescription>
                  </Alert>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Energy Section */}
                    <div className="mb-6 p-4 border border-gray-200 rounded-md">
                      <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                        <Zap className="text-yellow-500 mr-2 h-5 w-5" />
                        Consumo de Energia
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="energyKwh"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Energia Elétrica (kWh)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "0" : e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="period"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Período</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um período" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="monthly">Mensal</SelectItem>
                                  <SelectItem value="quarterly">Trimestral</SelectItem>
                                  <SelectItem value="yearly">Anual</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4 bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estimativa de emissão:</span>
                          <span className="font-medium">{formatNumber(energyKwh * EMISSION_FACTORS.energy)} kg CO₂</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fuel Section */}
                    <div className="mb-6 p-4 border border-gray-200 rounded-md">
                      <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                        <Droplet className="text-orange-500 mr-2 h-5 w-5" />
                        Consumo de Combustíveis
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="fuelType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Combustível</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um combustível" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="diesel">Diesel</SelectItem>
                                  <SelectItem value="gasoline">Gasolina</SelectItem>
                                  <SelectItem value="natural_gas">Gás Natural (m³)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fuelLiters"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade (litros ou m³)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "0" : e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4 bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estimativa de emissão:</span>
                          <span className="font-medium">
                            {formatNumber(
                              fuelLiters * (
                                fuelType === "diesel" ? EMISSION_FACTORS.fuel.diesel :
                                fuelType === "gasoline" ? EMISSION_FACTORS.fuel.gasoline :
                                EMISSION_FACTORS.fuel.natural_gas
                              )
                            )} kg CO₂
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Transport Section */}
                    <div className="mb-6 p-4 border border-gray-200 rounded-md">
                      <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                        <Car className="text-blue-500 mr-2 h-5 w-5" />
                        Transporte
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="transportType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Transporte</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="car">Carro</SelectItem>
                                  <SelectItem value="truck">Caminhão</SelectItem>
                                  <SelectItem value="airplane">Avião</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="transportKm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distância (km)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "0" : e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4 bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estimativa de emissão:</span>
                          <span className="font-medium">
                            {formatNumber(
                              transportKm * (
                                transportType === "car" ? EMISSION_FACTORS.transport.car :
                                transportType === "truck" ? EMISSION_FACTORS.transport.truck :
                                EMISSION_FACTORS.transport.airplane
                              )
                            )} kg CO₂
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Results Section */}
                    <div className="p-4 bg-primary-50 border border-primary-100 rounded-md mb-6">
                      <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
                        <CalculatorIcon className="text-primary mr-2 h-5 w-5" />
                        Total Calculado
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Emissão total estimada:</p>
                          <p className="text-3xl font-bold text-primary-700">
                            {formatNumber(totalEmission)} kg CO₂
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Valor a compensar:</p>
                          <p className="text-3xl font-bold text-primary-700">
                            {formatCurrency(compensationValue)} Kz
                          </p>
                          <p className="text-xs text-gray-500">Baseado na taxa de {COMPENSATION_RATE} Kz por kg de CO₂</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="mr-3"
                        onClick={() => form.reset()}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createConsumptionMutation.isPending}
                      >
                        {createConsumptionMutation.isPending ? (
                          "Salvando..."
                        ) : (
                          "Salvar Dados de Consumo"
                        )}
                      </Button>
                    </div>
                    
                    {createConsumptionMutation.isSuccess && (
                      <div className="flex items-center text-green-600 text-sm mt-2">
                        <Check className="h-4 w-4 mr-2" />
                        Consumo registrado com sucesso!
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Previous Consumption */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consumo Anterior</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Carregando registros de consumo...</div>
                ) : consumptionRecords && consumptionRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Energia (kWh)</TableHead>
                          <TableHead>Combustível (l/m³)</TableHead>
                          <TableHead>Transporte (km)</TableHead>
                          <TableHead>Emissão (kg CO₂)</TableHead>
                          <TableHead>Valor (Kz)</TableHead>
                          <TableHead>Período</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consumptionRecords.map((record: any) => (
                          <TableRow key={record.id}>
                            <TableCell>{new Date(record.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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
                            <TableCell>{formatNumber(record.emissionKgCo2)}</TableCell>
                            <TableCell>{formatCurrency(parseFloat(record.compensationValueKz))}</TableCell>
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
                  <div className="text-center py-4">Nenhum registro de consumo encontrado.</div>
                )}
                
                <div className="mt-4 text-center">
                  <Button asChild variant="link" className="text-primary">
                    <Link href="/empresa/historico">Ver histórico completo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompanyConsumption;
