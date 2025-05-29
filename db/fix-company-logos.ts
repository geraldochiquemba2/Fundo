import { db } from "@db";
import { companies } from "@shared/schema";
import { eq } from "drizzle-orm";

async function fixCompanyLogos() {
  console.log("Fixing company logos with working URLs...");
  
  const logoUpdates = [
    // Use SVG placeholder URLs that will actually work
    {
      name: "Banco de Fomento Angola",
      logoUrl: "https://via.placeholder.com/200x80/1e40af/ffffff?text=BFA"
    },
    {
      name: "Empresa Nacional de Seguros",
      logoUrl: "https://via.placeholder.com/200x80/dc2626/ffffff?text=ENS"
    },
    {
      name: "Unitel",
      logoUrl: "https://via.placeholder.com/200x80/ea580c/ffffff?text=Unitel"
    },
    {
      name: "Sonangol",
      logoUrl: "https://via.placeholder.com/200x80/059669/ffffff?text=Sonangol"
    },
    {
      name: "TAAG",
      logoUrl: "https://via.placeholder.com/200x80/7c3aed/ffffff?text=TAAG"
    },
    {
      name: "Multichoice Angola",
      logoUrl: "https://via.placeholder.com/200x80/f59e0b/ffffff?text=DStv"
    },
    {
      name: "BAI",
      logoUrl: "https://via.placeholder.com/200x80/1e40af/ffffff?text=BAI"
    },
    {
      name: "Standard Bank Angola",
      logoUrl: "https://via.placeholder.com/200x80/065f46/ffffff?text=Standard"
    },
    {
      name: "Millennium Atlântico",
      logoUrl: "https://via.placeholder.com/200x80/7c2d12/ffffff?text=BMA"
    },
    {
      name: "Kero",
      logoUrl: "https://via.placeholder.com/200x80/dc2626/ffffff?text=Kero"
    },
    {
      name: "Africell Angola",
      logoUrl: "https://via.placeholder.com/200x80/2563eb/ffffff?text=Africell"
    },
    {
      name: "INAPEN",
      logoUrl: "https://via.placeholder.com/200x80/374151/ffffff?text=INAPEN"
    },
    {
      name: "ENSA",
      logoUrl: "https://via.placeholder.com/200x80/dc2626/ffffff?text=ENSA"
    },
    {
      name: "Global Seguros", 
      logoUrl: "https://via.placeholder.com/200x80/1d4ed8/ffffff?text=Global"
    },
    {
      name: "Banco BIC",
      logoUrl: "https://via.placeholder.com/200x80/059669/ffffff?text=BIC"
    },
    {
      name: "Banco Angolano de Investimentos",
      logoUrl: "https://via.placeholder.com/200x80/1e40af/ffffff?text=BAI"
    },
    {
      name: "Banco de Poupança e Crédito",
      logoUrl: "https://via.placeholder.com/200x80/7c3aed/ffffff?text=BPC"
    },
    {
      name: "Movicel",
      logoUrl: "https://via.placeholder.com/200x80/ea580c/ffffff?text=Movicel"
    },
    {
      name: "TV Zimbo",
      logoUrl: "https://via.placeholder.com/200x80/dc2626/ffffff?text=TV+Zimbo"
    },
    {
      name: "Rádio Nacional de Angola",
      logoUrl: "https://via.placeholder.com/200x80/374151/ffffff?text=RNA"
    },
    {
      name: "ENSUL",
      logoUrl: "https://via.placeholder.com/200x80/f59e0b/ffffff?text=ENSUL"
    },
    {
      name: "Empresa Nacional de Distribuição de Electricidade",
      logoUrl: "https://via.placeholder.com/200x80/1d4ed8/ffffff?text=ENDE"
    },
    {
      name: "Empresa Pública de Águas de Luanda",
      logoUrl: "https://via.placeholder.com/200x80/0891b2/ffffff?text=EPAL"
    },
    {
      name: "Refina do Lobito",
      logoUrl: "https://via.placeholder.com/200x80/059669/ffffff?text=Refina"
    },
    {
      name: "Shoprite Angola",
      logoUrl: "https://via.placeholder.com/200x80/dc2626/ffffff?text=Shoprite"
    },
    {
      name: "Jumia Angola",
      logoUrl: "https://via.placeholder.com/200x80/ea580c/ffffff?text=Jumia"
    },
    {
      name: "Nosso Super",
      logoUrl: "https://via.placeholder.com/200x80/22c55e/ffffff?text=Nosso+Super"
    },
    {
      name: "Eni Angola",
      logoUrl: "https://via.placeholder.com/200x80/7c2d12/ffffff?text=Eni"
    },
    {
      name: "Chevron Angola",
      logoUrl: "https://via.placeholder.com/200x80/1e40af/ffffff?text=Chevron"
    },
    {
      name: "TotalEnergies Angola",
      logoUrl: "https://via.placeholder.com/200x80/dc2626/ffffff?text=Total"
    },
    {
      name: "BP Angola",
      logoUrl: "https://via.placeholder.com/200x80/22c55e/ffffff?text=BP"
    },
    {
      name: "Endiama",
      logoUrl: "https://via.placeholder.com/200x80/7c3aed/ffffff?text=Endiama"
    },
    {
      name: "Catoca",
      logoUrl: "https://via.placeholder.com/200x80/1d4ed8/ffffff?text=Catoca"
    },
    {
      name: "Terminal de Contentores de Luanda",
      logoUrl: "https://via.placeholder.com/200x80/0891b2/ffffff?text=TCUL"
    },
    {
      name: "Macon",
      logoUrl: "https://via.placeholder.com/200x80/f59e0b/ffffff?text=Macon"
    },
    {
      name: "Novonor Angola",
      logoUrl: "https://via.placeholder.com/200x80/374151/ffffff?text=Novonor"
    },
    {
      name: "Soares da Costa Angola",
      logoUrl: "https://via.placeholder.com/200x80/7c2d12/ffffff?text=Soares+Costa"
    }
  ];

  try {
    for (const update of logoUpdates) {
      await db
        .update(companies)
        .set({ logoUrl: update.logoUrl })
        .where(eq(companies.name, update.name));
      
      console.log(`Updated logo for: ${update.name}`);
    }
    
    console.log("All company logos updated successfully!");
  } catch (error) {
    console.error("Error updating company logos:", error);
  }
}

fixCompanyLogos().catch(console.error);