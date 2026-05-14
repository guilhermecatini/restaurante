'use strict';

const { z } = require('zod');

// --------------------------------------------------------------------------
// Schemas reutilizáveis
// --------------------------------------------------------------------------

const emailSchema = z.string().email('E-mail inválido.').max(255).toLowerCase().trim();
const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres.')
  .max(128, 'Senha muito longa.')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Senha deve conter letras maiúsculas, minúsculas e números.'
  );
const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-().]{7,20}$/, 'Telefone inválido.')
  .optional()
  .nullable();

// --------------------------------------------------------------------------
// Auth schemas
// --------------------------------------------------------------------------

const RegisterSchema = z.object({
  first_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').max(100).trim(),
  last_name: z.string().min(2, 'Sobrenome deve ter no mínimo 2 caracteres.').max(100).trim(),
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: z.string(),
  phone: phoneSchema,
  birth_date: z.string().date('Data de nascimento inválida (YYYY-MM-DD).').optional().nullable(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Confirmação de senha não confere.',
  path: ['password_confirmation'],
});

const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha obrigatória.'),
});

const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token obrigatório.'),
});

const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token obrigatório.'),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Confirmação de senha não confere.',
    path: ['password_confirmation'],
  });

const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Token obrigatório.'),
});

const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Senha atual obrigatória.'),
    new_password: passwordSchema,
    new_password_confirmation: z.string(),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    message: 'Confirmação de senha não confere.',
    path: ['new_password_confirmation'],
  });

module.exports = {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  ChangePasswordSchema,
  // reutilizáveis
  emailSchema,
  passwordSchema,
  phoneSchema,
};
