import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Calculator,
  Car,
  Zap,
  Droplets,
  Plane,
  Home,
  ArrowRight,
  Leaf
} from "lucide-react";

const IndividualCalculator = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Energia doméstica (kWh/mês)
    electricity: "",
    gas: "",
    // Transporte (km/mês)
    carKm: "",
    publicTransport: "",
    // Viagens aéreas (voos/ano)
    domesticFlights: "",
    internationalFlights: "",
    // Consumo doméstico
    waterUsage: "",
    wasteGeneration: "",
  });

  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCarbonFootprint = () => {
    setIsCalculating(true);
    
    // Fatores de emissão para Angola (aproximados)
    const emissionFactors = {
      electricity: 0.4, // kg CO2/kWh
      gas: 2.3, // kg CO2/m³
      carKm: 0.12, // kg CO2/km
      publicTransport: 0.05, // kg CO2/km
      domesticFlight: 90, // kg CO2/voo
      internationalFlight: 500, // kg CO2/voo
      water: 0.35, // kg CO2/m³
      waste: 0.5, // kg CO2/kg
    };

    setTimeout(() => {
      const electricity = (parseFloat(formData.electricity) || 0) * 12 * emissionFactors.electricity / 1000;
      const gas = (parseFloat(formData.gas) || 0) * 12 * emissionFactors.gas / 1000;
      const transport = (parseFloat(formData.carKm) || 0) * 12 * emissionFactors.carKm / 1000;
      const publicTrans = (parseFloat(formData.publicTransport) || 0) * 12 * emissionFactors.publicTransport / 1000;
      const flights = (parseFloat(formData.domesticFlights) || 0) * emissionFactors.domesticFlight / 1000 + 
                     (parseFloat(formData.internationalFlights) || 0) * emissionFactors.internationalFlight / 1000;
      const water = (parseFloat(formData.waterUsage) || 0) * 12 * emissionFactors.water / 1000;
      const waste = (parseFloat(formData.wasteGeneration) || 0) * 12 * emissionFactors.waste / 1000;

      const totalEmissions = electricity + gas + transport + publicTrans + flights + water + waste;
      
      // Valor de compensação estimado (USD por tonelada CO2)
      const compensationValue = totalEmissions * 25; // $25 per ton

      setResults({
        breakdown: {
          electricity: electricity.toFixed(2),
          gas: gas.toFixed(2),
          transport: transport.toFixed(2),
          publicTransport: publicTrans.toFixed(2),
          flights: flights.toFixed(2),
          water: water.toFixed(2),
          waste: waste.toFixed(2),
        },
        total: totalEmissions.toFixed(2),
        compensationValue: compensationValue.toFixed(2),
        category: totalEmissions < 2 ? "Baixa" : totalEmissions < 4 ? "Média" : "Alta"
      });
      setIsCalculating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              Calculadora de Pegada de Carbono Pessoal
            </h1>
            <p className="text-gray-600 mt-2">
              Calcule suas emissões anuais de CO₂ e descubra como compensá-las
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dados de Consumo</CardTitle>
                  <CardDescription>
                    Preencha suas informações de consumo mensal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Energia Doméstica */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Energia Doméstica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="electricity">Eletricidade (kWh/mês)</Label>
                        <Input
                          id="electricity"
                          type="number"
                          placeholder="300"
                          value={formData.electricity}
                          onChange={(e) => handleInputChange("electricity", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gas">Gás (m³/mês)</Label>
                        <Input
                          id="gas"
                          type="number"
                          placeholder="20"
                          value={formData.gas}
                          onChange={(e) => handleInputChange("gas", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transporte */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Car className="h-5 w-5 text-blue-500" />
                      Transporte
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="carKm">Carro Próprio (km/mês)</Label>
                        <Input
                          id="carKm"
                          type="number"
                          placeholder="1000"
                          value={formData.carKm}
                          onChange={(e) => handleInputChange("carKm", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publicTransport">Transporte Público (km/mês)</Label>
                        <Input
                          id="publicTransport"
                          type="number"
                          placeholder="200"
                          value={formData.publicTransport}
                          onChange={(e) => handleInputChange("publicTransport", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Viagens Aéreas */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Plane className="h-5 w-5 text-purple-500" />
                      Viagens Aéreas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="domesticFlights">Voos Domésticos (por ano)</Label>
                        <Input
                          id="domesticFlights"
                          type="number"
                          placeholder="2"
                          value={formData.domesticFlights}
                          onChange={(e) => handleInputChange("domesticFlights", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="internationalFlights">Voos Internacionais (por ano)</Label>
                        <Input
                          id="internationalFlights"
                          type="number"
                          placeholder="1"
                          value={formData.internationalFlights}
                          onChange={(e) => handleInputChange("internationalFlights", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consumo Doméstico */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Home className="h-5 w-5 text-green-500" />
                      Consumo Doméstico
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="waterUsage">Água (m³/mês)</Label>
                        <Input
                          id="waterUsage"
                          type="number"
                          placeholder="15"
                          value={formData.waterUsage}
                          onChange={(e) => handleInputChange("waterUsage", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="wasteGeneration">Resíduos (kg/mês)</Label>
                        <Input
                          id="wasteGeneration"
                          type="number"
                          placeholder="50"
                          value={formData.wasteGeneration}
                          onChange={(e) => handleInputChange("wasteGeneration", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={calculateCarbonFootprint}
                    disabled={isCalculating}
                    className="w-full"
                    size="lg"
                  >
                    {isCalculating ? "Calculando..." : "Calcular Pegada de Carbono"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Sidebar */}
            <div>
              {results ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      Resultados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{results.total}</div>
                      <div className="text-sm text-muted-foreground">toneladas CO₂/ano</div>
                      <div className="text-xs mt-1 px-2 py-1 bg-white rounded-full inline-block">
                        Pegada {results.category}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Breakdown por Categoria:</h4>
                      {Object.entries(results.breakdown).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span>{value} t</span>
                          </div>
                        )
                      ))}
                    </div>

                    <Alert>
                      <AlertDescription>
                        Para compensar suas emissões, você precisaria investir aproximadamente
                        <strong> ${results.compensationValue}</strong> em projetos sustentáveis.
                      </AlertDescription>
                    </Alert>

                    <Button className="w-full" asChild>
                      <a href="/individual/investments">
                        Compensar Emissões
                        <Leaf className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">💡 Dica</p>
                      <p className="text-xs text-blue-700">
                        Você pode encontrar seu consumo de eletricidade na sua conta mensal de energia
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">🌱 Meta Global</p>
                      <p className="text-xs text-green-700">
                        O ideal é manter abaixo de 2 toneladas CO₂ por pessoa/ano
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">📊 Média Angola</p>
                      <p className="text-xs text-yellow-700">
                        A pegada média em Angola é de 0.8 toneladas CO₂/pessoa/ano
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndividualCalculator;