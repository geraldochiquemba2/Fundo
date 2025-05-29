import { db } from "@db";
import { users, companies } from "@shared/schema";
import bcrypt from "bcryptjs";

async function addMoreCompanies() {
  console.log("Adding more authentic Angolan companies...");
  
  // Additional authentic Angolan companies
  const additionalCompaniesData = [
    {
      email: "admin@ensa.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "ENSA",
      sector: "Seguros",
      logoUrl: "https://www.ensa.co.ao/assets/images/logo.png"
    },
    {
      email: "admin@globalensa.co.ao", 
      password: await bcrypt.hash("password123", 10),
      companyName: "Global Seguros",
      sector: "Seguros",
      logoUrl: "https://globalseguros.co.ao/wp-content/uploads/2022/06/logo-global-seguros.png"
    },
    {
      email: "admin@bic.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Banco BIC",
      sector: "Serviços Financeiros",
      logoUrl: "https://www.bic.ao/assets/images/bic-logo.png"
    },
    {
      email: "admin@bai.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Banco Angolano de Investimentos",
      sector: "Serviços Financeiros", 
      logoUrl: "https://www.bancobai.ao/images/logo-bai.png"
    },
    {
      email: "admin@bpc.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Banco de Poupança e Crédito",
      sector: "Serviços Financeiros",
      logoUrl: "https://www.bpc.ao/assets/img/logo-bpc.png"
    },
    {
      email: "admin@movicel.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Movicel",
      sector: "Telecomunicações",
      logoUrl: "https://www.movicel.co.ao/images/logo-movicel.png"
    },
    {
      email: "admin@tv-zimbo.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "TV Zimbo",
      sector: "Comunicação Social",
      logoUrl: "https://tvzimbo.co.ao/wp-content/uploads/2021/01/logo-tv-zimbo.png"
    },
    {
      email: "admin@kwanza.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Rádio Nacional de Angola",
      sector: "Comunicação Social",
      logoUrl: "https://rna.ao/images/logo-rna.png"
    },
    {
      email: "admin@ensul.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "ENSUL",
      sector: "Energia",
      logoUrl: "https://ensul.co.ao/images/logo-ensul.png"
    },
    {
      email: "admin@ende.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Empresa Nacional de Distribuição de Electricidade",
      sector: "Energia",
      logoUrl: "https://ende.co.ao/images/logo-ende.png"
    },
    {
      email: "admin@epal.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Empresa Pública de Águas de Luanda",
      sector: "Saneamento",
      logoUrl: "https://epal.co.ao/images/logo-epal.png"
    },
    {
      email: "admin@kero.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Refina do Lobito",
      sector: "Energia",
      logoUrl: "https://refinalobito.co.ao/images/logo.png"
    },
    {
      email: "admin@shoprite.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Shoprite Angola",
      sector: "Varejo / Supermercados",
      logoUrl: "https://shoprite.co.ao/images/shoprite-logo.png"
    },
    {
      email: "admin@jumia.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Jumia Angola",
      sector: "Comércio Electrónico",
      logoUrl: "https://jumia.com.ao/assets/images/jumia-logo.png"
    },
    {
      email: "admin@nossosuper.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Nosso Super",
      sector: "Varejo / Supermercados",
      logoUrl: "https://nossosuper.co.ao/images/logo.png"
    },
    {
      email: "admin@agip.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Eni Angola",
      sector: "Petróleo e Gás",
      logoUrl: "https://eni.com/assets/images/eni-logo.png"
    },
    {
      email: "admin@chevron.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Chevron Angola",
      sector: "Petróleo e Gás",
      logoUrl: "https://chevron.com/assets/images/chevron-logo.png"
    },
    {
      email: "admin@total.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "TotalEnergies Angola",
      sector: "Petróleo e Gás",
      logoUrl: "https://totalenergies.com/sites/g/files/nytnzq121/files/styles/w_1110/public/images/2021-05/total-logo.png"
    },
    {
      email: "admin@bp.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "BP Angola",
      sector: "Petróleo e Gás",
      logoUrl: "https://bp.com/content/dam/bp/business-sites/en/global/corporate/images/who-we-are/bp-logo.png"
    },
    {
      email: "admin@diamang.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Endiama",
      sector: "Mineração",
      logoUrl: "https://endiama.co.ao/images/logo-endiama.png"
    },
    {
      email: "admin@catoca.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Catoca",
      sector: "Mineração",
      logoUrl: "https://catoca.com/images/logo-catoca.png"
    },
    {
      email: "admin@tcul.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Terminal de Contentores de Luanda",
      sector: "Logística e Transporte",
      logoUrl: "https://tcul.co.ao/images/logo-tcul.png"
    },
    {
      email: "admin@macon.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Macon",
      sector: "Construção",
      logoUrl: "https://macon.co.ao/images/logo-macon.png"
    },
    {
      email: "admin@odebrecht.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Novonor Angola",
      sector: "Construção",
      logoUrl: "https://novonor.com/assets/images/novonor-logo.png"
    },
    {
      email: "admin@soares-da-costa.co.ao",
      password: await bcrypt.hash("password123", 10),
      companyName: "Soares da Costa Angola",
      sector: "Construção",
      logoUrl: "https://soaresdacosta.com/images/logo-sdc.png"
    }
  ];

  try {
    let companiesAdded = 0;
    
    for (const companyData of additionalCompaniesData) {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, companyData.email)
      });
      
      if (!existingUser) {
        // Create user
        const [newUser] = await db.insert(users).values({
          email: companyData.email,
          password: companyData.password,
          role: 'company'
        }).returning();
        
        // Create company
        await db.insert(companies).values({
          userId: newUser.id,
          name: companyData.companyName,
          sector: companyData.sector,
          logoUrl: companyData.logoUrl
        });
        
        companiesAdded++;
        console.log(`Added company: ${companyData.companyName}`);
      } else {
        console.log(`Company with email ${companyData.email} already exists, skipping...`);
      }
    }
    
    console.log(`Successfully added ${companiesAdded} new companies!`);
    
    // Show total companies count
    const totalCompanies = await db.query.companies.findMany();
    console.log(`Total companies in database: ${totalCompanies.length}`);
    
  } catch (error) {
    console.error("Error adding companies:", error);
  }
}

addMoreCompanies().catch(console.error);