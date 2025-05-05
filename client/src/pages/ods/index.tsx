import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import OdsIcon from "@/components/ui/ods-icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "@/components/project-card";

const OdsIndex = () => {
  // Fetch all SDGs
  const { data: sdgs, isLoading: isLoadingSdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch projects to show some examples
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-bold text-4xl text-center text-gray-800 mb-4">
            Objetivos de Desenvolvimento Sustentável
          </h1>
          <p className="text-gray-600 text-center max-w-3xl mx-auto">
            Os Objetivos de Desenvolvimento Sustentável são um apelo global à ação para acabar com a pobreza, proteger o meio ambiente e o clima e garantir que as pessoas, em todos os lugares, possam desfrutar de paz e de prosperidade.
          </p>
        </div>
      </section>

      {/* SDGs Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-semibold text-2xl text-gray-800 mb-8">Todos os 17 Objetivos</h2>
          
          {isLoadingSdgs ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 17 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <Skeleton className="mt-2 w-24 h-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sdgs && sdgs.length > 0 ? (
                sdgs.map((sdg: any) => (
                  <Link key={sdg.id} href={`/ods/${sdg.id}`}>
                    <OdsIcon 
                      number={sdg.number} 
                      name={sdg.name}
                    />
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Nenhum ODS encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects by SDG */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-semibold text-2xl text-gray-800 mb-8">Projetos em Destaque por ODS</h2>
          
          {isLoadingProjects ? (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <Skeleton className="h-6 w-24 mb-4" />
                  <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {sdgs && projects && sdgs.slice(0, 3).map((sdg: any) => {
                const sdgProjects = projects.filter((p: any) => p.sdgId === sdg.id);
                
                if (sdgProjects.length === 0) return null;
                
                return (
                  <div key={sdg.id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      <Badge style={{ backgroundColor: sdg.color }} className="mr-2 text-white">
                        ODS {sdg.number}
                      </Badge>
                      <h3 className="font-semibold text-xl">{sdg.name}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sdgProjects.slice(0, 3).map((project: any) => (
                        <ProjectCard
                          key={project.id}
                          id={project.id}
                          name={project.name}
                          description={project.description}
                          imageUrl={project.imageUrl}
                          totalInvested={project.totalInvested}
                          sdg={sdg}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {(!sdgs || !projects || (sdgs.length > 0 && projects.length === 0)) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum projeto encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default OdsIndex;
