import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Check if admin user already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users) => eq(users.email, "admin@gmail.com")
    });
    
    if (!existingAdmin) {
      console.log("Creating admin user...");
      // Create admin user
      const [adminUser] = await db.insert(schema.users).values({
        email: "admin@gmail.com",
        password: await hashPassword("123456789"),
        role: "admin"
      }).returning();
      
      console.log("Admin user created with ID:", adminUser.id);
    } else {
      console.log("Admin user already exists, skipping creation.");
    }
    
    // Check if SDGs already exist
    const existingSdgs = await db.query.sdgs.findMany();
    
    if (existingSdgs.length === 0) {
      console.log("Creating SDGs...");
      
      // Seed the 17 SDGs
      const sdgsData = [
        { number: 1, name: "Erradicação da Pobreza", description: "Acabar com a pobreza em todas as suas formas, em todos os lugares.", color: "#E5243B" },
        { number: 2, name: "Fome Zero", description: "Acabar com a fome, alcançar a segurança alimentar e melhoria da nutrição e promover a agricultura sustentável.", color: "#DDA63A" },
        { number: 3, name: "Saúde e Bem-estar", description: "Assegurar uma vida saudável e promover o bem-estar para todos, em todas as idades.", color: "#4C9F38" },
        { number: 4, name: "Educação de Qualidade", description: "Assegurar a educação inclusiva e equitativa e de qualidade, e promover oportunidades de aprendizagem ao longo da vida para todos.", color: "#C5192D" },
        { number: 5, name: "Igualdade de Gênero", description: "Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas.", color: "#FF3A21" },
        { number: 6, name: "Água Potável e Saneamento", description: "Garantir disponibilidade e manejo sustentável da água e saneamento para todos.", color: "#26BDE2" },
        { number: 7, name: "Energia Limpa e Acessível", description: "Garantir acesso à energia barata, confiável, sustentável e renovável para todos.", color: "#FCC30B" },
        { number: 8, name: "Trabalho Decente e Crescimento Econômico", description: "Promover o crescimento econômico sustentado, inclusivo e sustentável, emprego pleno e produtivo, e trabalho decente para todos.", color: "#A21942" },
        { number: 9, name: "Indústria, Inovação e Infraestrutura", description: "Construir infraestrutura resiliente, promover a industrialização inclusiva e sustentável, e fomentar a inovação.", color: "#FD6925" },
        { number: 10, name: "Redução das Desigualdades", description: "Reduzir as desigualdades dentro dos países e entre eles.", color: "#DD1367" },
        { number: 11, name: "Cidades e Comunidades Sustentáveis", description: "Tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis.", color: "#FD9D24" },
        { number: 12, name: "Consumo e Produção Responsáveis", description: "Assegurar padrões de produção e de consumo sustentáveis.", color: "#BF8B2E" },
        { number: 13, name: "Ação Contra a Mudança Global do Clima", description: "Tomar medidas urgentes para combater a mudança climática e seus impactos.", color: "#3F7E44" },
        { number: 14, name: "Vida na Água", description: "Conservação e uso sustentável dos oceanos, dos mares e dos recursos marinhos para o desenvolvimento sustentável.", color: "#0A97D9" },
        { number: 15, name: "Vida Terrestre", description: "Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres, gerir de forma sustentável as florestas, combater a desertificação, deter e reverter a degradação da Terra e deter a perda da biodiversidade.", color: "#56C02B" },
        { number: 16, name: "Paz, Justiça e Instituições Eficazes", description: "Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável, proporcionar o acesso à justiça para todos e construir instituições eficazes, responsáveis e inclusivas em todos os níveis.", color: "#00689D" },
        { number: 17, name: "Parcerias e Meios de Implementação", description: "Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável.", color: "#19486A" }
      ];
      
      await db.insert(schema.sdgs).values(sdgsData);
      console.log("SDGs created successfully.");
    } else {
      console.log(`${existingSdgs.length} SDGs already exist, skipping creation.`);
    }
    
    // Check if sample projects already exist
    const existingProjects = await db.query.projects.findMany();
    
    if (existingProjects.length === 0) {
      console.log("Creating sample projects...");
      
      // Get SDGs IDs
      const sdgs = await db.query.sdgs.findMany();
      const sdgsMap = new Map(sdgs.map(sdg => [sdg.number, sdg.id]));
      
      // Sample projects data
      const projectsData = [
        {
          name: "Reflorestamento da Reserva Natural",
          sdgId: sdgsMap.get(15)!, // Vida Terrestre
          description: "Projeto de plantio de árvores nativas para recuperação de áreas degradadas e preservação da biodiversidade local. Este projeto visa reflorestar áreas desmatadas e criar corredores ecológicos.",
          imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          totalInvested: "12500000", // 12.500.000 Kz
        },
        {
          name: "Painéis Solares em Comunidades Rurais",
          sdgId: sdgsMap.get(7)!, // Energia Limpa e Acessível
          description: "Instalação de sistemas fotovoltaicos em áreas sem acesso à rede elétrica, proporcionando energia limpa. O projeto beneficia comunidades isoladas, permitindo acesso à energia para necessidades básicas e desenvolvimento local.",
          imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          totalInvested: "8750000", // 8.750.000 Kz
        },
        {
          name: "Sistemas de Purificação de Água",
          sdgId: sdgsMap.get(6)!, // Água Potável e Saneamento
          description: "Instalação de filtros e sistemas de tratamento para garantir acesso à água potável para comunidades vulneráveis. O projeto inclui também educação sobre higiene e uso sustentável dos recursos hídricos.",
          imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          totalInvested: "6320000", // 6.320.000 Kz
        }
      ];
      
      for (const projectData of projectsData) {
        await db.insert(schema.projects).values(projectData);
      }
      
      console.log("Sample projects created successfully.");
    } else {
      console.log(`${existingProjects.length} projects already exist, skipping creation.`);
    }
    
    // Check if companies already exist
    const existingCompanies = await db.query.companies.findMany();
    
    if (existingCompanies.length <= 5) { // Add new companies if we have 5 or fewer
      console.log("Creating Angolan companies...");
      
      // Create company users first
      const companyUsersData = [
        { email: "bfa@bfa.ao", password: await hashPassword("bfa123456"), role: "company" as const },
        { email: "contact@angolacables.co.ao", password: await hashPassword("cables123456"), role: "company" as const },
        { email: "info@kero.ao", password: await hashPassword("kero123456"), role: "company" as const },
        { email: "contact@taag.ao", password: await hashPassword("taag123456"), role: "company" as const },
        { email: "info@movicel.ao", password: await hashPassword("movicel123456"), role: "company" as const },
        { email: "contact@refriango.ao", password: await hashPassword("refriango123456"), role: "company" as const },
        { email: "info@fazendagirassol.com", password: await hashPassword("girassol123456"), role: "company" as const },
        { email: "contact@zap.co.ao", password: await hashPassword("zap123456"), role: "company" as const },
        { email: "info@cocacola.ao", password: await hashPassword("cocacola123456"), role: "company" as const },
        { email: "contact@africell.ao", password: await hashPassword("africell123456"), role: "company" as const },
        { email: "info@inapen.gov.ao", password: await hashPassword("inapen123456"), role: "company" as const }
      ];
      
      const createdUsers = [];
      for (const userData of companyUsersData) {
        const [user] = await db.insert(schema.users).values(userData).returning();
        createdUsers.push(user);
      }
      
      // Create companies
      const companiesData = [
        {
          userId: createdUsers[0].id,
          name: "Banco de Fomento Angola (BFA)",
          sector: "Serviços Financeiros",
          logoUrl: "https://yt3.ggpht.com/a-/AAuE7mBtMdXtNDGQIHWQ3MsAN0ojUSwk256VJeNcDg=s900-mo-c-c0xffffffff-rj-k-no"
        },
        {
          userId: createdUsers[1].id,
          name: "Angola Cables",
          sector: "Telecomunicações",
          logoUrl: "https://tech.africa/wp-content/uploads/Angola-Cables.png"
        },
        {
          userId: createdUsers[2].id,
          name: "Kero Supermercados",
          sector: "Varejo / Supermercados",
          logoUrl: "https://gastem.ao/wp-content/uploads/2020/08/logo-kero.jpg"
        },
        {
          userId: createdUsers[3].id,
          name: "TAAG Angola Airlines",
          sector: "Aviação",
          logoUrl: "http://angovagas.net/wp-content/uploads/2022/04/FB_IMG_16494867467389946.jpg"
        },
        {
          userId: createdUsers[4].id,
          name: "Movicel",
          sector: "Telecomunicações",
          logoUrl: "http://r-spectrum.com.au/sites/default/files/styles/large/public/2019-11/movicel-logo.png"
        },
        {
          userId: createdUsers[5].id,
          name: "Refriango",
          sector: "Indústria de Bebidas",
          logoUrl: "http://angovagas.net/wp-content/uploads/2022/05/REFRIANGO.png"
        },
        {
          userId: createdUsers[6].id,
          name: "Fazenda Girassol",
          sector: "Agricultura",
          logoUrl: "https://www.fazendagirassol.com/Themes/Healthy/Content/images/logo.png"
        },
        {
          userId: createdUsers[7].id,
          name: "ZAP",
          sector: "Telecomunicações",
          logoUrl: "https://th.bing.com/th/id/R.4cdc31c0f37eb408049f8b445bea0bd1"
        },
        {
          userId: createdUsers[8].id,
          name: "Coca-Cola Angola",
          sector: "Bebidas",
          logoUrl: "https://th.bing.com/th/id/OIP.z7mzSJmhxfClqm5Zt9aLQAHaFC"
        },
        {
          userId: createdUsers[9].id,
          name: "Africell Angola",
          sector: "Telecomunicações",
          logoUrl: "https://www.menosfios.com/wp-content/uploads/2022/04/273150568_464996925118183_7635331094090428991_n.jpg"
        },
        {
          userId: createdUsers[10].id,
          name: "INAPEN",
          sector: "Administração Pública",
          logoUrl: "https://th.bing.com/th/id/OIP.WiC-L0GmyyR46CE0ieYN6QHaHa"
        }
      ];
      
      const createdCompanies = [];
      for (const companyData of companiesData) {
        const [company] = await db.insert(schema.companies).values(companyData).returning();
        createdCompanies.push(company);
      }
      
      console.log("Angolan companies created successfully.");
      
      // Create payment proofs and investments to cover all SDGs
      console.log("Creating strategic investments for all SDGs...");
      
      const sdgs = await db.query.sdgs.findMany();
      const projects = await db.query.projects.findMany();
      
      // Investment data with company assignments
      const investmentPlans = [
        // SDG 1 - Erradicação da Pobreza
        { companyIndex: 0, projectIndex: 0, amount: "2500000", sdgNumber: 1 },
        { companyIndex: 10, projectIndex: 0, amount: "1800000", sdgNumber: 1 },
        
        // SDG 2 - Fome Zero
        { companyIndex: 6, projectIndex: 0, amount: "3200000", sdgNumber: 2 },
        { companyIndex: 2, projectIndex: 0, amount: "1500000", sdgNumber: 2 },
        
        // SDG 3 - Saúde e Bem-estar
        { companyIndex: 8, projectIndex: 0, amount: "2800000", sdgNumber: 3 },
        { companyIndex: 5, projectIndex: 0, amount: "1200000", sdgNumber: 3 },
        
        // SDG 4 - Educação de Qualidade
        { companyIndex: 1, projectIndex: 0, amount: "4500000", sdgNumber: 4 },
        { companyIndex: 3, projectIndex: 0, amount: "2200000", sdgNumber: 4 },
        
        // SDG 5 - Igualdade de Gênero
        { companyIndex: 0, projectIndex: 0, amount: "1800000", sdgNumber: 5 },
        { companyIndex: 2, projectIndex: 0, amount: "950000", sdgNumber: 5 },
        
        // SDG 6 - Água Potável e Saneamento
        { companyIndex: 10, projectIndex: 2, amount: "3800000", sdgNumber: 6 },
        { companyIndex: 0, projectIndex: 2, amount: "2520000", sdgNumber: 6 },
        
        // SDG 7 - Energia Limpa e Acessível
        { companyIndex: 1, projectIndex: 1, amount: "5200000", sdgNumber: 7 },
        { companyIndex: 4, projectIndex: 1, amount: "3550000", sdgNumber: 7 },
        
        // SDG 8 - Trabalho Decente e Crescimento Econômico
        { companyIndex: 3, projectIndex: 0, amount: "4200000", sdgNumber: 8 },
        { companyIndex: 5, projectIndex: 0, amount: "2800000", sdgNumber: 8 },
        
        // SDG 9 - Indústria, Inovação e Infraestrutura
        { companyIndex: 1, projectIndex: 0, amount: "6500000", sdgNumber: 9 },
        { companyIndex: 7, projectIndex: 0, amount: "3200000", sdgNumber: 9 },
        
        // SDG 10 - Redução das Desigualdades
        { companyIndex: 0, projectIndex: 0, amount: "2800000", sdgNumber: 10 },
        { companyIndex: 10, projectIndex: 0, amount: "1600000", sdgNumber: 10 },
        
        // SDG 11 - Cidades e Comunidades Sustentáveis
        { companyIndex: 3, projectIndex: 0, amount: "3500000", sdgNumber: 11 },
        { companyIndex: 2, projectIndex: 0, amount: "1800000", sdgNumber: 11 },
        
        // SDG 12 - Consumo e Produção Responsáveis
        { companyIndex: 5, projectIndex: 0, amount: "2200000", sdgNumber: 12 },
        { companyIndex: 8, projectIndex: 0, amount: "1900000", sdgNumber: 12 },
        
        // SDG 13 - Ação Contra a Mudança Global do Clima
        { companyIndex: 6, projectIndex: 0, amount: "4800000", sdgNumber: 13 },
        { companyIndex: 1, projectIndex: 0, amount: "3200000", sdgNumber: 13 },
        
        // SDG 14 - Vida na Água
        { companyIndex: 9, projectIndex: 0, amount: "2800000", sdgNumber: 14 },
        { companyIndex: 10, projectIndex: 0, amount: "2100000", sdgNumber: 14 },
        
        // SDG 15 - Vida Terrestre
        { companyIndex: 6, projectIndex: 0, amount: "8500000", sdgNumber: 15 },
        { companyIndex: 8, projectIndex: 0, amount: "4000000", sdgNumber: 15 },
        
        // SDG 16 - Paz, Justiça e Instituições Eficazes
        { companyIndex: 10, projectIndex: 0, amount: "5200000", sdgNumber: 16 },
        { companyIndex: 0, projectIndex: 0, amount: "2800000", sdgNumber: 16 },
        
        // SDG 17 - Parcerias e Meios de Implementação
        { companyIndex: 0, projectIndex: 0, amount: "3800000", sdgNumber: 17 },
        { companyIndex: 1, projectIndex: 0, amount: "2500000", sdgNumber: 17 },
        { companyIndex: 7, projectIndex: 0, amount: "1800000", sdgNumber: 17 }
      ];
      
      for (const plan of investmentPlans) {
        const companyId = createdCompanies[plan.companyIndex].id;
        const projectId = projects[plan.projectIndex]?.id || projects[0]?.id || 1;
        const sdgId = sdgs.find(s => s.number === plan.sdgNumber)?.id || plan.sdgNumber;
        
        // Create payment proof
        const [paymentProof] = await db.insert(schema.paymentProofs).values({
          companyId: companyId,
          fileUrl: `/uploads/proofs/investment-proof-${Date.now()}.pdf`,
          amount: plan.amount,
          sdgId: sdgId,
          status: 'approved'
        }).returning();
        
        // Create investment
        await db.insert(schema.investments).values({
          companyId: companyId,
          projectId: projectId,
          paymentProofId: paymentProof.id,
          amount: plan.amount
        });
      }
      
      console.log("Strategic investments created successfully for all SDGs.");
    } else {
      console.log(`${existingCompanies.length} companies already exist, skipping creation.`);
    }

    console.log("Database seeding completed.");
  } 
  catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
