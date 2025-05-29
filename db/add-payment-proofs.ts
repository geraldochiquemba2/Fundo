import { db } from "@db";
import { paymentProofs, companies, sdgs, projects, investments } from "@shared/schema";

async function addPaymentProofs() {
  console.log("Adding payment proofs for companies...");
  
  // Get all companies, SDGs, and projects
  const allCompanies = await db.query.companies.findMany();
  const allSdgs = await db.query.sdgs.findMany();
  const allProjects = await db.query.projects.findMany();
  
  // Payment proofs data for companies
  const paymentProofsData = [
    // Banking sector
    {
      companyName: "Banco BIC",
      amount: "2500000",
      sdgNumber: 1,
      projectName: "Programa Nacional de Microcrédito"
    },
    {
      companyName: "Banco Angolano de Investimentos", 
      amount: "3200000",
      sdgNumber: 4,
      projectName: "Escolas Digitais Comunitárias"
    },
    {
      companyName: "Banco de Poupança e Crédito",
      amount: "4100000",
      sdgNumber: 8,
      projectName: "Incubadoras de Empresas Juvenis"
    },
    // Telecommunications
    {
      companyName: "Movicel",
      amount: "2800000",
      sdgNumber: 9,
      projectName: "Centro de Inovação Tecnológica de Luanda"
    },
    // Energy companies
    {
      companyName: "ENSUL",
      amount: "5200000",
      sdgNumber: 7,
      projectName: "Parques Eólicos do Namibe"
    },
    {
      companyName: "Empresa Nacional de Distribuição de Electricidade",
      amount: "6800000",
      sdgNumber: 7,
      projectName: "Parques Eólicos do Namibe"
    },
    // Oil & Gas companies
    {
      companyName: "Eni Angola",
      amount: "4500000",
      sdgNumber: 13,
      projectName: "Reflorestação do Planalto Central"
    },
    {
      companyName: "Chevron Angola",
      amount: "3800000",
      sdgNumber: 13,
      projectName: "Reflorestação do Planalto Central"
    },
    {
      companyName: "TotalEnergies Angola",
      amount: "4200000",
      sdgNumber: 14,
      projectName: "Conservação Marinha da Costa Angolana"
    },
    {
      companyName: "BP Angola",
      amount: "3500000",
      sdgNumber: 15,
      projectName: "Parque Nacional do Iona Sustentável"
    },
    // Mining companies
    {
      companyName: "Endiama",
      amount: "3200000",
      sdgNumber: 15,
      projectName: "Parque Nacional do Iona Sustentável"
    },
    {
      companyName: "Catoca",
      amount: "2800000",
      sdgNumber: 6,
      projectName: "Rede Nacional de Saneamento Básico"
    },
    // Retail companies
    {
      companyName: "Shoprite Angola",
      amount: "2200000",
      sdgNumber: 12,
      projectName: "Programa Resíduo Zero"
    },
    {
      companyName: "Jumia Angola",
      amount: "1800000",
      sdgNumber: 9,
      projectName: "Centro de Inovação Tecnológica de Luanda"
    },
    {
      companyName: "Nosso Super",
      amount: "2500000",
      sdgNumber: 2,
      projectName: "Centros de Nutrição Comunitária"
    },
    // Insurance companies
    {
      companyName: "ENSA",
      amount: "2800000",
      sdgNumber: 3,
      projectName: "Hospitais Móveis Rurais"
    },
    {
      companyName: "Global Seguros",
      amount: "1900000",
      sdgNumber: 16,
      projectName: "Tribunais Comunitários de Paz"
    },
    // Construction companies
    {
      companyName: "Macon",
      amount: "5500000",
      sdgNumber: 11,
      projectName: "Transporte Público Sustentável de Luanda"
    },
    {
      companyName: "Novonor Angola",
      amount: "4800000",
      sdgNumber: 10,
      projectName: "Programa Habitação Social Inclusiva"
    },
    {
      companyName: "Soares da Costa Angola",
      amount: "4200000",
      sdgNumber: 11,
      projectName: "Transporte Público Sustentável de Luanda"
    },
    // Media companies
    {
      companyName: "TV Zimbo",
      amount: "1500000",
      sdgNumber: 4,
      projectName: "Escolas Digitais Comunitárias"
    },
    {
      companyName: "Rádio Nacional de Angola",
      amount: "1200000",
      sdgNumber: 16,
      projectName: "Tribunais Comunitários de Paz"
    },
    // Water and sanitation
    {
      companyName: "Empresa Pública de Águas de Luanda",
      amount: "3800000",
      sdgNumber: 6,
      projectName: "Rede Nacional de Saneamento Básico"
    },
    // Oil refining
    {
      companyName: "Refina do Lobito",
      amount: "3200000",
      sdgNumber: 12,
      projectName: "Programa Resíduo Zero"
    },
    // Logistics
    {
      companyName: "Terminal de Contentores de Luanda",
      amount: "2800000",
      sdgNumber: 9,
      projectName: "Centro de Inovação Tecnológica de Luanda"
    }
  ];

  try {
    for (const proofData of paymentProofsData) {
      const company = allCompanies.find(c => c.name === proofData.companyName);
      const sdg = allSdgs.find(s => s.number === proofData.sdgNumber);
      const project = allProjects.find(p => p.name === proofData.projectName);
      
      if (company && sdg && project) {
        // Create payment proof
        const [paymentProof] = await db.insert(paymentProofs).values({
          companyId: company.id,
          fileUrl: `/uploads/proofs/approved-${company.id}-${Date.now()}.pdf`,
          amount: proofData.amount,
          sdgId: sdg.id,
          status: 'approved'
        }).returning();
        
        // Create corresponding investment
        await db.insert(investments).values({
          companyId: company.id,
          projectId: project.id,
          paymentProofId: paymentProof.id,
          amount: proofData.amount
        });
        
        console.log(`Added payment proof and investment for ${proofData.companyName} - ${proofData.amount} Kz`);
      }
    }
    
    console.log("All payment proofs and investments added successfully!");
  } catch (error) {
    console.error("Error adding payment proofs:", error);
  }
}

addPaymentProofs().catch(console.error);