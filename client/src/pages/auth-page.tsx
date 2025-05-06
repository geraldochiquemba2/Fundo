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
                className="w-full max-w-md rounded-lg overflow-hidden"
              >
                <img 
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAasAAAHgCAMAAAD0FKhDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABtQTFRFMzMztNvV2fDkYnJfm8Cdcods9vz4SJFF////mKlUmgAAD0lJREFUeNrtneF24yAMhAmGNO//xHfbJDsTO05sJAFGd7vnbNO1+REIIfDn7x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+efwV/4jPv1TH78o9P3zcC+lNtZbP2A9/Gf+P7/wnqJ1lsrXrwt5sPHwQ8OA3z6Qs5XWV5aCfyLiH9SRzKt5O2+Uqw9E3WP0T71W1FwJoirgn8h5VvWV2K82/IZXc+WJKwH/kO/HjMd8+CNXGP9wxutS9FtXVVXpb2W5f1z1/JUVf5+rXDVOfJ/PG+AfXaQfrrb5cL++wsTnCf+F1w/yfbjKrPJfcZWz9gv+yLXAP87V7H78B9K34P9m/Rde3/EfvA97/CdXXDzhb/F8jf+Mq6Q68L+Nr3J/lD3+t3BQMOIfXeQf9f/g77zKQKvCf76V/8Z/cIVk7x8m/JN/b5Pn+Y+ufMW/rPyTK6/K+Ae5ipv5D8EVgT8CrfMfg6vK/Y/4LzbxH4KrqjL+Ab4e/pP/kKsq/ZMrQfwDfAX8J/8huCrwj/D1OMu/8R+SK5/xj/A1nL/8w39Irgr+Aa5+ncXfXf0HVwX/EPBf9s2/8B+CK/yj8vObswT+cVfC4D+zq4J/gK+fzlL2X/gPzhV5P8LXb6F/8h+iK0//pz5fflbgP+/CcpbxD/B13lnG/zL+g3MlzHYQ8XX2nEX8F/wH54pAH+Dr9LnKuB/wH6Qr/CPy/TOu8vmK+A/BlQC//pT4+jJn0Rb4D9EV/iPw9S1nceQspP9kVwX/AF/fDlaafOE/RFcC/wC+vvZfJP4Ud+Q+OP/xn7OvL/0X+T90VwX/BFdnzv3BfyivA/4jnP5H/9W1//BfbK78DP8hn++bj5yF8V/c9ccm1p/wH0GcJ/7n8vny0X/RPwe0K4F/dL4+OYvsH/5znKs6w7MR+MqPzrLXF/4D80/OVcE/wNf7s4zxP+A/6Ov/BFcF/+h8vTlLQ5sP/IP1//GuypxX0Pn6dyxXVdZg/AP74jn/obi6mAQ0IwkDvl7JVc7JnfAf+FnQwVWZ8R/A1ytcbTlPIP+H/znKlacPhc/XSa42nYmI//CfI12VGf8gX8dytSW/kP4L/3OYf3KQK1P/jc/XoVztuYh1F/4D5erQ9TOfr0O5WnTG//CfI1052pMFH77ew9WqNBP+B/85ylWZcUzk692T8j1ctfgP/3OQq4/6V3XGf+Dx9R6uGv4H/3OQK0cbC2C+Jv+xC9fwP/ifA/3TYfNXYL7ewtUSd+F/8D+HufLUA4H52n4WPf/4H/zPQa787PAfPN9vdR9D9oj/wf8c5soxHgjO1xZ3Q/SE/8H/HOaqzNQDEbh6LVfTgP/B/xzl6qAZEDxf1R11ZaKzOz0I/udAV0fNgPB8xV4P2Ic2lMH/Fvjnx1wdNwOS/ytwBSvz8tKuRvzPoX+c41wdNgMS8Cvr+kIPhvgfzfr/CFejY45SwC+9UVcayvIw4n8O8k8Hukpppvh3cHXCWfx55yrxP4e5OmwGpOFXUHcyrx7/c5ir1GYK+OFdFdzjf45zlR0HRb/C1blnIQY9dvTzx7l6ngEZzID0+KKrExj0JOs/R7nKjhwUgS9yn/PO4rM+P3+cq+GZARO5StX4erqz+KzL/+Q6V89mQCZyVap++hqr9Dl1yvrPga4erRsmuJoqZ/zj8e1p+uqOejhI/3WYq0czYKKIn2EvX3J7Wbkj/+dgV8lngHHNfZ0z5sLVMg31vHRLFuLhICX9h7oaE7nC47vQv9UdYUvp4X8PchXThtnj+1hzYNFVjnlLDwdJ6T/U1eMMyAvTnweueRF4wVXOWTNnx1w1x7ga0rjC4/uIy71cbTll7Uz/d5CrWAcc8fjC1QVnWQ53VWb4QriC67pzDUcXV9Oq3XU53NX6jn9ErrK+yVXKv3iuOO/Ir7gyNAhO+XQwJYcvubrqLEfHWdZBZt12zHnmyjAHXuXTMSXjn5urZMq5fOMqn6ud+VdXXA2p+UdJ+OdDV85Xn7+uq+Q4yJd05yrhC6yZi6tS7f70PVc53Xa84J+Lf5LzKvOl7CpJHOTTnVfJZoB9m6uuV3u0d+4r1/APfL5cN1fJ4qB8i6ss/MtWV20v+i+u9Pnyn17/TXcWn3Nzy8iVpX8xfMHVxbPUh7na9sXs8h0Mny+46sJZ3K2uclz6CwZB9kL/srkqee/Xl/h8vbULXuLqnrMcGmfd9Df0+XJwtX+W5yVXadc/oOcL57p1ljdX+7a5un1+HZ8vuArTnbPYe1zl9KK/4PMFVxedpfnJlaWbHvLpAFydRs+POdpHV5a5+oLPF1xdxdCDnN85V/nFf2HzBVcX0fOJ3f7oanrZxQafL7i6hInzxM9cWZqEWZ8OuIKrC+j54rLCd67GV/0LLl9w1f0s/NaV6Sl+i5yvd3T1sq/VPM/Tnty0b1xlunb0myt55cMxJM9X14HWK9HQMbPgujrrx1FsNwHlg6ttepF/weTrHV219yTJ9/PlwAUnJf7JrfJP+5v+BpMvuDrnLGPzR1fTK/0LIl/v52rq+LzrzVVef81fMPmCq1NocZZ2/uiqvMq/IPL1fq7aPl+HX1ylG/wLHl9wdQYtztLP/+rKMO3SWZ8OuOrnLC3+eFfJ0i0Mjy+4OoGen6zaP7uaXulfsPh6N1ddnwTucpXzC/2Lncf//VyNXZ+EH/VlLO2vGJj7fHV9eOj6HOjXVYp/saT/4OoExj86G6afrpKlWxgSX+/kqu8j79vYdRoM//sTCl9wdRwtzpY/u0qWdmE4fL2Rq7Hvg/BbrmJ4Uf+C8fzV29XY+UH+LVcx/otZzxdcHcbw11W+/rsr0z6W+Hy9javODxlvY9JpyJZ9LAn/g6vD2F5xtfq8GDoOzfh8vYursfvbzbqxxamLUfQvz+aqmz5H3cen7SWrrV0Ymi+48uO/u8qvbheGw1dfVyl8SrrfdbyNIXFNfj7u3LW01BtZg/x0WFylx1hm3eQqW/YD4TzBu7nK03nIetpVtvRL1PHV1ZWUz6L3fwbUapQBpn5hmHzBVW8sJ11tjn5hiHzB1TEsfzjLdMZVsvRLJf3PMS3d7DJZ3vRvY9TpaZP0ayX9D66OYfrLWdoPrpLlXyvpf3B1CNNfztJ9cpUsCUQR8n9wdQQB534fcZUs/VpXwv8c+CRs+dQNdMN8MrLlXyvnf3B1ANGVv4yfXSVLv1bK/xw538/+y7Pmg64yCUSR8X9w9TPbX1fl+tVVMvVrHeF/jplvWlP4R81Kw2dXiZRBEv4HrgLGX87Sf3eVLAlEEfA/cPUj8jWutvn7r2xJIIqA/4Grn5D28hDMJ10lSwIR/ud4V2nw3f5nPLOrbEkgwv+Q++uObP/rqtjiKlsSiOB/4OpbtFxdtee+tiWBCP4Hrr5j+p+zNFtcJVsCEf6HjKJbmA5zlU0JRPA/cPUN7bGuki2BCP4Hrr5B2g5D6I9xlY0JRNJwTXD1TRw0fhgMeYyrJPBPpP/B1X/Rtg/DII9ylawnEOn8D1z9Q3OO/8/3RSWBfyL9D66eoUcnlGPPVbaeQKTzP3D1FdO5KHvMuUqJnkAk/if+zq+nffDmGfmVfXKeQJTI/8HVZ8i1nPvYc5WyCwlE7Nv3f3AVTpw746Bhjyv6LyTwT2z+qY+rlvUbZ7F+X2RXAhH8Twf/VE/Wbcs9ruS/kOgJRKT/wdUr+NrnapLfDVHjn0j/g6u/UffH+7/HQUYnEMH/kP/3pGqLf9jjKtMTiOB/4OrPeL832h8S/0R/IAL/c4xLvfNV/+gq0xOI4H9qutJx2hcNyecqkxOI4H+qu0pxWbXvueqCqzEnEJH/g6sXx/t++P5XOYEo0wOQ9F9dXbU/jveH5KrPCUTwPxVdleW1837Ic5VzTiCi/xquyPuPHO8HnUCUEohI/4Ory+P9sOcqJ3oCEfw/rqrWF8f7YZerbE0ggv+vVv9Y7wVZ42GukjGBCP6/muuW+0Kq/3C8H6wJRNOTBCL4/1r+adFr433PVTLVk4D/r+NK7r1K+KOrZE0ggv8v5iq1O9saDnOVrQlE8P+V/FN7YG/DcY/3JYEo0xOI4P/L+CeJrbbGHa6yNYHoaQIR/H8ZV+2R8f64x1W2JhBtkZ5ABP9fxTX1JzYe7XK1JhBlS/9i+J9p/Zv4KlaZexxkTSBqSf+Dq9fmqtuP98P+AQ05gSjTE4jgf2tXx4330T+tCUQT/X/rsNTxCPwR472lf3FO2qcnEMH/dXQl9Q9jHM5NIDInELn4H1ydQOPO7WvI/mkn/X8V7tXQnzneW/oX5xAo0ROI4P8a/knUHd31p/knSwLRYxF9/R9cvcR/ScbjSHucJVkSiOD/vq7G80/B5rkJRMmeQAT/99z6KSX0P5MnEOVMTyCC/3v6J1F5ftrsqiYQJXr6H1xdFwfN58d7Y/9fav9m4f96ruTCWaZDE4jgf1Q3lPFiHGROIIL/Ef1PKuPOxvt5CURLpicQwf+Y1lU7NidPrgQiS/pP5v9n9vkn7BnQPVc5J3oCEfxfpfWTaXGQOYEI/se0rto1Dpo3HWR3AlErzvQ/uDoD9UDOxUHmBKIl0hOI4P8C608LJfMvnY+D6AlEjvQ/uDrqvB/G0zrjnMk/wf8I8qnFuDjowASiTE8ggv8R5X19uXzSOCeByJz+B1cvCrRmPd/2SZ5AlOkJRJ7+f3B1EBG7FgfZE4icpf8fXL1ixLep+Ru9OYHoSfovXF0d79et+3ZqAlGyJxDl5p/h/4LNQT1EvPm7vTmB6En6L1xdHe9bpGofG2NP4Mn2BCJvS/+Dq6vjfYd5S4L2byZzAhH83/8J0LzbeZkTiNbcn0j/g6ujxvvrbuXJnEAE//d/ApxumrJnTiCK9AQi+B9R4qB7xnt7/9+W9F+4usxWU+IgewJRTk8TiOD/zv5JxK7zn83mBCL4H9M93+6Og+wJRPT/eUdXLWEcZE8gwv/Ytvr2UOIgewIR/V/7uMrXx3tz/98W6QlE6L//dlcmDrInELn4H1ydO05SioO2JPxHziDa0n8RaLQriiuTg+wJRPA/vk2FG+2KYpZPMCcQwf/1c5Vv+b15SwIR/f8Ku1q0eIeG/a5ypicQwf/g5g8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0oT/BBgAfMFO9zPahFcAAAAASUVORK5CYII="
                  alt="Fundo Verde - Sustentabilidade"
                  className="w-full h-auto object-cover rounded-lg"
                />
                <div className="text-green-700 text-center mt-2 bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent font-semibold text-lg">Crescimento Sustentável</div>
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