// Dados estáticos de fallback quando o banco não está disponível
export const fallbackData = {
  sdgs: [
    { id: 1, number: 1, name: "Erradicação da Pobreza", color: "#E5243B", icon: "🎯" },
    { id: 2, number: 2, name: "Fome Zero", color: "#DDA63A", icon: "🌾" },
    { id: 3, number: 3, name: "Boa Saúde e Bem-Estar", color: "#4C9F38", icon: "🏥" },
    { id: 4, number: 4, name: "Educação de Qualidade", color: "#C5192D", icon: "📚" },
    { id: 5, number: 5, name: "Igualdade de Gênero", color: "#FF3A21", icon: "⚖️" },
    { id: 6, number: 6, name: "Água Potável e Saneamento", color: "#26BDE2", icon: "💧" },
    { id: 7, number: 7, name: "Energia Limpa e Acessível", color: "#FCC30B", icon: "⚡" },
    { id: 8, number: 8, name: "Trabalho Decente e Crescimento Econômico", color: "#A21942", icon: "💼" },
    { id: 9, number: 9, name: "Indústria, Inovação e Infraestrutura", color: "#FD6925", icon: "🏭" },
    { id: 10, number: 10, name: "Redução das Desigualdades", color: "#DD1367", icon: "🤝" },
    { id: 11, number: 11, name: "Cidades e Comunidades Sustentáveis", color: "#FD9D24", icon: "🏙️" },
    { id: 12, number: 12, name: "Consumo e Produção Responsáveis", color: "#BF8B2E", icon: "♻️" },
    { id: 13, number: 13, name: "Ação Contra a Mudança Global do Clima", color: "#3F7E44", icon: "🌍" },
    { id: 14, number: 14, name: "Vida na Água", color: "#0A97D9", icon: "🐟" },
    { id: 15, number: 15, name: "Vida Terrestre", color: "#56C02B", icon: "🌳" },
    { id: 16, number: 16, name: "Paz, Justiça e Instituições Eficazes", color: "#00689D", icon: "⚖️" },
    { id: 17, number: 17, name: "Parcerias e Meios de Implementação", color: "#19486A", icon: "🤝" }
  ],
  projects: [
    {
      id: 1,
      name: "Painéis Solares em Comunidades Rurais",
      description: "Instalação de sistemas de energia solar em comunidades rurais sem acesso à eletricidade",
      imageUrl: "/uploads/projects/solar-panels.jpg",
      sdgId: 7,
      sdg_name: "Energia Limpa e Acessível",
      status: "active",
      budget: "250000"
    },
    {
      id: 2,
      name: "Sistemas de Purificação de Água",
      description: "Implementação de sistemas de purificação de água em regiões com escassez de água potável",
      imageUrl: "/uploads/projects/water-purification.jpg",
      sdgId: 6,
      sdg_name: "Água Potável e Saneamento",
      status: "active",
      budget: "180000"
    },
    {
      id: 3,
      name: "Programa de Reflorestamento Urbano",
      description: "Plantio de árvores nativas em áreas urbanas para melhorar a qualidade do ar",
      imageUrl: "/uploads/projects/reforestation.jpg",
      sdgId: 15,
      sdg_name: "Vida Terrestre",
      status: "active",
      budget: "120000"
    }
  ],
  companies: [],
  stats: {
    companiesCount: "11",
    totalCarbonEmissions: "45,678",
    totalInvestments: "2,345,000"
  }
};