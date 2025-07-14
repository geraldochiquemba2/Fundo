import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Calculator, 
  Leaf, 
  TrendingUp, 
  Award,
  MapPin,
  Briefcase,
  Phone,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

const IndividualDashboard = () => {
  const { user } = useAuth();

  // Mock data for individual carbon footprint
  const carbonStats = {
    totalEmissions: 4.2, // tons CO2/year
    target: 2.0, // target reduction
    reduction: 15, // percentage
    status: "Em progresso"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {user?.individual?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie sua pegada de carbono pessoal e contribua para um futuro sustentável
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Emissões Totais
                </CardTitle>
                <Leaf className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{carbonStats.totalEmissions} t</div>
                <p className="text-xs text-muted-foreground">
                  CO₂ por ano
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meta de Redução
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{carbonStats.target} t</div>
                <p className="text-xs text-muted-foreground">
                  Objetivo 2025
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Redução Atual
                </CardTitle>
                <Award className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{carbonStats.reduction}%</div>
                <p className="text-xs text-muted-foreground">
                  vs. ano anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status
                </CardTitle>
                <Calculator className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {carbonStats.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Continue assim!
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progresso da Pegada de Carbono
                  </CardTitle>
                  <CardDescription>
                    Sua jornada para um estilo de vida mais sustentável
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Meta de Redução</span>
                        <span>{carbonStats.reduction}% de {(carbonStats.totalEmissions - carbonStats.target).toFixed(1)}t</span>
                      </div>
                      <Progress value={carbonStats.reduction} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">2.1t</div>
                        <div className="text-sm text-green-700">CO₂ Evitado</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-blue-700">Ações Eco</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Ferramentas para gerenciar sua pegada de carbono
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/individual/calculator">
                      <Button className="w-full h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                        <Calculator className="h-6 w-6" />
                        <div>
                          <div className="font-medium">Calculadora</div>
                          <div className="text-xs text-muted-foreground">Calcule suas emissões</div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/individual/investments">
                      <Button className="w-full h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                        <Leaf className="h-6 w-6" />
                        <div>
                          <div className="font-medium">Compensar</div>
                          <div className="text-xs text-muted-foreground">Invista em projetos</div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Meu Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">
                      {user?.individual?.firstName} {user?.individual?.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  
                  {user?.individual?.occupation && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span>{user.individual.occupation}</span>
                    </div>
                  )}
                  
                  {user?.individual?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{user.individual.location}</span>
                    </div>
                  )}
                  
                  {user?.individual?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{user.individual.phone}</span>
                    </div>
                  )}
                  
                  <Link href="/individual/profile">
                    <Button variant="outline" className="w-full">
                      Editar Perfil
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Dicas Sustentáveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Use transporte público</p>
                      <p className="text-xs text-green-700">Pode reduzir até 2.3t CO₂/ano</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Energia renovável</p>
                      <p className="text-xs text-blue-700">Considere painéis solares</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">Consumo consciente</p>
                      <p className="text-xs text-purple-700">Prefira produtos locais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndividualDashboard;