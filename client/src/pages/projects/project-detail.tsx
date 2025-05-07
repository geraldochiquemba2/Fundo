import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Clock,
  Edit,
  Upload,
  X
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EcoLoading } from "@/components/ui/eco-loading";
import { EcoBackground } from "@/components/ui/eco-background";

// Define schema para o formulário de edição de atualização
const updateSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

const ProjectDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditUpdateOpen, setIsEditUpdateOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<any>(null);
  const [updateMediaFiles, setUpdateMediaFiles] = useState<File[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth() || {};
  
  // Verificar se o usuário é admin
  const isAdmin = user?.role === 'admin';
  
  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // React Hook Form para edição de atualização
  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: "",
      content: ""
    }
  });
  
  // Refatorada para não usar mais - utilizando função direta
  const editUpdateMutation = useMutation({
    mutationFn: async ({ updateId, data, mediaFiles }: { updateId: number, data: UpdateFormValues, mediaFiles: File[] }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      
      // Adicionar arquivos de mídia, se houver
      mediaFiles.forEach(file => {
        formData.append("media", file);
      });
      
      // Importante: sempre incluir as URLs existentes
      formData.append("existingMediaUrls", JSON.stringify(existingMediaUrls));
      
      const res = await fetch(`/api/admin/project-updates/${updateId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erro ao editar atualização");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Atualização editada",
        description: "A atualização foi editada com sucesso.",
      });
      
      // Reset form and close dialog
      updateForm.reset();
      setIsEditUpdateOpen(false);
      setUpdateToEdit(null);
      setUpdateMediaFiles([]);
      setExistingMediaUrls([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao editar atualização",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Função para abrir o diálogo de edição
  const openEditUpdateDialog = (update: any) => {
    setUpdateToEdit(update);
    setIsEditUpdateOpen(true);
    setUpdateMediaFiles([]);
    
    // Definir imagens existentes
    if (update.mediaUrls && Array.isArray(update.mediaUrls)) {
      setExistingMediaUrls([...update.mediaUrls]);
      console.log("Imagens existentes carregadas:", update.mediaUrls);
    } else {
      setExistingMediaUrls([]);
      console.log("Sem imagens existentes para carregar");
    }
    
    // Preencher o formulário com os dados da atualização
    updateForm.reset({
      title: update.title,
      content: update.content
    });
  };
  
  // Remover uma imagem existente 
  const removeExistingImage = (index: number) => {
    setExistingMediaUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Processar envio do formulário de edição
  const onUpdateEditSubmit = async (data: UpdateFormValues) => {
    if (!updateToEdit) {
      toast({
        title: "Erro",
        description: "Nenhuma atualização selecionada para edição.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 1. Primeiro, atualizar título e conteúdo
      const textResponse = await fetch(`/api/admin/project-updates/${updateToEdit.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content
        }),
        credentials: "include",
      });
      
      if (!textResponse.ok) {
        const error = await textResponse.text();
        throw new Error(error || "Erro ao atualizar textos");
      }
      
      // 2. Depois, fazer upload das imagens em uma requisição separada
      // Apenas se houver novas imagens OU se a lista de imagens existentes mudou
      const hasMediaChanges = updateMediaFiles.length > 0 || 
        (updateToEdit.mediaUrls?.length || 0) !== existingMediaUrls.length;
      
      if (hasMediaChanges) {
        console.log("Atualizando imagens...");
        const mediaFormData = new FormData();
        
        // Adicionar imagens existentes que queremos manter
        mediaFormData.append("existingMediaUrls", JSON.stringify(existingMediaUrls));
        
        // Adicionar novas imagens
        updateMediaFiles.forEach(file => {
          mediaFormData.append("media", file);
        });
        
        const mediaResponse = await fetch(`/api/admin/project-updates/${updateToEdit.id}/replace-images`, {
          method: "POST",
          body: mediaFormData,
          credentials: "include",
        });
        
        if (!mediaResponse.ok) {
          const error = await mediaResponse.text();
          throw new Error(error || "Erro ao atualizar imagens");
        }
      }
      
      // Sucesso!
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Atualização editada",
        description: "A atualização foi editada com sucesso.",
      });
      
      // Reset form and close dialog
      updateForm.reset();
      setIsEditUpdateOpen(false);
      setUpdateToEdit(null);
      setUpdateMediaFiles([]);
      setExistingMediaUrls([]);
      
    } catch (error: any) {
      toast({
        title: "Erro ao editar atualização",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Lidar com upload de mídia
  const handleUpdateMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUpdateMediaFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  // Remover um arquivo de mídia
  const removeMediaFile = (index: number) => {
    setUpdateMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
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
          <div className="animate-eco-fade-in">
            <div className="mb-6 flex items-center gap-2">
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="relative mb-8">
              <Skeleton className="h-80 w-full rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Importar EcoLoading de @/components/ui/eco-loading */}
                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-full animate-eco-pulse">
                  {/* Use uma das variações de carregamento com tema eco */}
                  <EcoLoading theme="leaf" size="lg" text="Carregando projeto..." />
                </div>
              </div>
            </div>
            <div className="space-y-4 animate-eco-fade-in" style={{ animationDelay: '0.3s' }}>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <EcoBackground variant="leaf" density="light" className="rounded-lg p-8">
            <div className="text-center">
              <div className="animate-eco-float mb-4">
                <svg 
                  width="60" 
                  height="60" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto text-primary/70"
                >
                  <path d="M9.5 3.5V2M14.5 3.5V2M9.5 22V20.5M14.5 22V20.5M22 9.5H20.5M22 14.5H20.5M3.5 9.5H2M3.5 14.5H2M20 12C20 16.4183 16.4183 20 12 20M20 12C20 7.58172 16.4183 4 12 4M12 20C7.58172 20 4 16.4183 4 12M12 4C7.58172 4 4 7.58172 4 12M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="font-bold text-2xl text-gray-800 mb-4 animate-eco-fade-in">Projeto não encontrado</h1>
              <p className="text-gray-600 mb-8 animate-eco-fade-in" style={{animationDelay: "0.2s"}}>O projeto que você está procurando não foi encontrado.</p>
              <div className="animate-eco-fade-in" style={{animationDelay: "0.4s"}}>
                <Button asChild>
                  <Link href="/projetos">Voltar para Projetos</Link>
                </Button>
              </div>
            </div>
          </EcoBackground>
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
                {formatCurrency(project.displayInvestment?.displayAmount || project.totalInvested)} investidos
              </Badge>
            </div>
            
            <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
          </div>
        </div>
        
        {/* Tabs for Updates */}
        <Tabs defaultValue="updates">
          <TabsList className="mb-6">
            <TabsTrigger value="updates" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Atualizações
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
                  <div key={update.id} className="bg-white rounded-lg shadow-md p-6 animate-eco-fade-in">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">{update.title}</h3>
                      {isAdmin && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openEditUpdateDialog(update)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4 text-gray-500 hover:text-amber-600" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(update.createdAt)}
                    </div>
                    <p className="text-gray-600 whitespace-pre-line mb-4">{update.content}</p>
                    
                    {update.mediaUrls && update.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                        {update.mediaUrls.map((url: string, index: number) => {
                          console.log(`Renderizando imagem ${index} da atualização ${update.id}:`, url);
                          // Garantir que a URL comece com / se necessário
                          const fullUrl = url.startsWith('/') ? url : `/${url}`;
                          return (
                            <div 
                              key={index} 
                              className="group relative overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 animate-eco-grow"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <img 
                                src={fullUrl} 
                                alt={`Mídia ${index + 1}`} 
                                className="h-24 w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                onClick={() => setSelectedImage(fullUrl)}
                                onError={(e) => {
                                  console.error(`Erro ao carregar imagem: ${fullUrl}`);
                                  e.currentTarget.src = '/placeholder-image.png';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                                <span className="text-xs text-white font-medium">Ver imagem</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg animate-eco-fade-in">
                <div className="animate-eco-float mb-4 text-primary/40">
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                  >
                    <path 
                      d="M21 11.5V11.51M3 11.5H9.5L12.5 8.5L14.5 10.5L18 7M3 17.5H12M3 5.5H6M21 17.5V17.51M21 5.5V5.51" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">Nenhuma atualização disponível para este projeto.</p>
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
            <div className="max-w-4xl max-h-full animate-eco-grow">
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Imagem ampliada" 
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  onError={(e) => {
                    console.error(`Erro ao carregar imagem ampliada: ${selectedImage}`);
                    // Tentar corrigir a URL se necessário
                    if (!selectedImage.startsWith('/uploads/')) {
                      const fixedUrl = `/uploads${selectedImage}`;
                      console.log(`Tentando URL alternativa: ${fixedUrl}`);
                      e.currentTarget.src = fixedUrl;
                    }
                  }}
                />
                <button 
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de edição de atualização */}
      <Dialog open={isEditUpdateOpen} onOpenChange={setIsEditUpdateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-600" />
              Editar Atualização
            </DialogTitle>
            {updateToEdit && (
              <DialogDescription>
                Atualização do projeto <span className="font-medium">{project.name}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateEditSubmit)} className="space-y-6">
              <FormField
                control={updateForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Atualização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Progresso do Reflorestamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os avanços e novidades do projeto..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Imagens atuais</FormLabel>
                {existingMediaUrls.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2 mb-4">
                    {existingMediaUrls.map((url, index) => {
                      console.log(`Exibindo imagem existente ${index}:`, url);
                      // Garantir que a URL esteja no formato correto
                      const displayUrl = url.startsWith('/') ? url : `/${url}`;
                      return (
                        <div key={`existing-${index}`} className="relative group">
                          <img 
                            src={displayUrl} 
                            alt={`Imagem existente ${index + 1}`} 
                            className="h-20 w-20 object-cover rounded-md"
                            onError={(e) => {
                              console.error(`Erro ao carregar imagem existente: ${displayUrl}`);
                              e.currentTarget.src = '/placeholder-image.png';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2 mb-4">Nenhuma imagem existente</p>
                )}
                
                <FormLabel>Adicionar novas imagens (opcional)</FormLabel>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {updateMediaFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Prévia ${index + 1}`} 
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeMediaFile(index)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="update-media-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600"
                        >
                          <span>Carregar imagens</span>
                          <input
                            id="update-media-upload"
                            name="update-media-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleUpdateMediaChange}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG até 5MB cada
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditUpdateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={editUpdateMutation.isPending}
                >
                  {editUpdateMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
