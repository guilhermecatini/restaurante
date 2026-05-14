'use strict';

const { z } = require('zod');

// --------------------------------------------------------------------------
// Perfil do cliente
// --------------------------------------------------------------------------

const UpdateProfileSchema = z.object({
  first_name: z.string().min(2).max(100).trim().optional(),
  last_name: z.string().min(2).max(100).trim().optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Telefone inválido.')
    .optional()
    .nullable(),
  birth_date: z.string().date('Data inválida (YYYY-MM-DD).').optional().nullable(),
});

// --------------------------------------------------------------------------
// Endereços
// --------------------------------------------------------------------------

const AddressSchema = z.object({
  zip_code: z.string().min(5).max(20).trim(),
  street: z.string().min(3).max(180).trim(),
  number: z.string().min(1).max(20).trim(),
  complement: z.string().max(120).trim().optional().nullable(),
  neighborhood: z.string().min(2).max(120).trim(),
  city: z.string().min(2).max(120).trim(),
  state: z.string().min(2).max(120).trim(),
  country: z.string().max(120).default('Brazil'),
  label: z.string().max(80).default('Home'),
  is_default: z.boolean().default(false),
  reference_note: z.string().max(255).optional().nullable(),
});

const UpdateAddressSchema = AddressSchema.partial().omit({ label: true });

// --------------------------------------------------------------------------
// Carrinho
// --------------------------------------------------------------------------

const AddCartItemSchema = z.object({
  restaurant_id: z.coerce.number().int().positive('ID do restaurante inválido.'),
  product_id: z.coerce.number().int().positive().optional().nullable(),
  combo_id: z.coerce.number().int().positive().optional().nullable(),
  quantity: z.number().int().min(1).max(99).default(1),
  customer_notes: z.string().max(500).optional().nullable(),
  addons: z
    .array(
      z.object({
        addon_id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(20).default(1),
      })
    )
    .optional()
    .default([]),
}).refine((d) => d.product_id || d.combo_id, {
  message: 'Informe product_id ou combo_id.',
  path: ['product_id'],
});

const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
  customer_notes: z.string().max(500).optional().nullable(),
  addons: z
    .array(
      z.object({
        addon_id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(20).default(1),
      })
    )
    .optional(),
});

// --------------------------------------------------------------------------
// Pedido
// --------------------------------------------------------------------------

const PlaceOrderSchema = z.object({
  cart_id: z.coerce.number().int().positive('ID do carrinho inválido.'),
  delivery_address_id: z.coerce.number().int().positive().optional().nullable(),
  order_type: z.enum(['delivery', 'pickup']).default('delivery'),
  coupon_code: z.string().max(60).optional().nullable(),
  payment_method: z.enum(['pix', 'credit_card', 'debit_card', 'cash', 'wallet']),
  customer_notes: z.string().max(1000).optional().nullable(),
}).refine(
  (d) => d.order_type === 'pickup' || d.delivery_address_id,
  {
    message: 'Para entrega, informe o endereço de entrega.',
    path: ['delivery_address_id'],
  }
);

// --------------------------------------------------------------------------
// Avaliações
// --------------------------------------------------------------------------

const RestaurantReviewSchema = z.object({
  order_id: z.coerce.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

const OrderReviewSchema = z.object({
  delivery_rating: z.number().int().min(1).max(5).optional().nullable(),
  packaging_rating: z.number().int().min(1).max(5).optional().nullable(),
  overall_rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

module.exports = {
  UpdateProfileSchema,
  AddressSchema,
  UpdateAddressSchema,
  AddCartItemSchema,
  UpdateCartItemSchema,
  PlaceOrderSchema,
  RestaurantReviewSchema,
  OrderReviewSchema,
};
