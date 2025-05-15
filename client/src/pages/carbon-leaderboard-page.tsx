import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCarbonLeaderboard, useCompanyCarbonStats } from "@/hooks/use-carbon-leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trophy, AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema para o formulário de atualização de estatísticas
const carbonStatsSchema = z.object({
  totalEmissionKgCo2: z.coerce.number().min(0, "Valor deve ser positivo"),
  totalCompensationKgCo2: z.coerce.number().min(0, "Valor deve ser positivo"),
  carbonReductionPercentage: z.coerce.number().min(0, "Valor deve ser positivo").max(100, "Valor máximo é 100%"),
  period: z.string().default('all_time'),
});

type Period = 'monthly' | 'quarterly' | 'yearly' | 'all_time';

function formatNumber(value: number | string | undefined, decimals: number = 2): string {
  if (value === undefined) return "0";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function CarbonLeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('all_time');
  const { leaderboard, isLoading, error, updateCompanyCarbonStats, isUpdating, recalculateRanking, isRecalculating } = useCarbonLeaderboard(period);
  
  const companyId = user?.company?.id;
  const { stats: companyStats } = useCompanyCarbonStats(companyId || 0);
  
  const form = useForm<z.infer<typeof carbonStatsSchema>>({
    resolver: zodResolver(carbonStatsSchema),
    defaultValues: {
      totalEmissionKgCo2: companyStats?.totalEmissionKgCo2 || 0,
      totalCompensationKgCo2: companyStats?.totalCompensationKgCo2 || 0,
      carbonReductionPercentage: companyStats?.carbonReductionPercentage || 0,
      period: 'all_time',
    },
  });
  
  // Atualizar formulário quando dados da empresa forem carregados
  useEffect(() => {
    if (companyStats) {
      form.reset({
        totalEmissionKgCo2: parseFloat(companyStats.totalEmissionKgCo2.toString()),
        totalCompensationKgCo2: parseFloat(companyStats.totalCompensationKgCo2.toString()),
        carbonReductionPercentage: parseFloat(companyStats.carbonReductionPercentage.toString()),
        period: companyStats.period || 'all_time',
      });
    }
  }, [companyStats, form]);
  
  const onSubmit = (data: z.infer<typeof carbonStatsSchema>) => {
    if (companyId) {
      updateCompanyCarbonStats({ companyId, data });
    }
  };
  
  const isAdmin = user?.role === 'admin';
  const isCompany = user?.role === 'company';
  const isUserOnLeaderboard = leaderboard?.some(item => item.companyId === companyId);
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Leaderboard de Pegada de Carbono</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Compare a eficiência da sua empresa na redução de emissões de carbono com outras empresas
      </p>
      
      <Tabs defaultValue="leaderboard">
        <TabsList className="mb-6">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          {isCompany && <TabsTrigger value="update-stats">Atualizar Estatísticas</TabsTrigger>}
          {isAdmin && <TabsTrigger value="admin">Administração</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Ranking de Redução de Carbono</CardTitle>
                  <CardDescription>
                    Empresas ranqueadas por sua eficiência na redução de emissões
                  </CardDescription>
                </div>
                <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_time">Todos os tempos</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>
                    Não foi possível carregar os dados do leaderboard.
                  </AlertDescription>
                </Alert>
              ) : leaderboard?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Ainda não há dados para o período selecionado.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Posição</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Redução de Carbono</TableHead>
                      <TableHead className="text-right">Emissão (kg CO₂)</TableHead>
                      <TableHead className="text-right">Compensação (kg CO₂)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard?.map((item) => {
                      const isCurrentCompany = item.companyId === companyId;
                      return (
                        <TableRow 
                          key={item.id} 
                          className={isCurrentCompany ? "bg-green-50 dark:bg-green-900/20" : ""}
                        >
                          <TableCell className="font-bold">
                            <div className="flex items-center">
                              {item.carbonReductionRank <= 3 && (
                                <Trophy className={`mr-1 h-4 w-4 ${
                                  item.carbonReductionRank === 1 ? "text-yellow-500" :
                                  item.carbonReductionRank === 2 ? "text-gray-400" :
                                  "text-amber-700"
                                }`} />
                              )}
                              {item.carbonReductionRank}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {item.company?.name}
                              {isCurrentCompany && <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 py-0.5 px-2 rounded-full">Sua empresa</span>}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.company?.sector || "Setor não especificado"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={parseFloat(item.carbonReductionPercentage.toString())} className="h-2" />
                              <span className="text-sm font-medium">{formatNumber(item.carbonReductionPercentage)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.totalEmissionKgCo2, 1)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.totalCompensationKgCo2, 1)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </div>
            </CardFooter>
          </Card>
          
          {isCompany && !isUserOnLeaderboard && (
            <Alert className="mt-6">
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>Sua empresa ainda não está no leaderboard</AlertTitle>
              <AlertDescription>
                Atualize suas estatísticas de carbono para aparecer no ranking e comparar seu desempenho.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        {isCompany && (
          <TabsContent value="update-stats">
            <Card>
              <CardHeader>
                <CardTitle>Atualizar Estatísticas de Carbono</CardTitle>
                <CardDescription>
                  Atualize os dados de emissão e compensação de carbono da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="totalEmissionKgCo2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total de Emissões (kg CO₂)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            O total de emissões de carbono da sua empresa em kg de CO₂
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="totalCompensationKgCo2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total de Compensações (kg CO₂)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            O total de compensações de carbono da sua empresa em kg de CO₂
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="carbonReductionPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentual de Redução de Carbono (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" max="100" {...field} />
                          </FormControl>
                          <FormDescription>
                            O percentual de redução nas emissões de carbono em relação ao período anterior
                          </FormDescription>
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
                              <SelectItem value="all_time">Todos os tempos</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            O período a que se referem estas estatísticas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Dados
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Administração do Leaderboard</CardTitle>
                <CardDescription>
                  Ferramentas administrativas para gerenciar o leaderboard de carbono
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Recalcular Ranking</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Recalcule o ranking de todas as empresas com base nas estatísticas atuais
                    </p>
                    <Button 
                      onClick={() => recalculateRanking()} 
                      disabled={isRecalculating}
                      className="w-fit"
                    >
                      {isRecalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Recalcular Ranking
                    </Button>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Estatísticas do Leaderboard</h3>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[170px]" />
                      </div>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        <li>Total de empresas no ranking: {leaderboard?.length || 0}</li>
                        <li>Média de redução de carbono: {
                          leaderboard?.length
                            ? formatNumber(
                                leaderboard.reduce((acc, item) => 
                                  acc + parseFloat(item.carbonReductionPercentage.toString()), 0) / leaderboard.length
                              )
                            : "0"
                        }%</li>
                        <li>Total de emissões compensadas: {
                          formatNumber(
                            leaderboard?.reduce((acc, item) => 
                              acc + parseFloat(item.totalCompensationKgCo2.toString()), 0) || 0
                          )
                        } kg CO₂</li>
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}