'use strict';

/**
 * Schemas de validação Zod para o módulo de autenticação.
 */

const { z } = require('zod');

// --------------------------------------------------------------------------
// Reutilizáveis
// --------------------------------------------------------------------------

const emailSchema = z
  .string({ required_error: 'E-mail é obrigatório.' })
  .email('Formato de e-mail inválido.')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string({ required_error: 'Senha é obrigatória.' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .max(128, 'A senha não pode ter mais de 128 caracteres.');

// --------------------------------------------------------------------------
// POST /api/auth/register
// --------------------------------------------------------------------------
const RegisterSchema = z.object({
  firstName: z
    .string({ required_error: 'Nome é obrigatório.' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(100, 'Nome pode ter no máximo 100 caracteres.')
    .trim(),

  lastName: z
    .string({ required_error: 'Sobrenome é obrigatório.' })
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres.')
    .max(100, 'Sobrenome pode ter no máximo 100 caracteres.')
    .trim(),

  birthDate: z
    .string({ required_error: 'Data de nascimento é obrigatória.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD.'),

  email: emailSchema,

  phone: z
    .string()
    .max(20, 'Telefone pode ter no máximo 20 caracteres.')
    .trim()
    .optional(),

  password: passwordSchema,

  confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

// --------------------------------------------------------------------------
// POST /api/auth/login
// --------------------------------------------------------------------------
const LoginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Senha é obrigatória.' }).min(1),
});

// --------------------------------------------------------------------------
// POST /api/auth/refresh
// --------------------------------------------------------------------------
const RefreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token é obrigatório.' })
    .min(1, 'Refresh token inválido.'),
});

module.exports = { RegisterSchema, LoginSchema, RefreshTokenSchema };
