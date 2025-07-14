import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

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
  const { user, login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  const { toast } = useToast();

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

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
    }
  };

  

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        sector: data.sector,
      };

      await register(registerData);
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo ao Fundo Verde!",
      });
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: "Não foi possível criar a conta",
        variant: "destructive",
      });
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
                        className="space-y-4"
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
                              <FormLabel>Setor</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o setor da empresa" />
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

                        

                        <FormField
                          control={registerForm.control}
                          name="terms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Aceito os{" "}
                                  <a
                                    href="#"
                                    className="text-primary hover:text-primary-600"
                                  >
                                    termos de serviço
                                  </a>{" "}
                                  e{" "}
                                  <a
                                    href="#"
                                    className="text-primary hover:text-primary-600"
                                  >
                                    política de privacidade
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

          {/* Informações - Coluna da Direita */}
          <div className="hidden md:block">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Pegada de Carbono
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Meça, reduza e compense a pegada de carbono da sua empresa
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80"
                alt="Sustentabilidade"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Contribua para um futuro sustentável
                </h3>
                <p className="text-gray-600">
                  Nossa plataforma permite que sua empresa calcule sua emissão de
                  carbono e invista em projetos sustentáveis alinhados aos
                  Objetivos de Desenvolvimento Sustentável da ONU.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Cálculo preciso da pegada de carbono da sua empresa
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Investimento em projetos verificados com impacto real
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Relatórios detalhados para demonstrar seu compromisso
                      ambiental
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;