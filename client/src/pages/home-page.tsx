import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProjectCard from "@/components/project-card";
import OdsIcon from "@/components/ui/ods-icon";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  ArrowRight, 
  TrendingUp, 
  LineChart 
} from "lucide-react";

const HomePage = () => {
  // Fetch projects for the home page
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch SDGs for the home page
  const { data: sdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="font-bold text-4xl md:text-5xl text-gray-800 leading-tight mb-6">
                <span className="text-primary">Fundo Verde:</span> Reduza sua pegada de carbono e invista em ODS
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Calcule suas emissões de CO₂, compense-as através de fundos verdes e acompanhe o impacto do seu investimento nos Objetivos de Desenvolvimento Sustentável.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild size="lg" className="px-6">
                  <Link href="/auth">
                    Registrar Empresa
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-6 border-primary text-primary hover:bg-primary/10">
                  <Link href="#projects">
                    Ver Projetos
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-lg shadow-xl w-full h-auto overflow-hidden bg-white">
                {/* Usando a imagem fornecida */}
                <img 
                  src="data:image/png;base64,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"
                  alt="Fundo Verde - Sustentabilidade"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-3xl text-center text-gray-800 mb-12">Como Funciona</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-primary hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-center mb-3">1. Calcule suas Emissões</h3>
              <p className="text-gray-600 text-center">
                Insira dados sobre o consumo de energia, combustíveis e transporte da sua empresa para calcular sua pegada de carbono.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-secondary hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl text-center mb-3">2. Invista em ODS</h3>
              <p className="text-gray-600 text-center">
                Compense suas emissões investindo em projetos alinhados aos Objetivos de Desenvolvimento Sustentável da ONU.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-accent hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <LineChart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-xl text-center mb-3">3. Acompanhe o Impacto</h3>
              <p className="text-gray-600 text-center">
                Visualize o progresso dos projetos apoiados e o impacto positivo gerado pelo seu investimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-3xl text-center text-gray-800 mb-4">Projetos Ativos</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Conheça os projetos sustentáveis que estão recebendo investimentos através da nossa plataforma.
          </p>
          
          {/* Project Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects && projects.length > 0 ? (
              projects.slice(0, 3).map((project: any) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  imageUrl={project.imageUrl}
                  totalInvested={project.totalInvested}
                  sdg={project.sdg}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">Carregando projetos...</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild className="px-6 py-3 bg-secondary hover:bg-secondary/90">
              <Link href="/projetos" className="inline-flex items-center">
                Ver Todos os Projetos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SDGs Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-3xl text-center text-gray-800 mb-4">Objetivos de Desenvolvimento Sustentável</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Escolha entre os 17 ODS da ONU para direcionar seu investimento e impacto positivo.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {sdgs && sdgs.length > 0 ? (
              sdgs.slice(0, 6).map((sdg: any) => (
                <Link key={sdg.id} href={`/ods/${sdg.id}`}>
                  <OdsIcon 
                    number={sdg.number} 
                    name={sdg.name} 
                    color={sdg.color}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-6 text-center py-12">
                <p className="text-gray-500">Carregando ODS...</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="px-6 py-3 border-secondary text-secondary hover:bg-secondary/10">
              <Link href="/ods" className="inline-flex items-center">
                Ver Todos os ODS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;
