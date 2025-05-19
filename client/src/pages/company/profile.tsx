import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Pencil, Save, Check } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  sector: z.string().min(1, "Selecione um setor"),
  phone: z.string().optional(),
  location: z.string().optional(),
  employeeCount: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val === '' ? undefined : parseInt(val) : val
  ).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const CompanyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.company?.name || "",
      sector: user?.company?.sector || "",
      phone: user?.company?.phone || "",
      location: user?.company?.location || "",
      employeeCount: user?.company?.employeeCount || undefined,
    },
  });
  
  // Update profile information
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", "/api/company/profile", {
        name: data.name,
        sector: data.sector,
        phone: data.phone || null,
        location: data.location || null,
        employeeCount: data.employeeCount || null
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Upload logo
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      
      const res = await fetch("/api/company/logo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erro ao fazer upload do logo");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      // Immediately update the user state with the new logo without waiting for a refetch
      if (data.user) {
        const auth = useAuth.getState();
        auth.setUser(data.user);
      }
      
      // Also invalidate the query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logo atualizado",
        description: "O logo da sua empresa foi atualizado com sucesso.",
      });
      
      // Clear the temporary file and preview
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar logo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoUpload = () => {
    if (logoFile) {
      setIsLogoUploading(true);
      uploadLogoMutation.mutate(logoFile);
      setIsLogoUploading(false);
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="company" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-2xl text-gray-800 mb-6">Perfil da Empresa</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Photo Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Logo da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-6">
                    <Avatar className="h-32 w-32">
                      <AvatarImage 
                        src={logoPreview || user?.company?.logoUrl || undefined} 
                        alt={user?.company?.name || "Empresa"} 
                      />
                      <AvatarFallback className="text-4xl bg-primary text-white">
                        {user?.company?.name ? getInitials(user.company.name) : "CO"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="space-y-4 w-full">
                    <div className="flex justify-center">
                      <label 
                        htmlFor="logo-upload" 
                        className="cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600 flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        <span>Alterar logo</span>
                        <input
                          id="logo-upload"
                          name="logo-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleLogoChange}
                          accept="image/*"
                        />
                      </label>
                    </div>
                    
                    {logoFile && (
                      <div className="mt-2 text-center">
                        <p className="text-xs text-green-500 mb-2">{logoFile.name}</p>
                        <Button
                          onClick={handleLogoUpload}
                          disabled={isLogoUploading || uploadLogoMutation.isPending}
                          className="w-full"
                        >
                          {isLogoUploading || uploadLogoMutation.isPending ? (
                            <span className="flex items-center">
                              <Skeleton className="h-4 w-4 rounded-full mr-2" />
                              Enviando...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Upload className="h-4 w-4 mr-2" />
                              Fazer upload
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 text-center mt-2">
                      Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB.
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Profile Info Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Informações da Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Empresa</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sector"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Setor de Atividade</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um setor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="energia">Energia</SelectItem>
                                <SelectItem value="agricultura">Agricultura</SelectItem>
                                <SelectItem value="transporte">Transporte</SelectItem>
                                <SelectItem value="industria">Indústria</SelectItem>
                                <SelectItem value="comercio">Comércio</SelectItem>
                                <SelectItem value="servicos">Serviços</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: +244 923 456 789" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Luanda, Angola" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="employeeCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Funcionários</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                                placeholder="Ex: 100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="w-full sm:w-auto"
                        >
                          {updateProfileMutation.isPending ? (
                            <span className="flex items-center">
                              <Skeleton className="h-4 w-4 rounded-full mr-2" />
                              Salvando...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Alterações
                            </span>
                          )}
                        </Button>
                      </div>
                      
                      {updateProfileMutation.isSuccess && (
                        <div className="flex items-center text-green-600 text-sm mt-2">
                          <Check className="h-4 w-4 mr-2" />
                          Perfil atualizado com sucesso!
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Account Info Card */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
                      <p className="text-lg font-medium">{user?.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Senha</h3>
                      <p className="text-lg font-medium">••••••••</p>
                      <Button variant="link" className="text-primary p-0 h-auto mt-1">
                        Alterar senha
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Data de Registro</h3>
                      <p className="text-lg font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Última Atualização</h3>
                      <p className="text-lg font-medium">
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompanyProfile;
