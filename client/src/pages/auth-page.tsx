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
        <div className="max-w-md w-full space-y-8 relative">
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
