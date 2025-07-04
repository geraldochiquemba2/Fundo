import { db } from "./index";
import { projects, investments, paymentProofs } from "@shared/schema";
import { eq } from "drizzle-orm";

async function addMoreProjectsWithImages() {
  try {
    console.log("🌟 Adicionando mais projetos com imagens reais...");

    // Novos projetos para diferentes ODSs
    const newProjects = [
      {
        name: "Agricultura Sustentável em Malanje",
        description: "Programa de capacitação de agricultores familiares em técnicas de agricultura orgânica e sustentável. Inclui distribuição de sementes melhoradas, sistemas de irrigação por gotejamento e formação em gestão agrícola. O projeto visa aumentar a produtividade e reduzir o impacto ambiental.",
        sdgId: 2, // Fome Zero
        imageUrl: "/projects/sustainable-agriculture.jpg",
        totalInvested: "15000000"
      },
      {
        name: "Clínicas Móveis de Saúde",
        description: "Unidades móveis de saúde equipadas com tecnologia médica moderna para atender comunidades rurais isoladas. Oferece serviços de diagnóstico, vacinação, cuidados pré-natais e tratamento de doenças comuns. Cada unidade atende em média 500 pessoas por mês.",
        sdgId: 3, // Saúde e Bem-Estar
        imageUrl: "/projects/mobile-health-clinics.jpg",
        totalInvested: "25000000"
      },
      {
        name: "Escolas Digitais do Futuro",
        description: "Modernização de escolas públicas com laboratórios de informática, internet de alta velocidade e formação de professores em tecnologias educacionais. O projeto inclui desenvolvimento de conteúdo educacional digital em línguas locais e programas de alfabetização digital.",
        sdgId: 4, // Educação de Qualidade
        imageUrl: "/projects/digital-schools.jpg",
        totalInvested: "30000000"
      },
      {
        name: "Empoderamento Feminino no Empreendedorismo",
        description: "Centro de formação e incubação de negócios liderados por mulheres. Oferece microcrédito, mentoria empresarial, formação em gestão e marketing digital. Já apoiou mais de 200 mulheres empreendedoras em diversos sectores da economia.",
        sdgId: 5, // Igualdade de Gênero
        imageUrl: "/projects/women-empowerment.jpg",
        totalInvested: "18000000"
      },
      {
        name: "Energia Eólica na Costa Atlântica",
        description: "Instalação de parque eólico com capacidade de 50MW para fornecer energia limpa a comunidades costeiras. O projeto inclui formação de técnicos locais em manutenção de turbinas eólicas e criação de empregos verdes na região.",
        sdgId: 7, // Energia Limpa e Acessível
        imageUrl: "/projects/wind-energy.jpg",
        totalInvested: "85000000"
      },
      {
        name: "Fábrica de Reciclagem de Plásticos",
        description: "Centro industrial de reciclagem que transforma resíduos plásticos em novos produtos. Gera emprego para 150 pessoas e processa 5 toneladas de plástico por dia. Inclui programa de educação ambiental e coleta seletiva em comunidades parceiras.",
        sdgId: 8, // Trabalho Decente e Crescimento Económico
        imageUrl: "/projects/recycling-factory.jpg",
        totalInvested: "40000000"
      },
      {
        name: "Ponte da Integração Regional",
        description: "Construção de ponte moderna ligando províncias isoladas, facilitando o comércio e acesso a serviços essenciais. A infraestrutura inclui ciclovia e passagem para pedestres, promovendo mobilidade sustentável e integração económica regional.",
        sdgId: 9, // Indústria, Inovação e Infraestrutura
        imageUrl: "/projects/regional-bridge.jpg",
        totalInvested: "120000000"
      },
      {
        name: "Habitação Social Sustentável",
        description: "Construção de 500 casas ecológicas para famílias de baixa renda, utilizando materiais locais e técnicas de construção sustentável. As casas incluem painéis solares, sistemas de recolha de água da chuva e hortas comunitárias.",
        sdgId: 11, // Cidades e Comunidades Sustentáveis
        imageUrl: "/projects/social-housing.jpg",
        totalInvested: "95000000"
      },
      {
        name: "Gestão Inteligente de Resíduos",
        description: "Sistema integrado de gestão de resíduos sólidos urbanos com separação na fonte, compostagem e reciclagem. Inclui aplicativo móvel para agendamento de coleta e pontos de entrega voluntária. Reduz em 60% os resíduos enviados para aterros.",
        sdgId: 12, // Consumo e Produção Responsáveis
        imageUrl: "/projects/waste-management.jpg",
        totalInvested: "22000000"
      },
      {
        name: "Reflorestamento da Bacia do Kwanza",
        description: "Plantio de 1 milhão de árvores nativas ao longo do rio Kwanza para combater a erosão e proteger a biodiversidade. O projeto envolve comunidades locais na manutenção das mudas e criação de viveiros comunitários.",
        sdgId: 13, // Ação Contra a Mudança Global do Clima
        imageUrl: "/projects/reforestation-kwanza.jpg",
        totalInvested: "35000000"
      },
      {
        name: "Proteção dos Oceanos e Pesca Sustentável",
        description: "Programa de conservação marinha e apoio a pescadores artesanais para práticas sustentáveis. Inclui criação de áreas marinhas protegidas, monitoramento da qualidade da água e formação em técnicas de pesca responsável.",
        sdgId: 14, // Vida na Água
        imageUrl: "/projects/ocean-protection.jpg",
        totalInvested: "28000000"
      },
      {
        name: "Conservação do Parque Nacional da Quiçama",
        description: "Projeto de proteção da fauna e flora do parque, combate à caça furtiva e desenvolvimento do ecoturismo. Inclui programa de educação ambiental para escolas locais e formação de guias turísticos das comunidades vizinhas.",
        sdgId: 15, // Vida Terrestre
        imageUrl: "/projects/quicama-conservation.jpg",
        totalInvested: "42000000"
      },
      {
        name: "Centros de Justiça Comunitária",
        description: "Criação de centros de mediação e resolução de conflitos em bairros periféricos. Oferece assistência jurídica gratuita, mediação familiar e programas de prevenção da violência. Já atendeu mais de 5000 casos com 80% de resolução pacífica.",
        sdgId: 16, // Paz, Justiça e Instituições Eficazes
        imageUrl: "/projects/community-justice.jpg",
        totalInvested: "12000000"
      }
    ];

    // Inserir projetos
    for (const projectData of newProjects) {
      const [project] = await db.insert(projects).values(projectData).returning();
      console.log(`✅ Projeto criado: ${project.name}`);

      // Criar investimentos simulados para cada projeto
      const companies = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // IDs das empresas existentes
      const numInvestors = Math.floor(Math.random() * 3) + 2; // 2 a 4 investidores por projeto
      
      const selectedCompanies = companies
        .sort(() => Math.random() - 0.5)
        .slice(0, numInvestors);

      for (const companyId of selectedCompanies) {
        // Criar payment proof simulado
        const [paymentProof] = await db.insert(paymentProofs).values({
          companyId,
          amount: (parseFloat(projectData.totalInvested) / numInvestors).toString(),
          fileUrl: `/uploads/proofs/proof-${companyId}-${project.id}.pdf`,
          status: 'approved',
          sdgId: projectData.sdgId
        }).returning();

        // Criar investimento
        await db.insert(investments).values({
          companyId,
          projectId: project.id,
          amount: (parseFloat(projectData.totalInvested) / numInvestors).toString(),
          paymentProofId: paymentProof.id
        });

        console.log(`  💰 Investimento adicionado: Empresa ${companyId} -> ${project.name}`);
      }
    }

    console.log("\n🎉 Todos os projetos foram adicionados com sucesso!");
    console.log("📊 Total de projetos adicionados:", newProjects.length);
    
  } catch (error) {
    console.error("❌ Erro ao adicionar projetos:", error);
  } finally {
    process.exit(0);
  }
}

addMoreProjectsWithImages();