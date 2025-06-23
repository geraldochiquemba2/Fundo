import qrcode from 'qrcode-terminal';
import cron from 'node-cron';
import { storage } from './storage';
import { log } from './vite';

// Import WhatsApp Web.js dynamically to handle module compatibility
let Client: any;
let LocalAuth: any;
let MessageMedia: any;

async function loadWhatsAppDeps() {
  try {
    const whatsappModule = await import('whatsapp-web.js');
    Client = whatsappModule.Client;
    LocalAuth = whatsappModule.LocalAuth;
    MessageMedia = whatsappModule.MessageMedia;
    return true;
  } catch (error) {
    log(`❌ Erro ao carregar WhatsApp Web.js: ${error}`);
    return false;
  }
}

interface WhatsAppGroup {
  id: string;
  name: string;
  active: boolean;
  projectIds?: number[];
  sdgIds?: number[];
}

class WhatsAppService {
  private client: Client | null = null;
  private isReady = false;
  private groups: WhatsAppGroup[] = [];
  private qrCodeGenerated = false;

  constructor() {
    // Defer initialization until WhatsApp dependencies are loaded
  }

  private async initializeClient() {
    const depsLoaded = await loadWhatsAppDeps();
    if (!depsLoaded) {
      log('❌ WhatsApp Web.js não disponível. Funcionalidade desabilitada.');
      return false;
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "sustainability-platform"
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
    return true;
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('qr', (qr) => {
      if (!this.qrCodeGenerated) {
        log('📱 Escaneie o QR Code abaixo com o WhatsApp para conectar:');
        qrcode.generate(qr, { small: true });
        this.qrCodeGenerated = true;
      }
    });

    this.client.on('ready', () => {
      log('✅ WhatsApp conectado com sucesso!');
      this.isReady = true;
      this.loadGroups();
      this.startCronJobs();
    });

    this.client.on('authenticated', () => {
      log('🔐 WhatsApp autenticado');
    });

    this.client.on('auth_failure', () => {
      log('❌ Falha na autenticação do WhatsApp');
    });

    this.client.on('disconnected', () => {
      log('📱 WhatsApp desconectado');
      this.isReady = false;
    });
  }

  async initialize() {
    try {
      const clientInitialized = await this.initializeClient();
      if (!clientInitialized || !this.client) {
        return false;
      }
      
      await this.client.initialize();
      return true;
    } catch (error) {
      log(`❌ Erro ao inicializar WhatsApp: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    }
  }

  private async loadGroups() {
    if (!this.client || !this.isReady) return;

    try {
      const chats = await this.client.getChats();
      const groups = chats.filter(chat => chat.isGroup);
      
      log(`📋 Encontrados ${groups.length} grupos do WhatsApp`);
      
      // Salvar grupos encontrados
      this.groups = groups.map(group => ({
        id: group.id._serialized,
        name: group.name,
        active: false // Por padrão, grupos não são ativos até serem configurados
      }));
      
    } catch (error) {
      log(`❌ Erro ao carregar grupos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getAvailableGroups() {
    return this.groups;
  }

  async configureGroup(groupId: string, projectIds?: number[], sdgIds?: number[]) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    group.active = true;
    group.projectIds = projectIds;
    group.sdgIds = sdgIds;

    log(`✅ Grupo "${group.name}" configurado para receber notificações`);
    return group;
  }

  async sendProjectUpdate(projectId: number, updateMessage: string) {
    if (!this.client || !this.isReady) return;

    const activeGroups = this.groups.filter(g => 
      g.active && 
      (!g.projectIds || g.projectIds.includes(projectId))
    );

    for (const group of activeGroups) {
      try {
        const project = await storage.getProjectById(projectId);
        if (!project) continue;

        const message = `
🌱 *Atualização de Projeto*

📋 *Projeto:* ${project.name}
🎯 *ODS:* ${project.sdg_name}
💰 *Orçamento:* ${project.budget ? `$${Number(project.budget).toLocaleString()}` : 'Não informado'}

📢 *Atualização:*
${updateMessage}

🌍 _Plataforma de Sustentabilidade_
        `.trim();

        await this.client.sendMessage(group.id, message);
        log(`📤 Mensagem enviada para grupo: ${group.name}`);
        
      } catch (error) {
        log(`❌ Erro ao enviar mensagem para ${group.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  }

  async sendWeeklyReport() {
    if (!this.client || !this.isReady) return;

    try {
      const stats = await storage.getAdminDashboardStats();
      const projects = await storage.getAllProjects();
      const activeProjects = projects.filter(p => p.status === 'active');

      const message = `
📊 *Relatório Semanal de Sustentabilidade*

🏢 *Empresas Cadastradas:* ${stats.companiesCount}
🌱 *Projetos Ativos:* ${activeProjects.length}
📈 *Emissões Totais:* ${stats.totalCarbonEmissions} toneladas CO₂
💰 *Investimentos:* $${Number(stats.totalInvestments || 0).toLocaleString()}

🎯 *Projetos em Destaque:*
${activeProjects.slice(0, 3).map(p => `• ${p.name} (${p.sdg_name})`).join('\n')}

🌍 _Relatório gerado automaticamente_
      `.trim();

      const activeGroups = this.groups.filter(g => g.active);
      
      for (const group of activeGroups) {
        await this.client.sendMessage(group.id, message);
        log(`📤 Relatório semanal enviado para: ${group.name}`);
      }

    } catch (error) {
      log(`❌ Erro ao enviar relatório semanal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async sendCarbonAlert(companyId: number, currentEmissions: number, threshold: number) {
    if (!this.client || !this.isReady) return;

    try {
      const company = await storage.getCompanyById(companyId);
      if (!company) return;

      const message = `
🚨 *Alerta de Emissões*

🏢 *Empresa:* ${company.name}
📊 *Emissões Atuais:* ${currentEmissions} toneladas CO₂
⚠️ *Limite:* ${threshold} toneladas CO₂

💡 *Recomendação:* Considere investir em projetos de compensação de carbono ou implementar medidas de redução.

🌱 _Sistema de Monitoramento Ambiental_
      `.trim();

      const activeGroups = this.groups.filter(g => g.active);
      
      for (const group of activeGroups) {
        await this.client.sendMessage(group.id, message);
        log(`📤 Alerta de carbono enviado para: ${group.name}`);
      }

    } catch (error) {
      log(`❌ Erro ao enviar alerta de carbono: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private startCronJobs() {
    // Relatório semanal toda segunda-feira às 9h
    cron.schedule('0 9 * * 1', () => {
      log('📅 Executando relatório semanal automático');
      this.sendWeeklyReport();
    });

    // Verificação de emissões diariamente às 18h
    cron.schedule('0 18 * * *', async () => {
      log('📅 Verificando emissões diárias');
      try {
        const companies = await storage.getAllCompanies();
        for (const company of companies) {
          const stats = await storage.getCompanyCarbonStats(company.id);
          if (stats && stats.totalEmissions > 1000) { // Threshold de 1000 toneladas
            await this.sendCarbonAlert(company.id, stats.totalEmissions, 1000);
          }
        }
      } catch (error) {
        log(`❌ Erro na verificação diária: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    });
  }

  isConnected() {
    return this.isReady;
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      log('📱 WhatsApp desconectado');
    }
  }
}

export const whatsappService = new WhatsAppService();