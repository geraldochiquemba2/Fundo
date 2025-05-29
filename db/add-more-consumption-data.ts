import { db } from "@db";
import { consumptionRecords, companies } from "@shared/schema";

async function addMoreConsumptionData() {
  console.log("Adding consumption data for additional companies...");
  
  // Get all companies
  const allCompanies = await db.query.companies.findMany();
  
  // Find companies that don't have consumption data yet
  const companiesWithoutData = allCompanies.slice(5); // Skip first 5 that already have data
  
  const additionalConsumptionData = [
    // Banking sector companies
    {
      companyName: "Banco BIC",
      energyKwh: "18000",
      fuelLiters: "3200",
      fuelType: "diesel",
      transportKm: "9500",
      transportType: "carro_diesel",
      waterM3: "650",
      wasteKg: "1450",
      emissionKgCo2: "10850.75",
      compensationValueKz: "108507.50"
    },
    {
      companyName: "Banco Angolano de Investimentos",
      energyKwh: "16500",
      fuelLiters: "2800",
      fuelType: "diesel",
      transportKm: "8200",
      transportType: "carro_diesel",
      waterM3: "580",
      wasteKg: "1320",
      emissionKgCo2: "9680.40",
      compensationValueKz: "96804.00"
    },
    {
      companyName: "Banco de Poupança e Crédito",
      energyKwh: "22000",
      fuelLiters: "3800",
      fuelType: "diesel",
      transportKm: "11000",
      transportType: "carro_diesel",
      waterM3: "750",
      wasteKg: "1850",
      emissionKgCo2: "13420.60",
      compensationValueKz: "134206.00"
    },
    // Telecommunications companies
    {
      companyName: "Movicel",
      energyKwh: "28000",
      fuelLiters: "4500",
      fuelType: "diesel",
      transportKm: "15000",
      transportType: "transporte_publico",
      waterM3: "900",
      wasteKg: "2400",
      emissionKgCo2: "16890.80",
      compensationValueKz: "168908.00"
    },
    // Energy companies
    {
      companyName: "ENSUL",
      energyKwh: "45000",
      fuelLiters: "7500",
      fuelType: "diesel",
      transportKm: "18000",
      transportType: "transporte_pesado",
      waterM3: "1200",
      wasteKg: "3500",
      emissionKgCo2: "26750.90",
      compensationValueKz: "267509.00"
    },
    {
      companyName: "Empresa Nacional de Distribuição de Electricidade",
      energyKwh: "65000",
      fuelLiters: "12000",
      fuelType: "diesel",
      transportKm: "25000",
      transportType: "transporte_pesado",
      waterM3: "1800",
      wasteKg: "5200",
      emissionKgCo2: "38950.75",
      compensationValueKz: "389507.50"
    },
    // Oil & Gas companies
    {
      companyName: "Eni Angola",
      energyKwh: "55000",
      fuelLiters: "9500",
      fuelType: "diesel",
      transportKm: "22000",
      transportType: "transporte_pesado",
      waterM3: "1500",
      wasteKg: "4800",
      emissionKgCo2: "32850.65",
      compensationValueKz: "328506.50"
    },
    {
      companyName: "Chevron Angola",
      energyKwh: "48000",
      fuelLiters: "8200",
      fuelType: "diesel",
      transportKm: "19000",
      transportType: "transporte_pesado",
      waterM3: "1350",
      wasteKg: "4200",
      emissionKgCo2: "28650.45",
      compensationValueKz: "286504.50"
    },
    {
      companyName: "TotalEnergies Angola",
      energyKwh: "52000",
      fuelLiters: "8800",
      fuelType: "diesel",
      transportKm: "21000",
      transportType: "transporte_pesado",
      waterM3: "1450",
      wasteKg: "4600",
      emissionKgCo2: "31250.80",
      compensationValueKz: "312508.00"
    },
    // Mining companies
    {
      companyName: "Endiama",
      energyKwh: "38000",
      fuelLiters: "6500",
      fuelType: "diesel",
      transportKm: "16000",
      transportType: "transporte_pesado",
      waterM3: "1100",
      wasteKg: "3200",
      emissionKgCo2: "22890.40",
      compensationValueKz: "228904.00"
    },
    {
      companyName: "Catoca",
      energyKwh: "42000",
      fuelLiters: "7200",
      fuelType: "diesel",
      transportKm: "18000",
      transportType: "transporte_pesado",
      waterM3: "1250",
      wasteKg: "3800",
      emissionKgCo2: "25450.60",
      compensationValueKz: "254506.00"
    },
    // Retail companies
    {
      companyName: "Shoprite Angola",
      energyKwh: "35000",
      fuelLiters: "5800",
      fuelType: "diesel",
      transportKm: "14000",
      transportType: "carro_diesel",
      waterM3: "950",
      wasteKg: "2800",
      emissionKgCo2: "20650.75",
      compensationValueKz: "206507.50"
    },
    {
      companyName: "Nosso Super",
      energyKwh: "32000",
      fuelLiters: "5200",
      fuelType: "diesel",
      transportKm: "12500",
      transportType: "carro_diesel",
      waterM3: "850",
      wasteKg: "2500",
      emissionKgCo2: "18450.50",
      compensationValueKz: "184505.00"
    },
    // Construction companies
    {
      companyName: "Macon",
      energyKwh: "48000",
      fuelLiters: "8500",
      fuelType: "diesel",
      transportKm: "20000",
      transportType: "transporte_pesado",
      waterM3: "1400",
      wasteKg: "4500",
      emissionKgCo2: "29850.90",
      compensationValueKz: "298509.00"
    },
    {
      companyName: "Novonor Angola",
      energyKwh: "45000",
      fuelLiters: "7800",
      fuelType: "diesel",
      transportKm: "18500",
      transportType: "transporte_pesado",
      waterM3: "1300",
      wasteKg: "4200",
      emissionKgCo2: "27650.65",
      compensationValueKz: "276506.50"
    }
  ];

  try {
    for (const record of additionalConsumptionData) {
      const company = allCompanies.find(c => c.name === record.companyName);
      if (company) {
        await db.insert(consumptionRecords).values({
          companyId: company.id,
          energyKwh: record.energyKwh,
          fuelLiters: record.fuelLiters,
          fuelType: record.fuelType,
          transportKm: record.transportKm,
          transportType: record.transportType,
          waterM3: record.waterM3,
          wasteKg: record.wasteKg,
          emissionKgCo2: record.emissionKgCo2,
          compensationValueKz: record.compensationValueKz,
          period: "monthly",
          month: "novembro",
          year: 2024
        });
        
        console.log(`Added consumption record for ${record.companyName}`);
      }
    }
    
    console.log("Additional consumption data added successfully!");
  } catch (error) {
    console.error("Error adding consumption data:", error);
  }
}

addMoreConsumptionData().catch(console.error);