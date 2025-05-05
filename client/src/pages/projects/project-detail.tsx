import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  CalendarDays, 
  Building, 
  ImageIcon,
  Users,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ProjectDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
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
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-40 mb-6" />
          <Skeleton className="h-80 w-full rounded-lg mb-8" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4 mb-6" />
          <Skeleton className="h-10 w-full mb-8" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="font-bold text-2xl text-gray-800 mb-4">Projeto não encontrado</h1>
          <p className="text-gray-600 mb-8">O projeto que você está procurando não foi encontrado.</p>
          <Button asChild>
            <Link href="/projetos">Voltar para Projetos</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/projetos">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Projetos
          </Button>
        </Link>
        
        {/* Project Hero */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-80 overflow-hidden relative">
            <img 
              src={project.imageUrl} 
              alt={project.name} 
              className="w-full h-full object-cover"
            />
            {project.sdg && (
              <div className="absolute top-4 left-4">
                <Badge 
                  style={{ backgroundColor: project.sdg.color }}
                  className="text-white font-medium text-sm px-3 py-1"
                >
                  ODS {project.sdg.number}: {project.sdg.name}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h1 className="font-bold text-3xl text-gray-800 mb-4">{project.name}</h1>
            
            <div className="flex items-center mb-6">
              <Badge variant="outline" className="flex items-center mr-4">
                <CalendarDays className="h-4 w-4 mr-1" />
                Criado em {formatDate(project.createdAt)}
              </Badge>
              <Badge className="bg-green-100 text-green-800 font-medium">
                {formatCurrency(project.totalInvested)} investidos
              </Badge>
            </div>
            
            <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
          </div>
        </div>
        
        {/* Tabs for Updates, Companies and Gallery */}
        <Tabs defaultValue="updates">
          <TabsList className="mb-6">
            <TabsTrigger value="updates" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Atualizações
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
          
          {/* Updates Tab */}
          <TabsContent value="updates">
            <h2 className="font-semibold text-xl text-gray-800 mb-4">
              Atualizações do Projeto
            </h2>
            
            {project.updates && project.updates.length > 0 ? (
              <div className="space-y-6">
                {project.updates.map((update: any) => (
                  <div key={update.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{update.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(update.createdAt)}
                    </div>
                    <p className="text-gray-600 whitespace-pre-line mb-4">{update.content}</p>
                    
                    {update.mediaUrls && update.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                        {update.mediaUrls.map((url: string, index: number) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt={`Mídia ${index + 1}`} 
                            className="h-24 w-full object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(url)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhuma atualização disponível para este projeto.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Companies Tab */}
          <TabsContent value="companies">
            <h2 className="font-semibold text-xl text-gray-800 mb-4">
              Empresas Investidoras
            </h2>
            
            {project.investments && project.investments.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Empresa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Investido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data do Investimento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {project.investments.map((investment: any, index: number) => (
                        <tr key={investment.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={investment.company.logoUrl} alt={investment.company.name} />
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(investment.company.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium text-gray-900">
                                {investment.company.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800 font-medium">
                              {formatCurrency(investment.amount)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(investment.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhuma empresa investiu neste projeto ainda.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <h2 className="font-semibold text-xl text-gray-800 mb-4">
              Galeria de Mídia
            </h2>
            
            {project.updates && project.updates.some((update: any) => update.mediaUrls && update.mediaUrls.length > 0) ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {project.updates.flatMap((update: any) => 
                  update.mediaUrls ? update.mediaUrls.map((url: string, mediaIndex: number) => (
                    <div 
                      key={`${update.id}-${mediaIndex}`}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(url)}
                    >
                      <img 
                        src={url} 
                        alt={`Mídia do projeto`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )) : []
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhuma mídia disponível para este projeto.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Image modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-full">
              <img 
                src={selectedImage} 
                alt="Imagem ampliada" 
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
