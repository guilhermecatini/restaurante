'use strict';

/**
 * Schemas de validação Zod para o módulo de usuários.
 */

const { z } = require('zod');

// --------------------------------------------------------------------------
// Campos reutilizáveis
// --------------------------------------------------------------------------

const emailSchema = z
  .string()
  .email('Formato de e-mail inválido.')
  .toLowerCase()
  .trim();

// --------------------------------------------------------------------------
// POST /api/users — Criação de usuário
// --------------------------------------------------------------------------
const CreateUserSchema = z.object({
  firstName: z
    .string({ required_error: 'Nome é obrigatório.' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(100)
    .trim(),

  lastName: z
    .string({ required_error: 'Sobrenome é obrigatório.' })
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres.')
    .max(100)
    .trim(),

  birthDate: z
    .string({ required_error: 'Data de nascimento é obrigatória.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD.'),

  email: emailSchema,

  phone: z.string().max(20).trim().optional(),

  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(128),
});

// --------------------------------------------------------------------------
// PUT /api/users/:id — Atualização parcial
// --------------------------------------------------------------------------
const UpdateUserSchema = z.object({
  firstName: z.string().min(2).max(100).trim().optional(),
  lastName: z.string().min(2).max(100).trim().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD.')
    .optional(),
  phone: z.string().max(20).trim().optional().nullable(),
  // Senha só pode ser atualizada se o provider for 'local'
  // A validação de autorização é feita no service
  password: z.string().min(8).max(128).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Ao menos um campo deve ser fornecido para atualização.' }
);

// --------------------------------------------------------------------------
// GET /api/users — Query params para listagem paginada
// --------------------------------------------------------------------------
const ListUsersQuerySchema = z.object({
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

  search: z.string().trim().max(100).optional(),
}).default({});

module.exports = { CreateUserSchema, UpdateUserSchema, ListUsersQuerySchema };
