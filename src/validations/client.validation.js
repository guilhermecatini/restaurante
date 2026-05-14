'use strict';

/**
 * Schemas de validação Zod para o módulo de clientes.
 */

const { z } = require('zod');

// --------------------------------------------------------------------------
// Schema de Stakeholder (reutilizado em criação e atualização)
// --------------------------------------------------------------------------
const StakeholderSchema = z.object({
  name: z.string({ required_error: 'Nome do stakeholder é obrigatório.' }).min(2).max(255).trim(),
  role: z.string({ required_error: 'Cargo do stakeholder é obrigatório.' }).min(2).max(100).trim(),
  email: z.string().email('E-mail do stakeholder inválido.').toLowerCase().trim(),
});

// --------------------------------------------------------------------------
// POST /api/clients — Criação de cliente
// --------------------------------------------------------------------------
const CreateClientSchema = z.object({
  companyName: z
    .string({ required_error: 'Razão social é obrigatória.' })
    .min(2, 'Razão social deve ter pelo menos 2 caracteres.')
    .max(255)
    .trim(),

  tradeName: z.string().max(255).trim().optional(),

  taxId: z
    .string()
    .max(30, 'CNPJ/tax ID pode ter no máximo 30 caracteres.')
    .trim()
    .optional(),

  companySize: z
    .enum(['micro', 'small', 'medium', 'large', 'enterprise'], {
      errorMap: () => ({ message: 'Porte inválido. Use: micro, small, medium, large ou enterprise.' }),
    })
    .optional(),

  industrySector: z.string().max(100).trim().optional(),
  marketSegment: z.string().max(100).trim().optional(),
  website: z.string().url('URL do site inválida.').max(255).optional(),

  // Endereço
  address: z.string().max(500).trim().optional(),
  city: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  country: z.string().max(100).trim().default('Brasil'),
  zipCode: z.string().max(20).trim().optional(),

  // Contato de negócio
  businessContactName: z.string().max(255).trim().optional(),
  businessContactEmail: z.string().email('E-mail do contato de negócio inválido.').toLowerCase().trim().optional(),
  businessContactPhone: z.string().max(20).trim().optional(),

  // Contato técnico
  technicalContactName: z.string().max(255).trim().optional(),
  technicalContactEmail: z.string().email('E-mail do contato técnico inválido.').toLowerCase().trim().optional(),
  technicalContactPhone: z.string().max(20).trim().optional(),

  // Contexto BRD/FRD
  businessObjectives: z.string().max(5000).trim().optional(),
  technicalConstraints: z.string().max(5000).trim().optional(),
  stakeholders: z.array(StakeholderSchema).max(20).default([]),
  notes: z.string().max(5000).trim().optional(),

  // Relacionamento
  status: z
    .enum(['active', 'prospect', 'closed'], {
      errorMap: () => ({ message: 'Status inválido. Use: active, prospect ou closed.' }),
    })
    .default('prospect'),

  relationshipStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD.')
    .optional(),
});

// --------------------------------------------------------------------------
// PUT /api/clients/:id — Atualização parcial
// --------------------------------------------------------------------------
const UpdateClientSchema = CreateClientSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Ao menos um campo deve ser fornecido para atualização.' }
);

// --------------------------------------------------------------------------
// GET /api/clients — Query params para listagem com filtros
// --------------------------------------------------------------------------
const ListClientsQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(Number)
    .refine((n) => n >= 1, 'page deve ser >= 1'),

  limit: z
    .string()
    .default('10')
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, 'limit deve ser entre 1 e 100'),

  status: z.enum(['active', 'prospect', 'closed']).optional(),
  marketSegment: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional(),
}).default({});

module.exports = { CreateClientSchema, UpdateClientSchema, ListClientsQuerySchema, StakeholderSchema };
