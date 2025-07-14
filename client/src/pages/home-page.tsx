import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProjectCard from "@/components/project-card";
import OdsIcon from "@/components/ui/ods-icon";

import AnimatedSection from "@/components/animated-section";
import StaggeredGrid from "@/components/staggered-grid";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  ArrowRight, 
  TrendingUp, 
  LineChart 
} from "lucide-react";

const HomePage = () => {
  const queryClient = useQueryClient();

  // Fetch projects for the home page with optimized caching
  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Avoid excessive refetching
    refetchOnMount: true,
    refetchInterval: false, // Disable auto-refetch
  });

  // Optimized cache invalidation
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'project-updated' || e.key === 'project-cache-clear') {
        console.log('📢 HomePage: Detected project update');
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      }
    };

    // Only listen for storage events for cross-tab updates
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queryClient]);
  
  // Fetch SDGs for the home page
  const { data: sdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <AnimatedSection className="w-full md:w-1/2 mb-10 md:mb-0" animation="fade-up">
              <h1 className="font-bold text-4xl md:text-5xl leading-tight mb-6">
                <span className="text-green-700 font-black">Fundo Verde</span> <span className="text-gray-800">Reduza sua pegada de carbono e invista em ODS</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Calcule suas emissões de CO₂, compense-as através de fundos verdes e acompanhe o impacto do seu investimento nos Objetivos de Desenvolvimento Sustentável.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild size="lg" className="px-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <Link href="/auth">
                    Registrar Empresa
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-6 border-primary text-primary hover:bg-primary/10 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <Link href="/projetos">
                    Ver Projetos
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
            <AnimatedSection className="w-full md:w-1/2 mt-8 md:mt-0" animation="fade-left" delay={200}>
            </AnimatedSection>
          </div>
        </div>
      </section>
      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12" animation="fade-up">
            <h2 className="font-bold text-3xl text-gray-800 mb-4">Conheça o Fundo Verde</h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Assista ao vídeo e descubra como nossa plataforma está transformando o investimento sustentável em Angola.
            </p>
          </AnimatedSection>
          
          <AnimatedSection className="max-w-4xl mx-auto" animation="scale-up" delay={200}>
            <div className="relative w-full transform hover:scale-105 transition-all duration-500" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
                src="https://www.youtube.com/embed/VU7OZApVkDY"
                title="Fundo Verde - Investimento Sustentável"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </AnimatedSection>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12" animation="fade-up">
            <h2 className="font-bold text-3xl text-gray-800 mb-4">Como Funciona</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Três passos simples para começar sua jornada sustentável
            </p>
          </AnimatedSection>
          
          <StaggeredGrid 
            className="grid md:grid-cols-3 gap-8"
            itemClassName="transform hover:scale-105 transition-all duration-300"
            delay={200}
          >
            {/* Step 1 */}
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-primary hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <Calculator className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-xl text-center mb-3">1. Calcule suas Emissões</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Insira dados sobre o consumo de energia, combustíveis e transporte da sua empresa para calcular sua pegada de carbono.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-secondary hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-secondary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-xl text-center mb-3">2. Invista em ODS</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Compense suas emissões investindo em projetos alinhados aos Objetivos de Desenvolvimento Sustentável da ONU.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-accent hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                <LineChart className="h-8 w-8 text-accent group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-xl text-center mb-3">3. Acompanhe o Impacto</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Visualize o progresso dos projetos apoiados e o impacto positivo gerado pelo seu investimento.
              </p>
            </div>
          </StaggeredGrid>
        </div>
      </section>
      {/* Projects Section */}
      <section id="projects" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12" animation="fade-up">
            <h2 className="font-bold text-3xl text-gray-800 mb-4">Projetos Ativos</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conheça os projetos sustentáveis que estão recebendo investimentos através da nossa plataforma.
            </p>
          </AnimatedSection>
          
          {/* Project Cards */}
          {projects && projects.length > 0 ? (
            <StaggeredGrid 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              itemClassName="transform hover:scale-105 transition-all duration-300"
              delay={150}
            >
              {projects.slice(0, 3).map((project: any) => (
                <div key={project.id} className="hover:shadow-xl transition-shadow duration-300">
                  <ProjectCard
                    id={project.id}
                    name={project.name}
                    description={project.description}
                    imageUrl={project.imageUrl}
                    totalInvested={project.totalInvested}
                    displayInvestment={project.displayInvestment}
                    sdg={project.sdg}
                  />
                </div>
              ))}
            </StaggeredGrid>
          ) : (
            <AnimatedSection className="text-center py-12" animation="fade-in">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando projetos...</p>
              </div>
            </AnimatedSection>
          )}
          
          <AnimatedSection className="text-center mt-10" animation="fade-up" delay={400}>
            <Button asChild className="px-6 py-3 bg-secondary hover:bg-secondary/90 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <Link href="/projetos" className="inline-flex items-center">
                Ver Todos os Projetos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
      {/* SDGs Overview Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12" animation="fade-up">
            <h2 className="font-bold text-3xl text-gray-800 mb-4">Objetivos de Desenvolvimento Sustentável</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Escolha entre os 17 ODS da ONU para direcionar seu investimento e impacto positivo.
            </p>
          </AnimatedSection>
          
          {sdgs && sdgs.length > 0 ? (
            <StaggeredGrid 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-6xl mx-auto"
              itemClassName="transform hover:scale-110 transition-all duration-300 hover:z-10"
              delay={100}
            >
              {sdgs
                .filter((sdg: any) => sdg.number >= 1 && sdg.number <= 10)
                .map((sdg: any) => (
                  <Link key={sdg.id} href={`/ods/${sdg.id}`} className="block group">
                    <div className="transform transition-all duration-300 hover:shadow-lg rounded-lg overflow-hidden">
                      <OdsIcon 
                        number={sdg.number} 
                        name={sdg.name} 
                        color={sdg.color}
                      />
                    </div>
                  </Link>
                ))
              }
            </StaggeredGrid>
          ) : (
            <AnimatedSection className="text-center py-12" animation="fade-in">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando ODS...</p>
              </div>
            </AnimatedSection>
          )}
          
          <AnimatedSection className="text-center mt-10" animation="fade-up" delay={500}>
            <Button asChild variant="outline" className="px-6 py-3 border-secondary text-secondary hover:bg-secondary/10 transform hover:scale-105 transition-all duration-300 hover:shadow-lg group">
              <Link href="/ods" className="inline-flex items-center">
                Ver Todos os ODS
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
