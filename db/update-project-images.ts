import { db } from "./index";
import { projects } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateProjectImages() {
  try {
    console.log("🎨 Atualizando imagens dos projetos...");

    const projectImageMap: Record<string, string> = {
      "Agricultura Sustentável em Malanje": "projects/sustainable-agriculture.svg",
      "Clínicas Móveis de Saúde": "projects/mobile-health-clinics.svg",
      "Escolas Digitais do Futuro": "projects/digital-schools.svg",
      "Empoderamento Feminino no Empreendedorismo": "projects/women-empowerment.svg",
      "Energia Eólica na Costa Atlântica": "projects/wind-energy.svg",
      "Fábrica de Reciclagem de Plásticos": "projects/recycling-factory.svg",
      "Ponte da Integração Regional": "projects/regional-bridge.svg",
      "Habitação Social Sustentável": "projects/social-housing.svg",
      "Gestão Inteligente de Resíduos": "projects/waste-management.svg",
      "Reflorestamento da Bacia do Kwanza": "projects/reforestation-kwanza.svg",
      "Proteção dos Oceanos e Pesca Sustentável": "projects/ocean-protection.svg",
      "Conservação do Parque Nacional da Quiçama": "projects/quicama-conservation.svg",
      "Centros de Justiça Comunitária": "projects/social-housing.svg", // Reusing social housing image
      "Energia Solar Comunitária": "projects/local-energy.svg",
      "Porto de Pesca Sustentável": "projects/fishing-harbor.svg"
    };

    // Get all projects
    const allProjects = await db.query.projects.findMany();

    // Update each project with its corresponding image
    for (const project of allProjects) {
      const imagePath = projectImageMap[project.name];
      if (imagePath && project.id) {
        await db.update(projects)
          .set({ imageUrl: imagePath })
          .where(eq(projects.id, project.id));
        console.log(`✅ Atualizada imagem do projeto: ${project.name}`);
      }
    }

    console.log("🎉 Todas as imagens foram atualizadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar imagens:", error);
  } finally {
    process.exit(0);
  }
}

updateProjectImages();