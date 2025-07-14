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

async function addIndividualInvestors() {
  try {
    console.log("Adicionando investidores individuais...");
    
    // Verificar se já existem indivíduos
    const existingIndividuals = await db.query.individuals.findMany();
    
    if (existingIndividuals.length > 0) {
      console.log("Indivíduos já existem no banco de dados.");
      return;
    }
    
    // Criar usuários individuais
    const individualUsersData = [
      { email: "ana.silva@gmail.com", password: "123456789", role: "individual" },
      { email: "carlos.santos@gmail.com", password: "123456789", role: "individual" },
      { email: "maria.oliveira@gmail.com", password: "123456789", role: "individual" },
      { email: "joao.pereira@gmail.com", password: "123456789", role: "individual" },
      { email: "lucia.costa@gmail.com", password: "123456789", role: "individual" },
    ];
    
    const individualUsers = [];
    for (const userData of individualUsersData) {
      const [user] = await db.insert(schema.users).values({
        email: userData.email,
        password: await hashPassword(userData.password),
        role: userData.role as "individual"
      }).returning();
      individualUsers.push(user);
    }
    
    console.log(`Criados ${individualUsers.length} usuários individuais.`);
    
    // Criar perfis de indivíduos
    const individualProfilesData = [
      {
        userId: individualUsers[0].id,
        firstName: "Ana",
        lastName: "Silva",
        phone: "+244 912 345 678",
        location: "Luanda, Angola",
        occupation: "Engenheira Ambiental",
        profilePictureUrl: null
      },
      {
        userId: individualUsers[1].id,
        firstName: "Carlos",
        lastName: "Santos",
        phone: "+244 923 456 789",
        location: "Benguela, Angola",
        occupation: "Médico",
        profilePictureUrl: null
      },
      {
        userId: individualUsers[2].id,
        firstName: "Maria",
        lastName: "Oliveira",
        phone: "+244 934 567 890",
        location: "Huambo, Angola",
        occupation: "Professora",
        profilePictureUrl: null
      },
      {
        userId: individualUsers[3].id,
        firstName: "João",
        lastName: "Pereira",
        phone: "+244 945 678 901",
        location: "Lubango, Angola",
        occupation: "Empresário",
        profilePictureUrl: null
      },
      {
        userId: individualUsers[4].id,
        firstName: "Lúcia",
        lastName: "Costa",
        phone: "+244 956 789 012",
        location: "Malanje, Angola",
        occupation: "Advogada",
        profilePictureUrl: null
      }
    ];
    
    const individuals = [];
    for (const profileData of individualProfilesData) {
      const [individual] = await db.insert(schema.individuals).values(profileData).returning();
      individuals.push(individual);
    }
    
    console.log(`Criados ${individuals.length} perfis de indivíduos.`);
    
    // Buscar SDGs e projetos para criar investimentos
    const sdgs = await db.query.sdgs.findMany();
    const projects = await db.query.projects.findMany();
    
    if (sdgs.length === 0 || projects.length === 0) {
      console.log("Necessário ter SDGs e projetos para criar investimentos.");
      return;
    }
    
    // Criar comprovativos de pagamento para indivíduos
    const paymentProofs = [];
    for (let i = 0; i < individuals.length; i++) {
      const individual = individuals[i];
      const randomSdg = sdgs[Math.floor(Math.random() * sdgs.length)];
      const amount = Math.floor(Math.random() * 50000) + 10000; // Entre 10.000 e 60.000 Kz
      
      const [paymentProof] = await db.insert(schema.paymentProofs).values({
        individualId: individual.id,
        sdgId: randomSdg.id,
        amount: amount.toString(),
        description: `Investimento em ${randomSdg.name}`,
        receiptUrl: null,
        status: "approved"
      }).returning();
      
      paymentProofs.push(paymentProof);
    }
    
    console.log(`Criados ${paymentProofs.length} comprovativos de pagamento.`);
    
    // Criar investimentos em projetos
    const investments = [];
    for (let i = 0; i < paymentProofs.length; i++) {
      const paymentProof = paymentProofs[i];
      const individual = individuals[i];
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      
      const [investment] = await db.insert(schema.investments).values({
        individualId: individual.id,
        projectId: randomProject.id,
        paymentProofId: paymentProof.id,
        amount: paymentProof.amount
      }).returning();
      
      investments.push(investment);
    }
    
    console.log(`Criados ${investments.length} investimentos de indivíduos.`);
    
    // Criar alguns investimentos adicionais para diferentes SDGs
    const additionalInvestments = [];
    for (let i = 0; i < 3; i++) {
      const individual = individuals[i];
      const randomSdg = sdgs[Math.floor(Math.random() * sdgs.length)];
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      const amount = Math.floor(Math.random() * 30000) + 5000; // Entre 5.000 e 35.000 Kz
      
      // Criar outro comprovativo de pagamento
      const [paymentProof] = await db.insert(schema.paymentProofs).values({
        individualId: individual.id,
        sdgId: randomSdg.id,
        amount: amount.toString(),
        description: `Investimento adicional em ${randomSdg.name}`,
        receiptUrl: null,
        status: "approved"
      }).returning();
      
      // Criar investimento
      const [investment] = await db.insert(schema.investments).values({
        individualId: individual.id,
        projectId: randomProject.id,
        paymentProofId: paymentProof.id,
        amount: paymentProof.amount
      }).returning();
      
      additionalInvestments.push(investment);
    }
    
    console.log(`Criados ${additionalInvestments.length} investimentos adicionais.`);
    
    console.log("✅ Investidores individuais adicionados com sucesso!");
    
  } catch (error) {
    console.error("Erro ao adicionar investidores individuais:", error);
  }
}

addIndividualInvestors();