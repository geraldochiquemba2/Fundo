import { db } from "@db";
import { projects, sdgs } from "@shared/schema";

async function addMoreProjects() {
  console.log("Adding more authentic sustainable projects...");
  
  // Get all SDGs to ensure proper mapping
  const allSdgs = await db.query.sdgs.findMany();
  
  const additionalProjects = [
    {
      name: "Programa Nacional de Microcrédito",
      sdgNumber: 1, // Erradicação da Pobreza
      description: "Programa governamental que oferece microcrédito para pequenos empreendedores em comunidades rurais e urbanas, promovendo o desenvolvimento económico local e a redução da pobreza através do acesso facilitado ao financiamento.",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "15000000"
    },
    {
      name: "Centros de Nutrição Comunitária",
      sdgNumber: 2, // Fome Zero
      description: "Rede de centros comunitários que fornecem alimentação nutritiva e educação alimentar para crianças e famílias em situação de vulnerabilidade, combatendo a desnutrição e promovendo hábitos alimentares saudáveis.",
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "8500000"
    },
    {
      name: "Hospitais Móveis Rurais",
      sdgNumber: 3, // Saúde e Bem-estar
      description: "Unidades móveis de saúde equipadas com tecnologia médica avançada que levam cuidados de saúde primários e especializados para comunidades rurais remotas, garantindo acesso universal aos serviços de saúde.",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "12000000"
    },
    {
      name: "Escolas Digitais Comunitárias",
      sdgNumber: 4, // Educação de Qualidade
      description: "Programa de digitalização das escolas em comunidades rurais, fornecendo acesso à internet, computadores e conteúdo educacional digital, promovendo a inclusão digital e melhorando a qualidade da educação.",
      imageUrl: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "9800000"
    },
    {
      name: "Programa Mulher Empreendedora",
      sdgNumber: 5, // Igualdade de Género
      description: "Iniciativa que capacita mulheres com formação empresarial, acesso ao crédito e mentoria, promovendo o empreendedorismo feminino e a igualdade de género no mercado de trabalho angolano.",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "6200000"
    },
    {
      name: "Rede Nacional de Saneamento Básico",
      sdgNumber: 6, // Água Potável e Saneamento
      description: "Expansão da rede de saneamento básico para áreas periurbanas e rurais, incluindo construção de sistemas de tratamento de águas residuais e programas de educação sanitária.",
      imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "25000000"
    },
    {
      name: "Parques Eólicos do Namibe",
      sdgNumber: 7, // Energia Limpa e Acessível
      description: "Desenvolvimento de parques eólicos na província do Namibe, aproveitando os ventos costeiros para gerar energia renovável e reduzir a dependência de combustíveis fósseis no país.",
      imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "45000000"
    },
    {
      name: "Incubadoras de Empresas Juvenis",
      sdgNumber: 8, // Trabalho Decente e Crescimento Económico
      description: "Criação de incubadoras que apoiam jovens empreendedores com espaços de trabalho, mentoria técnica e acesso a financiamento, promovendo o empreendedorismo juvenil e a criação de empregos.",
      imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "11500000"
    },
    {
      name: "Centro de Inovação Tecnológica de Luanda",
      sdgNumber: 9, // Indústria, Inovação e Infraestrutura
      description: "Hub tecnológico que promove a inovação e desenvolvimento de soluções digitais, oferecendo laboratórios de pesquisa, espaços de coworking e programas de aceleração para startups tecnológicas.",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "18000000"
    },
    {
      name: "Programa Habitação Social Inclusiva",
      sdgNumber: 10, // Redução das Desigualdades
      description: "Construção de habitações sociais com infraestrutura adequada para famílias de baixa renda, promovendo a inclusão social e reduzindo as desigualdades no acesso à habitação digna.",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "32000000"
    },
    {
      name: "Transporte Público Sustentável de Luanda",
      sdgNumber: 11, // Cidades e Comunidades Sustentáveis
      description: "Modernização do sistema de transporte público com autocarros elétricos e corredores exclusivos, reduzindo a poluição do ar e melhorando a mobilidade urbana na capital.",
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "28000000"
    },
    {
      name: "Programa Resíduo Zero",
      sdgNumber: 12, // Consumo e Produção Responsáveis
      description: "Iniciativa nacional de gestão de resíduos que promove a reciclagem, compostagem e economia circular, reduzindo o desperdício e promovendo padrões sustentáveis de consumo.",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "14000000"
    },
    {
      name: "Reflorestação do Planalto Central",
      sdgNumber: 13, // Ação Contra a Mudança Global do Clima
      description: "Programa massivo de plantio de árvores nativas no planalto central de Angola, visando o sequestro de carbono, conservação do solo e mitigação dos efeitos das mudanças climáticas.",
      imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "22000000"
    },
    {
      name: "Conservação Marinha da Costa Angolana",
      sdgNumber: 14, // Vida na Água
      description: "Criação de áreas marinhas protegidas ao longo da costa angolana, promovendo a conservação da biodiversidade marinha e o desenvolvimento sustentável da pesca artesanal.",
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "16500000"
    },
    {
      name: "Parque Nacional do Iona Sustentável",
      sdgNumber: 15, // Vida Terrestre
      description: "Revitalização e expansão do Parque Nacional do Iona com programas de conservação da fauna, controle anti-caça furtiva e desenvolvimento do ecoturismo comunitário.",
      imageUrl: "https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "19000000"
    },
    {
      name: "Tribunais Comunitários de Paz",
      sdgNumber: 16, // Paz, Justiça e Instituições Eficazes
      description: "Estabelecimento de tribunais comunitários que resolvem conflitos locais através de mediação tradicional, promovendo a justiça acessível e fortalecendo as instituições locais.",
      imageUrl: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "8800000"
    },
    {
      name: "Plataforma Digital de Cooperação Sul-Sul",
      sdgNumber: 17, // Parcerias e Meios de Implementação
      description: "Plataforma digital que facilita a cooperação e troca de conhecimentos entre países africanos, promovendo parcerias para o desenvolvimento sustentável e a implementação dos ODS.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      totalInvested: "7200000"
    }
  ];

  try {
    for (const project of additionalProjects) {
      const sdg = allSdgs.find(s => s.number === project.sdgNumber);
      if (sdg) {
        await db.insert(projects).values({
          name: project.name,
          sdgId: sdg.id,
          description: project.description,
          imageUrl: project.imageUrl,
          totalInvested: project.totalInvested
        });
        
        console.log(`Added project: ${project.name}`);
      }
    }
    
    console.log("All additional projects added successfully!");
    
    // Show total projects count
    const totalProjects = await db.query.projects.findMany();
    console.log(`Total projects in database: ${totalProjects.length}`);
    
  } catch (error) {
    console.error("Error adding projects:", error);
  }
}

addMoreProjects().catch(console.error);