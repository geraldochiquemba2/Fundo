import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Leaf, LogIn } from "lucide-react";

const AuthPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

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
                
                <div className="mt-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Entrar na conta
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Acesse para gerenciar sua pegada de carbono
                  </p>

                  <p className="text-center text-gray-600 mb-6">
                    Utilize sua conta Replit para acessar a plataforma.
                  </p>

                  <Button 
                    onClick={login}
                    className="w-full"
                    size="lg"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Entrar com Replit
                  </Button>
                </div>
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