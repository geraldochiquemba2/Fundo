import { storage } from './storage';
import { log } from './vite';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

interface ConversationContext {
  userId: string;
  userType: 'company' | 'public';
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  lastActivity: Date;
}

class WhatsAppAssistant {
  private conversations = new Map<string, ConversationContext>();
  private perplexityApiKey = process.env.PERPLEXITY_API_KEY;

  constructor() {
    // Clean up old conversations every hour
    setInterval(() => {
      this.cleanupOldConversations();
    }, 3600000); // 1 hour
  }

  private cleanupOldConversations() {
    const oneHourAgo = new Date(Date.now() - 3600000);
    for (const [userId, context] of this.conversations) {
      if (context.lastActivity < oneHourAgo) {
        this.conversations.delete(userId);
      }
    }
  }

  private getOrCreateContext(userId: string, userType: 'company' | 'public' = 'public'): ConversationContext {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, {
        userId,
        userType,
        conversationHistory: [],
        lastActivity: new Date()
      });
    }
    
    const context = this.conversations.get(userId)!;
    context.lastActivity = new Date();
    return context;
  }

  private async callPerplexityAPI(prompt: string): Promise<string> {
    if (!this.perplexityApiKey) {
      return "Desculpe, não consigo acessar informações externas no momento. Posso ajudar com informações básicas sobre nossos projetos e ODS.";
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em sustentabilidade, ODS (Objetivos de Desenvolvimento Sustentável) e projetos ambientais. Responda de forma clara, concisa e educativa. Use dados atuais quando disponível.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.2,
          search_recency_filter: 'month'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: PerplexityResponse = await response.json();
      return data.choices[0]?.message?.content || "Não consegui obter uma resposta no momento.";
    } catch (error) {
      log(`Erro na API Perplexity: ${error}`);
      return "Desculpe, houve um problema ao buscar informações atualizadas. Posso ajudar com informações sobre nossos projetos locais.";
    }
  }

  private async getLocalProjectInfo(): Promise<string> {
    try {
      const projects = await storage.getAllProjects();
      const activeProjects = projects.filter(p => p.status === 'active').slice(0, 3);
      
      if (activeProjects.length === 0) {
        return "Atualmente não temos projetos ativos na plataforma.";
      }

      let response = "🌱 Nossos projetos ativos:\n\n";
      
      for (const project of activeProjects) {
        response += `📋 *${project.name}*\n`;
        response += `🎯 ODS: ${project.sdg_name}\n`;
        if (project.budget) {
          response += `💰 Orçamento: $${Number(project.budget).toLocaleString()}\n`;
        }
        response += `📊 Status: ${project.status}\n\n`;
      }

      return response + "Para mais detalhes, visite nossa plataforma!";
    } catch (error) {
      return "Não consegui buscar informações dos projetos no momento.";
    }
  }

  private async getCompanyStats(companyName?: string): Promise<string> {
    try {
      if (!companyName) {
        const stats = await storage.getAdminDashboardStats();
        return `📊 *Estatísticas da Plataforma*\n\n` +
               `🏢 Empresas cadastradas: ${stats.companiesCount}\n` +
               `📈 Emissões totais: ${stats.totalCarbonEmissions} toneladas CO₂\n` +
               `💰 Investimentos: $${Number(stats.totalInvestments || 0).toLocaleString()}\n\n` +
               `Para participar, cadastre sua empresa em nossa plataforma!`;
      }

      // Search for specific company
      const companies = await storage.getAllCompanies();
      const company = companies.find(c => 
        c.name.toLowerCase().includes(companyName.toLowerCase())
      );

      if (!company) {
        return `Não encontrei a empresa "${companyName}" em nossa plataforma. Gostaria que eu liste as empresas participantes?`;
      }

      const companyStats = await storage.getCompanyCarbonStats(company.id);
      return `🏢 *${company.name}*\n\n` +
             `📈 Emissões: ${companyStats?.totalEmissions || 0} toneladas CO₂\n` +
             `🏆 Ranking: #${companyStats?.ranking || 'N/A'}\n` +
             `📊 Status: ${company.status || 'Ativo'}\n\n` +
             `Parabéns por participar da sustentabilidade!`;
    } catch (error) {
      return "Não consegui buscar estatísticas no momento.";
    }
  }

  private detectMessageIntent(message: string): {
    intent: 'greeting' | 'project_info' | 'company_info' | 'sdg_info' | 'sustainability_question' | 'help' | 'unknown';
    entities?: string[];
  } {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (/^(oi|olá|ola|hey|hi|hello|bom dia|boa tarde|boa noite)/.test(lowerMessage)) {
      return { intent: 'greeting' };
    }

    // Project information
    if (/projeto|project|iniciativa|ação ambiental/.test(lowerMessage)) {
      return { intent: 'project_info' };
    }

    // Company information
    if (/empresa|company|corporação|organização|minha empresa/.test(lowerMessage)) {
      const companyMatch = lowerMessage.match(/empresa\s+([a-zA-Z\s]+)/);
      return { 
        intent: 'company_info',
        entities: companyMatch ? [companyMatch[1].trim()] : []
      };
    }

    // SDG information
    if (/ods|sdg|objetivo|sustentável|desenvolvimento/.test(lowerMessage)) {
      return { intent: 'sdg_info' };
    }

    // Sustainability questions
    if (/sustentabilidade|meio ambiente|carbono|emissão|co2|verde|ecologia|renovável/.test(lowerMessage)) {
      return { intent: 'sustainability_question' };
    }

    // Help
    if (/ajuda|help|como|what|o que|pode fazer/.test(lowerMessage)) {
      return { intent: 'help' };
    }

    return { intent: 'unknown' };
  }

  async processMessage(userId: string, message: string, userType: 'company' | 'public' = 'public'): Promise<string> {
    const context = this.getOrCreateContext(userId, userType);
    const { intent, entities } = this.detectMessageIntent(message);

    // Add user message to history
    context.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    let response: string;

    switch (intent) {
      case 'greeting':
        response = userType === 'company' 
          ? "👋 Olá! Sou o assistente da plataforma de sustentabilidade. Como posso ajudar sua empresa hoje? Posso fornecer informações sobre projetos, ODS, emissões de carbono ou estatísticas da plataforma."
          : "👋 Olá! Bem-vindo à nossa plataforma de sustentabilidade! Posso ajudar com informações sobre projetos ambientais, ODS, sustentabilidade em geral. Como posso ajudar?";
        break;

      case 'project_info':
        response = await this.getLocalProjectInfo();
        break;

      case 'company_info':
        const companyName = entities && entities.length > 0 ? entities[0] : undefined;
        response = await this.getCompanyStats(companyName);
        break;

      case 'sdg_info':
        response = await this.callPerplexityAPI(`Explique os Objetivos de Desenvolvimento Sustentável (ODS) da ONU de forma resumida e como empresas podem contribuir.`);
        break;

      case 'sustainability_question':
        response = await this.callPerplexityAPI(`Como especialista em sustentabilidade, responda: ${message}`);
        break;

      case 'help':
        response = "🤖 *Como posso ajudar:*\n\n" +
                  "📋 Informações sobre projetos ambientais\n" +
                  "🏢 Estatísticas de empresas\n" +
                  "🎯 Explicações sobre ODS\n" +
                  "🌱 Perguntas sobre sustentabilidade\n" +
                  "📊 Dados de emissões de carbono\n\n" +
                  "Basta me enviar sua pergunta que respondo na hora!";
        break;

      default:
        // For unknown intents, try Perplexity if it seems sustainability-related
        if (/sustentabilidade|ambiente|verde|eco|carbono|clima|energia|água|ods|sdg/.test(message.toLowerCase())) {
          response = await this.callPerplexityAPI(`Como especialista em sustentabilidade e meio ambiente, responda: ${message}`);
        } else {
          response = "Desculpe, não entendi sua pergunta. Sou especializado em sustentabilidade, projetos ambientais e ODS. Como posso ajudar nestes temas?";
        }
    }

    // Add assistant response to history
    context.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    // Keep only last 10 messages to manage memory
    if (context.conversationHistory.length > 10) {
      context.conversationHistory = context.conversationHistory.slice(-10);
    }

    return response;
  }

  // Get conversation statistics
  getStats() {
    return {
      activeConversations: this.conversations.size,
      totalUsers: this.conversations.size,
      companyUsers: Array.from(this.conversations.values()).filter(c => c.userType === 'company').length,
      publicUsers: Array.from(this.conversations.values()).filter(c => c.userType === 'public').length
    };
  }

  // Get conversation history for a user
  getConversationHistory(userId: string) {
    return this.conversations.get(userId)?.conversationHistory || [];
  }
}

export const whatsappAssistant = new WhatsAppAssistant();