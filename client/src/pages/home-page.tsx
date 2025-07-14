import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProjectCard from "@/components/project-card";
import OdsIcon from "@/components/ui/ods-icon";
import SDGCarousel from "@/components/sdg-carousel";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  ArrowRight, 
  TrendingUp, 
  LineChart 
} from "lucide-react";

const HomePage = () => {
  const queryClient = useQueryClient();

  // Fetch projects for the home page with real-time optimized caching
  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 0, // Always consider data stale for immediate updates
    refetchOnWindowFocus: true, 
    refetchOnMount: true, 
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
  });

  // Force cache invalidation and refetch on component mount and when data changes
  useEffect(() => {
    const invalidateAndRefresh = () => {
      console.log('🔄 HomePage: Invalidating project cache...');
      // Clear all project-related caches
      queryClient.removeQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      // Force immediate refetch
      refetchProjects();
    };

    // Invalidate immediately on mount
    invalidateAndRefresh();

    // Listen for storage events (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'project-updated' || e.key === 'project-cache-clear') {
        console.log('📢 HomePage: Detected project update via localStorage');
        invalidateAndRefresh();
      }
    };

    // Listen for focus events to refresh when user returns to tab
    const handleFocus = () => {
      console.log('👁️ HomePage: Window focused, refreshing projects...');
      invalidateAndRefresh();
    };

    // Listen for visibility change to refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔍 HomePage: Tab became visible, refreshing projects...');
        invalidateAndRefresh();
      }
    };

    // Create a more aggressive image cache-busting mechanism
    const forceImageRefresh = () => {
      // Add timestamp to force image reload
      const imageElements = document.querySelectorAll('img[src*="/uploads/projects/"]');
      imageElements.forEach((element) => {
        const img = element as HTMLImageElement;
        const originalSrc = img.src.split('?')[0]; // Remove existing cache busters
        img.src = `${originalSrc}?t=${Date.now()}`;
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up multiple refresh intervals
    const shortInterval = setInterval(invalidateAndRefresh, 1000 * 30); // Every 30 seconds
    const imageInterval = setInterval(forceImageRefresh, 1000 * 45); // Every 45 seconds for images

    return () => {
      clearInterval(shortInterval);
      clearInterval(imageInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient, refetchProjects]);
  
  // Fetch SDGs for the home page
  const { data: sdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0 w-full h-full">
          <SDGCarousel autoplay={true} interval={4000} />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-bold text-4xl md:text-6xl text-white leading-tight mb-6">
              Calculadora de Carbono & <span className="text-primary">ODS</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Calcule sua pegada de carbono, invista em projetos sustentáveis e contribua para os
              Objetivos de Desenvolvimento Sustentável das Nações Unidas.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Button asChild size="lg" className="px-8 py-3 bg-primary hover:bg-primary/90 text-white">
                <Link href="/auth">
                  Cadastrar Empresa
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-3 border-white text-white hover:bg-white/10">
                <Link href="/ods">
                  Explorar ODS
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl text-gray-800 mb-4">Conheça o Fundo Verde</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Assista ao vídeo e descubra como nossa plataforma está transformando o investimento sustentável em Angola.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl"
                src="https://www.youtube.com/embed/VU7OZApVkDY"
                title="Fundo Verde - Investimento Sustentável"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
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
                  displayInvestment={project.displayInvestment}
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
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {sdgs && sdgs.length > 0 ? (
              sdgs
                .filter((sdg: any) => sdg.number >= 1 && sdg.number <= 10)
                .map((sdg: any) => (
                  <Link key={sdg.id} href={`/ods/${sdg.id}`}>
                    <OdsIcon 
                      number={sdg.number} 
                      name={sdg.name} 
                      color={sdg.color}
                    />
                  </Link>
                ))
            ) : (
              <div className="col-span-5 text-center py-12">
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
