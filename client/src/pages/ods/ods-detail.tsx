import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProjectCard from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { 
  ArrowLeft, 
  Info,
  Users,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import DebugImage from "@/components/debug-image";

// Função auxiliar para obter as iniciais de um nome
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const OdsDetail = () => {
  const { id } = useParams();
  
  // Fetch SDG details
  const { data: sdg, isLoading: isLoadingSdg } = useQuery({
    queryKey: [`/api/sdgs/${id}`],
    staleTime: 1000 * 60 * 60, // 1 hour
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
  
  // Remove duplicatas de empresas
  const getUniqueCompanies = (companies: any[]) => {
    if (!companies || !Array.isArray(companies)) return [];
    
    // Mapeamento de IDs para evitar duplicação
    const uniqueCompaniesMap = new Map();
    
    companies.forEach(company => {
      // Se a empresa já existir, somamos o valor investido
      if (uniqueCompaniesMap.has(company.id)) {
        const existingCompany = uniqueCompaniesMap.get(company.id);
        const totalInvested = parseFloat(existingCompany.totalInvested) + parseFloat(company.totalInvested);
        existingCompany.totalInvested = totalInvested.toString();
      } else {
        // Nova empresa
        uniqueCompaniesMap.set(company.id, { ...company });
      }
    });
    
    // Converter o Map de volta para um array
    return Array.from(uniqueCompaniesMap.values());
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Loading state */}
      {isLoadingSdg ? (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      ) : sdg ? (
        <>
          {/* Header with SDG Info */}
          <section 
            className="py-12"
            style={{
              backgroundColor: `${sdg.color}20`, // Using color with 20% opacity
            }}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Link href="/ods">
                  <Button variant="ghost" className="mb-4 -ml-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para ODS
                  </Button>
                </Link>
                
                <div className="flex items-center mb-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mr-4"
                    style={{ backgroundColor: sdg.color }}
                  >
                    <span className="text-white font-bold text-2xl">{sdg.number}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="font-bold text-3xl text-gray-800">{sdg.name}</h1>
                      <span className="font-bold text-xl text-primary">
                        {formatCurrency(sdg.investingCompanies && sdg.investingCompanies.length > 0 
                          ? getUniqueCompanies(sdg.investingCompanies).reduce((total: number, company: any) => 
                              total + parseFloat(company.totalInvested || 0), 0).toString()
                          : "0")}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8">{sdg.description}</p>
              </div>
            </div>
          </section>
          
          {/* Projects Section */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="projects">
                  <TabsList className="mb-6">
                    <TabsTrigger value="projects" className="flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Projetos
                    </TabsTrigger>
                    <TabsTrigger value="companies" className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Empresas Investidoras
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Projects Tab */}
                  <TabsContent value="projects">
                    <h2 className="font-semibold text-xl text-gray-800 mb-4">
                      Projetos Relacionados
                    </h2>
                    
                    {sdg.projects && sdg.projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sdg.projects.map((project: any) => (
                          <ProjectCard
                            key={project.id}
                            id={project.id}
                            name={project.name}
                            description={project.description}
                            imageUrl={project.imageUrl}
                            totalInvested={project.totalInvested}
                            displayInvestment={project.displayInvestment}
                            sdg={sdg}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Nenhum projeto encontrado para este ODS.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Investing Companies Tab */}
                  <TabsContent value="companies">
                    <h2 className="font-semibold text-xl text-gray-800 mb-4">
                      Empresas Investidoras
                    </h2>
                    
                    {sdg.investingCompanies && sdg.investingCompanies.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Empresa</TableHead>
                              <TableHead>Setor</TableHead>
                              <TableHead className="text-right">Valor Investido</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getUniqueCompanies(sdg.investingCompanies).map((company: any) => (
                              <TableRow key={company.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage 
                                        src={company.logoUrl} 
                                        alt={company.name} 
                                      />
                                      <AvatarFallback className="bg-primary-50 text-primary-700">
                                        {getInitials(company.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{company.name}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {company.sector || "Não informado"}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(company.totalInvested)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Building className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Nenhuma empresa investiu neste ODS ainda.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="font-bold text-2xl text-gray-800 mb-4">ODS não encontrado</h1>
          <p className="text-gray-600 mb-8">O ODS que você está procurando não foi encontrado.</p>
          <Button asChild>
            <Link href="/ods">Voltar para ODS</Link>
          </Button>
        </div>
      )}
      
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
};

export default OdsDetail;
