import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Leaf, Upload, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Deve fornecer um email válido"),
  password: z.string().min(1, "A senha é obrigatória"),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Deve fornecer um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  sector: z.string().min(1, "Selecione um setor"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de serviço",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/empresa/dashboard");
      }
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      sector: "",
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    let logoUrl;

    // If a logo was uploaded, we could handle it here
    // For now we leave it empty and let the backend handle it
    
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      sector: data.sector,
      logoUrl: logoUrl,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Formulário de Login - Coluna da Esquerda */}
          <div className="w-full space-y-8 relative">
            <div className="wave"></div>

            <div className="bg-white p-8 rounded-lg shadow-lg relative z-10">
              <div className="text-center">
                <Leaf className="h-12 w-12 text-primary mx-auto" />
                <Tabs
                  defaultValue="login"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-6"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="register">Registrar</TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login" className="mt-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Entrar na conta
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Acesse para gerenciar sua pegada de carbono
                    </p>

                    <Form {...loginForm}>
                      <form
                        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="seu@email.com"
                                  type="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="********"
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center justify-between">
                          <FormField
                            control={loginForm.control}
                            name="remember"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  Lembrar de mim
                                </FormLabel>
                              </FormItem>
                            )}
                          />

                          <div className="text-sm">
                            <a
                              href="#"
                              className="font-medium text-primary hover:text-primary-600"
                            >
                              Esqueceu a senha?
                            </a>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Entrando..." : "Entrar"}
                        </Button>
                      </form>
                    </Form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        Não tem uma conta?{" "}
                        <button
                          onClick={() => setActiveTab("register")}
                          className="font-medium text-primary hover:text-primary-600"
                        >
                          Registre sua empresa
                        </button>
                      </p>
                    </div>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register" className="mt-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Registrar Empresa
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Crie uma conta para calcular e compensar sua pegada de
                      carbono
                    </p>

                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nome da sua empresa"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="seu@email.com"
                                  type="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="********"
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
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
                                  <SelectItem value="agricultura">
                                    Agricultura
                                  </SelectItem>
                                  <SelectItem value="transporte">
                                    Transporte
                                  </SelectItem>
                                  <SelectItem value="industria">
                                    Indústria
                                  </SelectItem>
                                  <SelectItem value="comercio">
                                    Comércio
                                  </SelectItem>
                                  <SelectItem value="servicos">
                                    Serviços
                                  </SelectItem>
                                  <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo da Empresa (opcional)
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600"
                                >
                                  <span>Carregar um arquivo</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleLogoChange}
                                    accept="image/*"
                                  />
                                </label>
                                <p className="pl-1">ou arraste e solte</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG até 2MB
                              </p>
                              {logoFile && (
                                <p className="text-xs text-green-500 font-medium">
                                  {logoFile.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="terms"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  Concordo com os{" "}
                                  <a
                                    href="#"
                                    className="text-primary hover:text-primary-600"
                                  >
                                    Termos de Serviço
                                  </a>{" "}
                                  e{" "}
                                  <a
                                    href="#"
                                    className="text-primary hover:text-primary-600"
                                  >
                                    Política de Privacidade
                                  </a>
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending
                            ? "Registrando..."
                            : "Criar Conta"}
                        </Button>
                      </form>
                    </Form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        Já tem uma conta?{" "}
                        <button
                          onClick={() => setActiveTab("login")}
                          className="font-medium text-primary hover:text-primary-600"
                        >
                          Entrar
                        </button>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* Imagem e informações - Coluna da Direita */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div 
                className="w-full max-w-md h-80 rounded-lg bg-green-100 flex flex-col items-center justify-center"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #e6f7ee, #c8e6d2)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}
              >
                <svg className="w-40 h-40 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 21V19H2V17C2 15.6739 2.52678 14.4021 3.46447 13.4645C4.40215 12.5268 5.67392 12 7 12C8.32608 12 9.59785 12.5268 10.5355 13.4645C11.4732 14.4021 12 15.6739 12 17V19H16V21H6Z" fill="currentColor" />
                  <path d="M18 21V19H22V17C22 15.6739 21.4732 14.4021 20.5355 13.4645C19.5979 12.5268 18.3261 12 17 12C15.6739 12 14.4021 12.5268 13.4645 13.4645C12.5268 14.4021 12 15.6739 12 17V19H8V21H18Z" fill="currentColor" />
                  <path d="M7 10C6.20435 10 5.44129 9.68393 4.87868 9.12132C4.31607 8.55871 4 7.79565 4 7C4 6.20435 4.31607 5.44129 4.87868 4.87868C5.44129 4.31607 6.20435 4 7 4C7.79565 4 8.55871 4.31607 9.12132 4.87868C9.68393 5.44129 10 6.20435 10 7C10 7.79565 9.68393 8.55871 9.12132 9.12132C8.55871 9.68393 7.79565 10 7 10Z" fill="currentColor" />
                  <path d="M17 10C16.2044 10 15.4413 9.68393 14.8787 9.12132C14.3161 8.55871 14 7.79565 14 7C14 6.20435 14.3161 5.44129 14.8787 4.87868C15.4413 4.31607 16.2044 4 17 4C17.7956 4 18.5587 4.31607 19.1213 4.87868C19.6839 5.44129 20 6.20435 20 7C20 7.79565 19.6839 8.55871 19.1213 9.12132C18.5587 9.68393 17.7956 10 17 10Z" fill="currentColor" />
                </svg>
                <div className="text-green-700 text-center mt-4 font-semibold text-lg">Crescimento Sustentável</div>
              </div>
              <div className="mt-6 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
                  Fundo Verde
                </h2>
                <p className="mt-4 text-gray-600">
                  Calculamos sua pegada de carbono e investimos em projetos de sustentabilidade que
                  apoiam os Objetivos de Desenvolvimento Sustentável da ONU.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
                    <div className="text-blue-600 font-bold">Medição</div>
                    <div className="text-xs text-gray-600">Consumo de energia e água</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg shadow-sm">
                    <div className="text-green-600 font-bold">Compensação</div>
                    <div className="text-xs text-gray-600">Investimento em projetos sustentáveis</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg shadow-sm">
                    <div className="text-purple-600 font-bold">Certificação</div>
                    <div className="text-xs text-gray-600">Reconhecimento e transparência</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-4 text-center">
        <Button
          variant="ghost"
          className="text-gray-600"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a página inicial
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;