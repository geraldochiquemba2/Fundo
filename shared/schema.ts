import { pgTable, text, serial, integer, timestamp, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Define user roles
export const userRoles = {
  ADMIN: 'admin',
  COMPANY: 'company',
} as const;

// Users table (for both admin and companies)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: [userRoles.ADMIN, userRoles.COMPANY] }).notNull().default(userRoles.COMPANY),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Company profiles
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  name: text('name').notNull(),
  sector: text('sector').notNull(),
  logoUrl: text('logo_url'),
  phone: text('phone'),
  location: text('location'),
  employeeCount: integer('employee_count'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sustainable Development Goals
export const sdgs = pgTable('sdgs', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Projects linked to SDGs
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sdgId: integer('sdg_id').references(() => sdgs.id).notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  totalInvested: decimal('total_invested', { precision: 12, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project updates and media
export const projectUpdates = pgTable('project_updates', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  mediaUrls: jsonb('media_urls').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Consumption records for companies
export const consumptionRecords = pgTable('consumption_records', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  energyKwh: decimal('energy_kwh', { precision: 10, scale: 2 }).default('0'),
  fuelLiters: decimal('fuel_liters', { precision: 10, scale: 2 }).default('0'),
  fuelType: text('fuel_type'),
  transportKm: decimal('transport_km', { precision: 10, scale: 2 }).default('0'),
  transportType: text('transport_type'),
  waterM3: decimal('water_m3', { precision: 10, scale: 2 }).default('0'), // Consumo de água em metros cúbicos
  emissionKgCo2: decimal('emission_kg_co2', { precision: 10, scale: 2 }).notNull(),
  compensationValueKz: decimal('compensation_value_kz', { precision: 12, scale: 2 }).notNull(),
  period: text('period').notNull(), // monthly, quarterly, yearly
  month: text('month'), // mês do consumo (01-12)
  day: integer('day'), // dia do consumo (opcional)
  year: integer('year'), // ano do consumo
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payment proofs for consumption compensations
export const paymentProofs = pgTable('payment_proofs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  consumptionRecordId: integer('consumption_record_id').references(() => consumptionRecords.id),
  fileUrl: text('file_url').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  sdgId: integer('sdg_id').references(() => sdgs.id),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Investments in projects
export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  paymentProofId: integer('payment_proof_id').references(() => paymentProofs.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela específica para armazenar o valor de exibição na página de publicações
export const displayInvestments = pgTable('display_investments', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull().unique(),
  displayAmount: decimal('display_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relações para displayInvestments
export const displayInvestmentsRelations = relations(displayInvestments, ({ one }) => ({
  project: one(projects, {
    fields: [displayInvestments.projectId],
    references: [projects.id],
  }),
}));

// Define relations
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  consumptionRecords: many(consumptionRecords),
  paymentProofs: many(paymentProofs),
  investments: many(investments),
}));

export const sdgsRelations = relations(sdgs, ({ many }) => ({
  projects: many(projects),
  paymentProofs: many(paymentProofs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  sdg: one(sdgs, {
    fields: [projects.sdgId],
    references: [sdgs.id],
  }),
  updates: many(projectUpdates),
  investments: many(investments),
  displayInvestment: one(displayInvestments, {
    fields: [projects.id],
    references: [displayInvestments.projectId],
  }),
}));

export const projectUpdatesRelations = relations(projectUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [projectUpdates.projectId],
    references: [projects.id],
  }),
}));

export const consumptionRecordsRelations = relations(consumptionRecords, ({ one, many }) => ({
  company: one(companies, {
    fields: [consumptionRecords.companyId],
    references: [companies.id],
  }),
  paymentProofs: many(paymentProofs),
}));

export const paymentProofsRelations = relations(paymentProofs, ({ one, many }) => ({
  company: one(companies, {
    fields: [paymentProofs.companyId],
    references: [companies.id],
  }),
  consumptionRecord: one(consumptionRecords, {
    fields: [paymentProofs.consumptionRecordId],
    references: [consumptionRecords.id],
  }),
  sdg: one(sdgs, {
    fields: [paymentProofs.sdgId],
    references: [sdgs.id],
  }),
  investments: many(investments),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  company: one(companies, {
    fields: [investments.companyId],
    references: [companies.id],
  }),
  project: one(projects, {
    fields: [investments.projectId],
    references: [projects.id],
  }),
  paymentProof: one(paymentProofs, {
    fields: [investments.paymentProofId],
    references: [paymentProofs.id],
  }),
}));

// Create Zod schemas
export const userInsertSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Deve fornecer um email válido"),
  password: (schema) => schema.min(8, "A senha deve ter pelo menos 8 caracteres"),
  role: (schema) => schema.refine(
    (val) => Object.values(userRoles).includes(val as any),
    { message: "Função de usuário inválida" }
  ),
});

export const companyInsertSchema = createInsertSchema(companies, {
  name: (schema) => schema.min(2, "O nome deve ter pelo menos 2 caracteres"),
  sector: (schema) => schema.min(2, "O setor deve ter pelo menos 2 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Deve fornecer um email válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const registerSchema = z.object({
  email: z.string().email("Deve fornecer um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  sector: z.string().min(2, "O setor deve ter pelo menos 2 caracteres"),
  logoUrl: z.string().optional(),
});

export const sdgInsertSchema = createInsertSchema(sdgs);

// Schema personalizado para projetos com tratamento para totalInvested
export const projectInsertSchema = createInsertSchema(projects, {
  totalInvested: (schema) => schema.or(z.string().transform(val => parseFloat(val)))
});

export const projectUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  sdgId: z.number().optional(),
  imageUrl: z.string().optional(),
  totalInvested: z.union([
    z.number(),
    z.string().transform(val => {
      const number = parseFloat(val);
      return isNaN(number) ? 0 : number;
    })
  ]).optional(),
});

export const projectUpdateInsertSchema = createInsertSchema(projectUpdates);

// Criar um esquema de inserção personalizado para consumptionRecords que aceite números
export const consumptionRecordInsertSchema = z.object({
  id: z.number().optional(),
  companyId: z.number(),
  energyKwh: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : val.toString()
  ).default('0'),
  fuelLiters: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : val.toString()
  ).default('0'),
  fuelType: z.string().optional(),
  transportKm: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : val.toString()
  ).default('0'),
  transportType: z.string().optional(),
  waterM3: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : val.toString()
  ).default('0'),
  emissionKgCo2: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : val.toString()
  ),
  compensationValueKz: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : val.toString()
  ),
  period: z.string(),
  month: z.string().optional().default(""),
  day: z.union([z.string(), z.number(), z.null()]).transform(val => 
    val === null ? null : typeof val === 'string' ? parseInt(val) : val
  ).nullable().optional(),
  year: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? parseInt(val) : val
  ).optional(),
  createdAt: z.date().optional()
});

export const paymentProofInsertSchema = createInsertSchema(paymentProofs);
export const investmentInsertSchema = createInsertSchema(investments);
export const displayInvestmentInsertSchema = createInsertSchema(displayInvestments, {
  displayAmount: (schema) => schema.or(z.string().transform(val => parseFloat(val)))
});

// Create select schemas for type safety
export const userSelectSchema = createSelectSchema(users);
export const companySelectSchema = createSelectSchema(companies);
export const sdgSelectSchema = createSelectSchema(sdgs);
export const projectSelectSchema = createSelectSchema(projects);
export const projectUpdateSelectSchema = createSelectSchema(projectUpdates);
export const consumptionRecordSelectSchema = createSelectSchema(consumptionRecords);
export const paymentProofSelectSchema = createSelectSchema(paymentProofs);
export const investmentSelectSchema = createSelectSchema(investments);
export const displayInvestmentSelectSchema = createSelectSchema(displayInvestments);

// Export types
export type User = z.infer<typeof userSelectSchema>;
export type Company = z.infer<typeof companySelectSchema>;
export type Sdg = z.infer<typeof sdgSelectSchema>;
export type Project = z.infer<typeof projectSelectSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSelectSchema>;
export type ConsumptionRecord = z.infer<typeof consumptionRecordSelectSchema>;
export type PaymentProof = z.infer<typeof paymentProofSelectSchema>;
export type Investment = z.infer<typeof investmentSelectSchema>;

export type InsertUser = z.infer<typeof userInsertSchema>;
export type InsertCompany = z.infer<typeof companyInsertSchema>;
export type InsertSdg = z.infer<typeof sdgInsertSchema>;
export type InsertProject = z.infer<typeof projectInsertSchema>;
export type InsertProjectUpdate = z.infer<typeof projectUpdateInsertSchema>;
export type InsertConsumptionRecord = z.infer<typeof consumptionRecordInsertSchema>;
export type InsertPaymentProof = z.infer<typeof paymentProofInsertSchema>;
export type InsertInvestment = z.infer<typeof investmentInsertSchema>;

export type UserWithCompany = User & { company: Company };
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
