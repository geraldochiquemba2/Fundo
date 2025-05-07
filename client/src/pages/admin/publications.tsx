import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Clock,
  FileText,
  PlusCircle,
  Image,
  Calendar,
  ArrowRight,
  Goal,
  Eye,
  UploadCloud,
  FileVideo,
  X
} from "lucide-react";
import { Link } from "wouter";

// Define form schemas
const projectSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  sdgId: z.string().min(1, "Selecione um ODS"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const updateSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
});

const investmentSchema = z.object({
  totalInvested: z.string().min(1, "O valor investido é obrigatório"),
});

type UpdateFormValues = z.infer<typeof updateSchema>;
type InvestmentFormValues = z.infer<typeof investmentSchema>;

const AdminPublications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectImage, setProjectImage] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditInvestmentOpen, setIsEditInvestmentOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<any | null>(null);
  
  // Fetch all projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch all SDGs
  const { data: sdgs, isLoading: isLoadingSdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Project form
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      sdgId: "",
    },
  });
  
  // Update form
  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  
  // Investment form
  const investmentForm = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      totalInvested: "",
    },
  });
  
  // State for media files
  const [updateMediaFiles, setUpdateMediaFiles] = useState<File[]>([]);
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erro ao criar projeto");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Projeto criado",
        description: "O projeto foi criado com sucesso.",
      });
      
      // Reset form
      projectForm.reset();
      setProjectImage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erro ao excluir projeto");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Projeto excluído",
        description: "O projeto foi excluído com sucesso.",
      });
      
      // Close alert dialog
      setIsDeleteAlertOpen(false);
      setProjectToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add project update mutation
  const addUpdateMutation = useMutation({
    mutationFn: async ({ projectId, data, files }: { projectId: number, data: UpdateFormValues, files: File[] }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      
      // Add files to formData
      if (files.length > 0) {
        files.forEach((file, index) => {
          formData.append("media", file);
        });
      }
      
      const res = await fetch(`/api/admin/projects/${projectId}/updates`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erro ao adicionar atualização");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Atualização adicionada",
        description: "A atualização foi adicionada com sucesso ao projeto.",
      });
      
      // Reset form and close dialog
      updateForm.reset();
      setIsAddUpdateOpen(false);
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar atualização",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Edit investment mutation
  const editInvestmentMutation = useMutation({
    mutationFn: async ({ projectId, totalInvested }: { projectId: number, totalInvested: string }) => {
      // Cria um objeto regular para enviar apenas o valor investido
      const data = {
        totalInvested
      };
      
      // Usa a nova rota específica para atualizar apenas o valor investido
      const res = await fetch(`/api/admin/projects/${projectId}/investment`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        // Tenta obter a mensagem de erro
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Erro ao atualizar valor investido");
        } catch (e) {
          const error = await res.text();
          throw new Error(error || "Erro ao atualizar valor investido");
        }
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Valor atualizado",
        description: "O valor investido foi atualizado com sucesso.",
      });
      
      // Reset form and close dialog
      investmentForm.reset();
      setIsEditInvestmentOpen(false);
      setProjectToEdit(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar valor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit new project
  const onProjectSubmit = (data: ProjectFormValues) => {
    if (!projectImage) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, selecione uma imagem para o projeto.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("sdgId", data.sdgId);
    formData.append("image", projectImage);
    
    createProjectMutation.mutate(formData);
  };
  
  // Submit project update
  const onUpdateSubmit = (data: UpdateFormValues) => {
    if (!selectedProject) {
      toast({
        title: "Erro",
        description: "Nenhum projeto selecionado.",
        variant: "destructive",
      });
      return;
    }
    
    addUpdateMutation.mutate({ 
      projectId: selectedProject.id, 
      data,
      files: updateMediaFiles
    });
  };
  
  // Submit investment update
  const onInvestmentSubmit = (data: InvestmentFormValues) => {
    if (!projectToEdit) {
      toast({
        title: "Erro",
        description: "Nenhum projeto selecionado.",
        variant: "destructive",
      });
      return;
    }
    
    editInvestmentMutation.mutate({ 
      projectId: projectToEdit.id, 
      totalInvested: data.totalInvested
    });
  };
  
  // Handle project image change
  const handleProjectImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProjectImage(e.target.files[0]);
    }
  };
  
  // Open update dialog
  const openUpdateDialog = (project: any) => {
    setSelectedProject(project);
    setIsAddUpdateOpen(true);
    setUpdateMediaFiles([]);
    updateForm.reset({
      title: "",
      content: "",
    });
  };
  
  // Open edit investment dialog
  const openEditInvestmentDialog = (project: any) => {
    setProjectToEdit(project);
    setIsEditInvestmentOpen(true);
    investmentForm.reset({
      totalInvested: project.totalInvested ? project.totalInvested.toString() : "0",
    });
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (project: any) => {
    setProjectToDelete(project);
    setIsDeleteAlertOpen(true);
  };
  
  // Handle delete project confirmation
  const handleDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
    }
  };
  
  // Handle media files selection for project update
  const handleUpdateMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUpdateMediaFiles([...updateMediaFiles, ...filesArray]);
    }
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="admin" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Gerenciar Publicações</h1>
            
            <Tabs defaultValue="projects" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Projetos</span>
                </TabsTrigger>
                <TabsTrigger value="new-project" className="flex items-center gap-2" id="new-project-tab-trigger">
                  <Plus className="h-4 w-4" />
                  <span>Novo Projeto</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Projects List Tab */}
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Projetos Existentes
                    </CardTitle>
                    <CardDescription>
                      Gerencie os projetos existentes e adicione atualizações.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProjects ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : projects && Array.isArray(projects) && projects.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Projeto</TableHead>
                              <TableHead>ODS</TableHead>
                              <TableHead>Valor Investido</TableHead>
                              <TableHead>Atualizações</TableHead>
                              <TableHead>Empresas</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.isArray(projects) && projects.map((project: any) => (
                              <TableRow key={project.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={project.imageUrl} 
                                      alt={project.name} 
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                    <div>
                                      <p className="font-medium">{project.name}</p>
                                      <p className="text-xs text-gray-500">
                                        Criado em {formatDate(project.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {project.sdg && (
                                    <Badge
                                      style={{ backgroundColor: project.sdg.color }}
                                      className="text-white"
                                    >
                                      ODS {project.sdg.number}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
    <div className="flex items-center gap-2">
      {formatCurrency(project.totalInvested)}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 rounded-full hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          openEditInvestmentDialog(project);
        }}
      >
        <Edit className="h-3 w-3 text-gray-600" />
        <span className="sr-only">Editar valor</span>
      </Button>
    </div>
  </TableCell>
                                <TableCell>
                                  {project.updates && project.updates.length > 0 ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                      {project.updates.length} atualizações
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                      Sem atualizações
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {project.investments && project.investments.length > 0 ? (
                                    <div className="flex -space-x-2">
                                      {project.investments.slice(0, 3).map((investment: any, index: number) => (
                                        <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                          <AvatarImage src={investment.company.logoUrl} alt={investment.company.name} />
                                          <AvatarFallback className="text-xs bg-primary text-white">
                                            {investment.company.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {project.investments.length > 3 && (
                                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                                          +{project.investments.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-sm">Nenhuma</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => openUpdateDialog(project)}
                                      className="text-primary"
                                    >
                                      <PlusCircle className="h-4 w-4 mr-1" />
                                      <span>Atualizar</span>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      asChild
                                    >
                                      <Link href={`/projeto/${project.id}`} className="text-gray-600">
                                        <Eye className="h-4 w-4 mr-1" />
                                        <span>Ver</span>
                                      </Link>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => openDeleteDialog(project)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      <span>Eliminar</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-4">Nenhum projeto encontrado.</p>
                        <Button onClick={() => document.getElementById('new-project-tab-trigger')?.click()}>
                          Criar Projeto
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* New Project Tab */}
              <TabsContent value="new-project" id="new-project-tab">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Criar Novo Projeto
                    </CardTitle>
                    <CardDescription>
                      Crie um novo projeto vinculado a um Objetivo de Desenvolvimento Sustentável.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...projectForm}>
                      <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-6">
                        <FormField
                          control={projectForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Projeto</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Reflorestamento da Reserva Natural" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={projectForm.control}
                          name="sdgId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ODS Relacionado</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um ODS" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {!isLoadingSdgs && sdgs && Array.isArray(sdgs) && sdgs.map((sdg: any) => (
                                    <SelectItem 
                                      key={sdg.id} 
                                      value={sdg.id.toString()}
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={projectForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição do Projeto</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descreva o projeto detalhadamente..." 
                                  className="min-h-32"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <FormLabel>Imagem do Projeto</FormLabel>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              {projectImage ? (
                                <div className="mb-3">
                                  <img 
                                    src={URL.createObjectURL(projectImage)} 
                                    alt="Preview" 
                                    className="mx-auto h-32 w-auto rounded-md" 
                                  />
                                </div>
                              ) : (
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              )}
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="project-image-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600"
                                >
                                  <span>{projectImage ? "Alterar imagem" : "Carregar uma imagem"}</span>
                                  <input
                                    id="project-image-upload"
                                    name="project-image-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleProjectImageChange}
                                    accept="image/*"
                                  />
                                </label>
                                {!projectImage && <p className="pl-1">ou arraste e solte</p>}
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG até 5MB
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          type="submit"
                          disabled={createProjectMutation.isPending}
                          className="w-full sm:w-auto"
                        >
                          {createProjectMutation.isPending ? "Criando..." : "Criar Projeto"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Project Update Dialog */}
            <Dialog open={isAddUpdateOpen} onOpenChange={setIsAddUpdateOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    Adicionar Atualização ao Projeto
                  </DialogTitle>
                  <DialogDescription>
                    {selectedProject && (
                      <div className="flex items-center mt-1">
                        <Badge
                          style={{ backgroundColor: selectedProject.sdg?.color }}
                          className="text-white mr-2"
                        >
                          ODS {selectedProject.sdg?.number}
                        </Badge>
                        <span>{selectedProject.name}</span>
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...updateForm}>
                  <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">
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
                    
                    <div className="space-y-2">
                      <div>
                        <Label>Arquivos de Mídia (opcional)</Label>
                        <div className="mt-2">
                          <div className="flex items-center justify-center w-full">
                            <Label
                              htmlFor="media-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Clique para enviar arquivos</span> ou arraste e solte
                                </p>
                                <p className="text-xs text-gray-500">
                                  Imagens e vídeos são suportados
                                </p>
                              </div>
                              <input
                                id="media-upload"
                                type="file"
                                className="hidden"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleUpdateMediaChange}
                              />
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      {updateMediaFiles.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Arquivos selecionados ({updateMediaFiles.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {updateMediaFiles.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-gray-50">
                                  {file.type.startsWith('image/') ? (
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={file.name} 
                                      className="max-w-full max-h-full object-contain rounded-md"
                                    />
                                  ) : (
                                    <FileVideo className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const newFiles = [...updateMediaFiles];
                                    newFiles.splice(index, 1);
                                    setUpdateMediaFiles(newFiles);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <p className="text-xs text-gray-500 truncate w-16 text-center mt-1">
                                  {file.name.length > 10 ? `${file.name.substring(0, 7)}...` : file.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddUpdateOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={addUpdateMutation.isPending}
                      >
                        {addUpdateMutation.isPending ? "Adicionando..." : "Adicionar Atualização"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Help Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Sobre os Projetos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Os projetos representam iniciativas concretas para atingir os Objetivos de Desenvolvimento Sustentável. 
                    Eles são financiados com os valores pagos pelas empresas para compensação de carbono.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Atualizações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Mantenha as empresas informadas sobre o progresso dos projetos que elas financiam através de atualizações regulares.
                    Inclua fotos, vídeos e detalhes sobre os avanços e resultados alcançados.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Goal className="h-5 w-5 text-primary" />
                    Investimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Os investimentos são criados automaticamente quando um comprovativo é aprovado e um ODS é atribuído.
                    O sistema direciona os valores para os projetos relacionados ao ODS selecionado.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Delete Project Alert Dialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">
                    Eliminar Projeto
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {projectToDelete && (
                      <>
                        Tem certeza que deseja eliminar o projeto <strong>{projectToDelete.name}</strong>?
                        <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                          <p>Esta ação não pode ser desfeita. Isso irá:</p>
                          <ul className="list-disc list-inside mt-2">
                            <li>Eliminar permanentemente o projeto</li>
                            <li>Remover todas as atualizações associadas</li>
                            <li>Desassociar todos os investimentos</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteProject}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteProjectMutation.isPending ? "Eliminando..." : "Eliminar Projeto"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {/* Edit Investment Dialog */}
        <Dialog open={isEditInvestmentOpen} onOpenChange={setIsEditInvestmentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Editar Valor Investido
              </DialogTitle>
              <DialogDescription>
                {projectToEdit ? `Projeto: ${projectToEdit.name}` : 'Edite o valor total investido neste projeto.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...investmentForm}>
              <form onSubmit={investmentForm.handleSubmit(onInvestmentSubmit)} className="space-y-4">
                <FormField
                  control={investmentForm.control}
                  name="totalInvested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total Investido (Kz)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 5000000" 
                          {...field} 
                          onChange={(e) => {
                            // Remove formatação para armazenar apenas o número
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditInvestmentOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={editInvestmentMutation.isPending}
                  >
                    {editInvestmentMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPublications;
