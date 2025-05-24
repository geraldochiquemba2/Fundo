import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Building2, Factory } from "lucide-react";

// Componente de detalhe do setor
const SectorDetail = ({ sector, companies }: { sector: string, companies: any[] }) => (
  <Card className="mb-8">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-red-500" />
            Setor: {sector}
          </CardTitle>
          <CardDescription>
            Empresas deste setor e suas emissões de carbono
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead className="text-right">Emissões (kg CO₂)</TableHead>
            <TableHead className="text-right">Compensações (kg CO₂)</TableHead>
            <TableHead className="text-right">Redução (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="text-right">{parseFloat(company.emissions).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right">{parseFloat(company.compensations).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right">
                <Badge 
                  variant="outline"
                  className={parseFloat(company.reduction) > 50 ? "bg-green-100 text-green-800" : ""}
                >
                  {parseFloat(company.reduction).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                Nenhuma empresa encontrada neste setor
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function SetoresPoluentes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Redirecionar se não for admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Buscar estatísticas do dashboard admin
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: user?.role === 'admin',
  });

  // Agrupar empresas por setor
  const sectorCompanies = stats?.sectorEmissions?.reduce((acc: any, item: any) => {
    const { sector, company_id, company_name, emissions, compensations, reduction } = item;
    
    if (!acc[sector]) {
      acc[sector] = [];
    }
    
    acc[sector].push({
      id: company_id,
      name: company_name,
      emissions,
      compensations,
      reduction
    });
    
    return acc;
  }, {}) || {};

  // Sort sectors by total emissions (highest to lowest)
  const sectors = Object.keys(sectorCompanies).sort((a, b) => {
    const totalEmissionsA = sectorCompanies[a].reduce(
      (sum: number, company: any) => sum + parseFloat(company.emissions), 0
    );
    const totalEmissionsB = sectorCompanies[b].reduce(
      (sum: number, company: any) => sum + parseFloat(company.emissions), 0
    );
    return totalEmissionsB - totalEmissionsA; // Sort descending (highest first)
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Setores Mais Poluentes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise das emissões de carbono por setor empresarial
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
            Não foi possível carregar os dados dos setores.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Visão geral dos setores */}
          {!selectedSector ? (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Visão Geral dos Setores</CardTitle>
                  <CardDescription>
                    Clique em um setor para ver detalhes das empresas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectors.map((sector) => {
                      // Calcular totais do setor
                      const totalEmissions = sectorCompanies[sector].reduce(
                        (sum: number, company: any) => sum + parseFloat(company.emissions), 0
                      );
                      
                      return (
                        <Card 
                          key={sector}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedSector(sector)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-2 mb-2">
                              <Building2 className="h-5 w-5 text-gray-500" />
                              <h3 className="font-semibold text-lg">{sector}</h3>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Empresas:</span>
                                <span className="font-medium">{sectorCompanies[sector].length}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Emissões totais:</span>
                                <span className="font-medium text-red-600">
                                  {totalEmissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg CO₂
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {sectors.length === 0 && (
                      <div className="col-span-3 text-center py-10 text-gray-500">
                        Não há dados disponíveis sobre setores e emissões
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Botão para voltar à visão geral */}
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedSector(null)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para todos os setores
                </Button>
              </div>
              
              {/* Detalhe do setor selecionado */}
              <SectorDetail 
                sector={selectedSector} 
                companies={sectorCompanies[selectedSector] || []} 
              />
            </>
          )}
        </>
      )}
    </div>
  );
}