import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Building2, Upload } from "lucide-react";
import { Link } from "wouter";

const addCompanySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Deve fornecer um email válido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  sector: z.string().min(1, "Selecione um setor"),
  phone: z.string().optional(),
  location: z.string().optional(),
  employeeCount: z.coerce.number().positive().optional(),
  description: z.string().optional(),
});

type AddCompanyFormValues = z.infer<typeof addCompanySchema>;

export default function AddCompany() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<AddCompanyFormValues>({
    resolver: zodResolver(addCompanySchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      sector: "",
      phone: "",
      location: "",
      employeeCount: undefined,
      description: "",
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: AddCompanyFormValues) => {
      const res = await apiRequest("POST", "/api/admin/companies", data);
      return await res.json();
    },
    onSuccess: async (newCompany) => {
      // Upload logo if provided
      if (logoFile) {
        try {
          const formData = new FormData();
          formData.append("logo", logoFile);
          
          await fetch(`/api/admin/companies/${newCompany.id}/logo`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });
        } catch (error) {
          console.error("Erro ao fazer upload do logo:", error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      toast({
        title: "Empresa criada",
        description: "A nova empresa foi criada com sucesso.",
      });
      setLocation("/admin/empresas");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar empresa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddCompanyFormValues) => {
    createCompanyMutation.mutate(data);
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

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Adicionar Nova Empresa</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie uma nova empresa no sistema
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/empresas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às Empresas
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-6">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Preview do logo" 
                  className="h-32 w-32 object-contain border rounded-lg"
                />
              ) : (
                <div className="h-32 w-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <label 
                  htmlFor="logo-upload" 
                  className="cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600 flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Carregar logo</span>
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
                <div className="text-center">
                  <p className="text-xs text-green-500">{logoFile.name}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 text-center">
                Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Informações da Empresa</CardTitle>
            <CardDescription>
              Preencha os dados da nova empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Petro Angola" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contato@empresa.ao" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Inicial</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Senha temporária" />
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
                            <SelectItem value="agricultura">Agricultura</SelectItem>
                            <SelectItem value="alimenticio">Alimentício</SelectItem>
                            <SelectItem value="automotivo">Automotivo</SelectItem>
                            <SelectItem value="construcao">Construção</SelectItem>
                            <SelectItem value="consultoria">Consultoria</SelectItem>
                            <SelectItem value="educacao">Educação</SelectItem>
                            <SelectItem value="energia">Energia</SelectItem>
                            <SelectItem value="farmaceutico">Farmacêutico</SelectItem>
                            <SelectItem value="financas">Finanças</SelectItem>
                            <SelectItem value="imobiliario">Imobiliário</SelectItem>
                            <SelectItem value="industria">Indústria</SelectItem>
                            <SelectItem value="logistica">Logística</SelectItem>
                            <SelectItem value="mineracao">Mineração</SelectItem>
                            <SelectItem value="papel_celulose">Papel e Celulose</SelectItem>
                            <SelectItem value="petroleo_gas">Petróleo e Gás</SelectItem>
                            <SelectItem value="quimico">Químico</SelectItem>
                            <SelectItem value="saude">Saúde</SelectItem>
                            <SelectItem value="seguros">Seguros</SelectItem>
                            <SelectItem value="servicos_publicos">Serviços Públicos</SelectItem>
                            <SelectItem value="siderurgia">Siderurgia</SelectItem>
                            <SelectItem value="tecnologia">Tecnologia</SelectItem>
                            <SelectItem value="telecomunicacoes">Telecomunicações</SelectItem>
                            <SelectItem value="textil">Têxtil</SelectItem>
                            <SelectItem value="transporte">Transporte</SelectItem>
                            <SelectItem value="turismo">Turismo e Hospitalidade</SelectItem>
                            <SelectItem value="varejo">Varejo</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (opcional)</FormLabel>
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
                        <FormLabel>Localização (opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Luanda, Angola" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Funcionários (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                            field.onChange(value);
                          }}
                          placeholder="Ex: 500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Breve descrição da empresa e suas atividades..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createCompanyMutation.isPending}
                >
                  {createCompanyMutation.isPending ? "Criando..." : "Criar Empresa"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}