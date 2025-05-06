import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProjectCard from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Building, 
  ImageIcon,
  Users,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import DebugImage from "@/components/debug-image";

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
                  <h1 className="font-bold text-3xl text-gray-800">{sdg.name}</h1>
                </div>
                
                <p className="text-gray-600 mb-8">{sdg.description}</p>
              </div>
            </div>
          </section>
          
          {/* Tabs for Projects, Companies and Gallery */}
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
                    <TabsTrigger value="gallery" className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Galeria
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
                  
                  {/* Companies Tab */}
                  <TabsContent value="companies">
                    <h2 className="font-semibold text-xl text-gray-800 mb-4">
                      Empresas Investidoras
                    </h2>
                    
                    {sdg.investingCompanies && sdg.investingCompanies.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sdg.investingCompanies.map((company: any) => (
                          <Card key={company.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage 
                                      src={company.logoUrl}
                                      alt={company.name}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-primary text-white">
                                      {company.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium text-gray-900">{company.name}</h3>
                                    <p className="text-xs text-gray-500">Setor: {company.sector}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="mb-4">
                                  <p className="text-sm text-gray-500">Total investido</p>
                                  <p className="font-medium text-primary text-lg">
                                    {formatCurrency(company.totalInvested)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Nenhuma empresa investiu neste ODS ainda.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Gallery Tab */}
                  <TabsContent value="gallery">
                    <h2 className="font-semibold text-xl text-gray-800 mb-4">
                      Galeria de Mídia
                    </h2>
                    
                    {/* We would need to fetch the media from projects related to this SDG */}
                    {/* For now, just show a message */}
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">As mídias relacionadas a este ODS serão exibidas aqui.</p>
                    </div>
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
