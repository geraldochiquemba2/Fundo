import { db } from "@db";
import { consumptionRecords, companies } from "@shared/schema";

async function addConsumptionData() {
  console.log("Adding consumption data...");
  
  // Get all companies
  const allCompanies = await db.query.companies.findMany();
  
  if (allCompanies.length === 0) {
    console.log("No companies found");
    return;
  }

  // Sample consumption data for different sectors
  const consumptionData = [
    // Banking sector - Banco de Fomento Angola
    {
      companyId: allCompanies[0]?.id || 1,
      energyKwh: "15000",
      fuelLiters: "2500", 
      fuelType: "diesel",
      transportKm: "8000",
      transportType: "carro_diesel",
      waterM3: "500",
      wasteKg: "1200",
      emissionKgCo2: "8740.50", // Calculated based on factors
      compensationValueKz: "87405.00", // 10 Kz per kg CO2
      period: "monthly",
      month: "novembro",
      year: 2024
    },
    // Insurance sector - Empresa Nacional de Seguros
    {
      companyId: allCompanies[1]?.id || 2,
      energyKwh: "12000",
      fuelLiters: "1800",
      fuelType: "gasolina", 
      transportKm: "6500",
      transportType: "carro_gasolina",
      waterM3: "380",
      wasteKg: "950",
      emissionKgCo2: "6890.25",
      compensationValueKz: "68902.50",
      period: "monthly", 
      month: "novembro",
      year: 2024
    },
    // Telecommunications - Unitel
    {
      companyId: allCompanies[2]?.id || 3,
      energyKwh: "25000",
      fuelLiters: "4000",
      fuelType: "diesel",
      transportKm: "12000", 
      transportType: "transporte_publico",
      waterM3: "800",
      wasteKg: "2100",
      emissionKgCo2: "14250.75",
      compensationValueKz: "142507.50",
      period: "monthly",
      month: "novembro", 
      year: 2024
    },
    // Oil & Gas sector - Sonangol
    {
      companyId: allCompanies[3]?.id || 4,
      energyKwh: "50000",
      fuelLiters: "8500",
      fuelType: "diesel",
      transportKm: "20000",
      transportType: "transporte_pesado",
      waterM3: "1500",
      wasteKg: "4200",
      emissionKgCo2: "28650.80",
      compensationValueKz: "286508.00",
      period: "monthly",
      month: "novembro",
      year: 2024
    },
    // Aviation sector - TAAG
    {
      companyId: allCompanies[4]?.id || 5,
      energyKwh: "18000",
      fuelLiters: "15000", // High fuel consumption for aviation
      fuelType: "querosene",
      transportKm: "45000", // Long distance flights
      transportType: "aviao",
      waterM3: "600",
      wasteKg: "1800",
      emissionKgCo2: "35420.90",
      compensationValueKz: "354209.00",
      period: "monthly",
      month: "novembro",
      year: 2024
    }
  ];

  try {
    for (const record of consumptionData) {
      if (record.companyId) {
        await db.insert(consumptionRecords).values(record);
        console.log(`Added consumption record for company ${record.companyId}`);
      }
    }
    
    console.log("Consumption data added successfully!");
  } catch (error) {
    console.error("Error adding consumption data:", error);
  }
}

addConsumptionData().catch(console.error);