import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  UserCheck, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Calendar,
  Eye
} from "lucide-react";
import { Link } from "wouter";

const AdminIndividuals = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all individuals
  const { data: individuals, isLoading } = useQuery({
    queryKey: ['/api/admin/individuals'],
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter individuals based on search term
  const filteredIndividuals = individuals?.filter((individual: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      individual.firstName?.toLowerCase().includes(searchLower) ||
      individual.lastName?.toLowerCase().includes(searchLower) ||
      individual.user?.email?.toLowerCase().includes(searchLower) ||
      individual.occupation?.toLowerCase().includes(searchLower) ||
      individual.location?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar type="admin" />
        
        <div className="flex-1 overflow-auto bg-gray-100 w-full">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                  <UserCheck className="h-8 w-8 text-primary" />
                  Pessoas Individuais
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerencie as pessoas individuais registradas na plataforma
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {filteredIndividuals.length} pessoa{filteredIndividuals.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por nome, email, ocupação ou localização..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {/* Individuals Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Pessoas Individuais</CardTitle>
                <CardDescription>
                  Todas as pessoas individuais registradas na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando pessoas...</p>
                  </div>
                ) : filteredIndividuals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pessoa</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ocupação</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Registrado em</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIndividuals.map((individual: any) => (
                          <TableRow key={individual.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage 
                                    src={individual.profilePictureUrl} 
                                    alt={`${individual.firstName} ${individual.lastName}`}
                                  />
                                  <AvatarFallback className="bg-green-500 text-white">
                                    {getInitials(individual.firstName, individual.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {individual.firstName} {individual.lastName}
                                  </p>
                                  {individual.phone && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {individual.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{individual.user?.email || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{individual.occupation || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{individual.location || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{formatDate(individual.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/admin/individuals/${individual.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {searchTerm ? 'Nenhuma pessoa encontrada' : 'Nenhuma pessoa individual registrada ainda'}
                    </p>
                    {searchTerm && (
                      <p className="text-gray-400 text-sm mt-2">
                        Tente ajustar os termos de pesquisa
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminIndividuals;