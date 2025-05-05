import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { mkdir } from "fs/promises";
import { consumptionRecordInsertSchema, paymentProofInsertSchema, projectInsertSchema, projectUpdateInsertSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadsDir = path.resolve(process.cwd(), "uploads");

// Create uploads directory if it doesn't exist
(async () => {
  try {
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(path.join(uploadsDir, "logos"), { recursive: true });
    await mkdir(path.join(uploadsDir, "proofs"), { recursive: true });
    await mkdir(path.join(uploadsDir, "projects"), { recursive: true });
  } catch (error) {
    console.error("Error creating upload directories:", error);
  }
})();

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads";
    
    if (req.path.includes("/company/logo")) {
      folder = path.join(uploadsDir, "logos");
    } else if (req.path.includes("/payment-proof")) {
      folder = path.join(uploadsDir, "proofs");
    } else if (req.path.includes("/project")) {
      folder = path.join(uploadsDir, "projects");
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage_config });

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Não autorizado" });
}

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Acesso negado" });
}

// Middleware to check if user is company
function isCompany(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && req.user?.role === 'company') {
    return next();
  }
  res.status(403).json({ message: "Acesso negado" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Only serve files to authenticated users
    if (req.isAuthenticated()) {
      return next();
    }
    // Allow public access to project images
    if (req.path.startsWith("/projects/")) {
      return next();
    }
    res.status(401).json({ message: "Não autorizado" });
  }, express.static(uploadsDir));

  // Public routes

  // Get all SDGs
  app.get("/api/sdgs", async (req, res) => {
    try {
      const sdgs = await storage.getAllSdgs();
      res.json(sdgs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ODSs" });
    }
  });

  // Get SDG by ID
  app.get("/api/sdgs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const sdg = await storage.getSdgById(id);
      if (!sdg) {
        return res.status(404).json({ message: "ODS não encontrado" });
      }
      
      res.json(sdg);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ODS" });
    }
  });

  // Get SDG by number
  app.get("/api/sdgs/number/:number", async (req, res) => {
    try {
      const number = parseInt(req.params.number);
      if (isNaN(number)) {
        return res.status(400).json({ message: "Número inválido" });
      }
      
      const sdg = await storage.getSdgByNumber(number);
      if (!sdg) {
        return res.status(404).json({ message: "ODS não encontrado" });
      }
      
      res.json(sdg);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ODS" });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projetos" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const project = await storage.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projeto" });
    }
  });

  // Get projects by SDG ID
  app.get("/api/projects/sdg/:sdgId", async (req, res) => {
    try {
      const sdgId = parseInt(req.params.sdgId);
      if (isNaN(sdgId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const projects = await storage.getProjectsBySDG(sdgId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projetos" });
    }
  });

  // Company routes

  // Update company profile
  app.put("/api/company/profile", isCompany, async (req, res) => {
    try {
      const { name, sector } = req.body;
      
      if (!name || !sector) {
        return res.status(400).json({ message: "Nome e setor são obrigatórios" });
      }
      
      const updated = await storage.updateCompany(req.user.company.id, {
        name,
        sector
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  // Upload company logo
  app.post("/api/company/logo", isCompany, upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      
      const logoUrl = `/uploads/logos/${req.file.filename}`;
      
      const updated = await storage.updateCompany(req.user.company.id, {
        logoUrl
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }
      
      res.json({ logoUrl });
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer upload do logo" });
    }
  });

  // Create consumption record
  app.post("/api/company/consumption", isCompany, async (req, res) => {
    try {
      // Log the request data for debugging
      console.log('Consumo recebido:', req.body);
      
      // Handle null values for fields
      const dataWithDefaults = {
        ...req.body,
        month: req.body.month || "",
        day: req.body.day || null,
        year: req.body.year || new Date().getFullYear(),
      };
      
      const validationResult = consumptionRecordInsertSchema.safeParse(dataWithDefaults);
      
      if (!validationResult.success) {
        console.log('Erro de validação:', validationResult.error.format());
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.format() 
        });
      }
      
      // Make sure companyId matches the authenticated user
      const data = {
        ...validationResult.data,
        companyId: req.user!.company.id
      };
      
      const record = await storage.createConsumptionRecord(data);
      res.status(201).json(record);
    } catch (error) {
      console.error('Erro ao criar registro de consumo:', error);
      res.status(500).json({ message: "Erro ao criar registro de consumo" });
    }
  });

  // Get consumption records for company
  app.get("/api/company/consumption", isCompany, async (req, res) => {
    try {
      const records = await storage.getConsumptionRecordsForCompany(req.user!.company.id);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar registros de consumo" });
    }
  });

  // Upload payment proof
  app.post("/api/company/payment-proof", isCompany, upload.single("proof"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      
      const fileUrl = `/uploads/proofs/${req.file.filename}`;
      const { amount, consumptionRecordId, sdgId } = req.body;
      
      // Validate amount
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valor inválido" });
      }
      
      // Create payment proof
      const proof = await storage.createPaymentProof({
        companyId: req.user.company.id,
        fileUrl,
        amount: parseFloat(amount),
        consumptionRecordId: consumptionRecordId ? parseInt(consumptionRecordId) : undefined,
        sdgId: sdgId ? parseInt(sdgId) : undefined,
        status: 'pending'
      });
      
      res.status(201).json(proof);
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer upload do comprovativo" });
    }
  });

  // Get payment proofs for company
  app.get("/api/company/payment-proofs", isCompany, async (req, res) => {
    try {
      const proofs = await storage.getPaymentProofsForCompany(req.user.company.id);
      res.json(proofs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comprovativos" });
    }
  });

  // Get company statistics
  app.get("/api/company/stats", isCompany, async (req, res) => {
    try {
      const stats = await storage.getCompanyStats(req.user.company.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Get investments for company
  app.get("/api/company/investments", isCompany, async (req, res) => {
    try {
      const investments = await storage.getInvestmentsForCompany(req.user.company.id);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar investimentos" });
    }
  });

  // Admin routes

  // Get all companies
  app.get("/api/admin/companies", isAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar empresas" });
    }
  });
  
  // Get company by ID with detailed stats
  app.get("/api/admin/companies/:id", isAdmin, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const company = await storage.getCompanyById(companyId);
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }
      
      // Get additional data for this company
      const stats = await storage.getCompanyStats(companyId);
      const paymentProofs = await storage.getPaymentProofsForCompany(companyId);
      const investments = await storage.getInvestmentsForCompany(companyId);
      
      res.json({
        ...company,
        stats,
        paymentProofs,
        investments
      });
    } catch (error) {
      console.error("Error getting company details:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes da empresa" });
    }
  });

  // Get admin dashboard statistics
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Get pending payment proofs
  app.get("/api/admin/payment-proofs/pending", isAdmin, async (req, res) => {
    try {
      const proofs = await storage.getPendingPaymentProofs();
      res.json(proofs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comprovativos pendentes" });
    }
  });

  // Update payment proof status
  app.put("/api/admin/payment-proofs/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const { status } = req.body;
      if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const updated = await storage.updatePaymentProofStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Comprovativo não encontrado" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status" });
    }
  });

  // Get payment proofs without SDG
  app.get("/api/admin/payment-proofs/without-sdg", isAdmin, async (req, res) => {
    try {
      const proofs = await storage.getPaymentProofsWithoutSdg();
      res.json(proofs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comprovativos sem ODS" });
    }
  });

  // Assign SDG to payment proof
  app.put("/api/admin/payment-proofs/:id/sdg", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const { sdgId } = req.body;
      if (!sdgId || isNaN(parseInt(sdgId))) {
        return res.status(400).json({ message: "ID de ODS inválido" });
      }
      
      const updated = await storage.assignSdgToPaymentProof(id, parseInt(sdgId));
      if (!updated) {
        return res.status(404).json({ message: "Comprovativo não encontrado" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atribuir ODS" });
    }
  });

  // Create a project
  app.post("/api/admin/projects", isAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Imagem do projeto é obrigatória" });
      }
      
      const imageUrl = `/uploads/projects/${req.file.filename}`;
      
      const projectData = {
        name: req.body.name,
        description: req.body.description,
        sdgId: parseInt(req.body.sdgId),
        imageUrl,
        totalInvested: req.body.totalInvested || '0'
      };
      
      // Validate project data
      const validationResult = projectInsertSchema.safeParse(projectData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.format() 
        });
      }
      
      const project = await storage.createProject(validationResult.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar projeto" });
    }
  });

  // Update a project
  app.put("/api/admin/projects/:id", isAdmin, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const projectData: any = {
        name: req.body.name,
        description: req.body.description,
        sdgId: parseInt(req.body.sdgId)
      };
      
      if (req.file) {
        projectData.imageUrl = `/uploads/projects/${req.file.filename}`;
      }
      
      const updated = await storage.updateProject(id, projectData);
      if (!updated) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar projeto" });
    }
  });

  // Add a project update
  app.post("/api/admin/projects/:id/updates", isAdmin, upload.array("media"), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: "Título e conteúdo são obrigatórios" });
      }
      
      // Process uploaded files
      const mediaUrls = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const fileUrl = `/uploads/projects/${file.filename}`;
          mediaUrls.push(fileUrl);
        }
      }
      
      const updateData = {
        projectId,
        title,
        content,
        mediaUrls
      };
      
      const update = await storage.addProjectUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error adding project update:", error);
      res.status(500).json({ message: "Erro ao adicionar atualização" });
    }
  });

  // Create an investment
  app.post("/api/admin/investments", isAdmin, async (req, res) => {
    try {
      const { companyId, projectId, paymentProofId, amount } = req.body;
      
      if (!companyId || !projectId || !paymentProofId || !amount) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }
      
      const investment = await storage.createInvestment({
        companyId: parseInt(companyId),
        projectId: parseInt(projectId),
        paymentProofId: parseInt(paymentProofId),
        amount: parseFloat(amount)
      });
      
      res.status(201).json(investment);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar investimento" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
