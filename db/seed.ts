import { db } from "./index";
import * as schema from "@shared/schema";
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
      where: (users) => schema.eq(users.email, "admin@gmail.com")
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
    
    console.log("Database seeding completed.");
  } 
  catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
