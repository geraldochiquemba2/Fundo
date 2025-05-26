import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProjectCard from "@/components/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

const ProjectsIndex = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sdgFilter, setSdgFilter] = useState<string | null>(null);
  
  // Hook para preservar posição de scroll
  useScrollRestoration("projects-page");
  
  // Fetch all projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch all SDGs for filter
  const { data: sdgs, isLoading: isLoadingSdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Filter projects based on search query and SDG filter
  const filteredProjects = projects ? 
    projects.filter((project: any) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // SDG filter
      const matchesSdg = !sdgFilter || sdgFilter === "all" || project.sdgId.toString() === sdgFilter;
      
      return matchesSearch && matchesSdg;
    }) : [];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-bold text-4xl text-center text-gray-800 mb-4">
            Projetos Sustentáveis
          </h1>
          <p className="text-gray-600 text-center max-w-3xl mx-auto">
            Conheça os projetos que estão recebendo investimentos para contribuir com os Objetivos de Desenvolvimento Sustentável.
          </p>
        </div>
      </section>
      
      {/* Filters */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar projetos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select
                value={sdgFilter || ""}
                onValueChange={(value) => setSdgFilter(value === "" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Filtrar por ODS" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os ODS</SelectItem>
                  {!isLoadingSdgs && sdgs && sdgs.map((sdg: any) => (
                    <SelectItem key={sdg.id} value={sdg.id.toString()}>
                      ODS {sdg.number}: {sdg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchQuery || sdgFilter) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Pesquisa: {searchQuery}
                  <button 
                    className="ml-1 hover:text-primary" 
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {sdgFilter && sdgs && (
                <Badge 
                  variant="outline" 
                  className="flex items-center gap-1"
                  style={{ 
                    borderColor: sdgs.find((s: any) => s.id.toString() === sdgFilter)?.color,
                    color: sdgs.find((s: any) => s.id.toString() === sdgFilter)?.color
                  }}
                >
                  ODS {sdgs.find((s: any) => s.id.toString() === sdgFilter)?.number}: 
                  {sdgs.find((s: any) => s.id.toString() === sdgFilter)?.name}
                  <button 
                    className="ml-1 hover:text-primary" 
                    onClick={() => setSdgFilter(null)}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {(searchQuery || sdgFilter) && (
                <button 
                  className="text-sm text-primary hover:underline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSdgFilter(null);
                  }}
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Projects Grid */}
      <section className="py-12 bg-gray-50 flex-grow">
        <div className="container mx-auto px-4">
          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project: any) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 mb-2">Nenhum projeto encontrado com os filtros aplicados.</p>
              <button 
                className="text-primary hover:underline" 
                onClick={() => {
                  setSearchQuery("");
                  setSdgFilter(null);
                }}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ProjectsIndex;
