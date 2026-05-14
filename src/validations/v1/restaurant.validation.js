'use strict';

const { z } = require('zod');

const slugSchema = z
  .string()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens.')
  .trim();

// --------------------------------------------------------------------------
// Restaurante (perfil)
// --------------------------------------------------------------------------

const CreateRestaurantSchema = z.object({
  slug: slugSchema,
  legal_name: z.string().min(2).max(180).trim(),
  trade_name: z.string().min(2).max(180).trim(),
  document_number: z.string().max(30).trim().optional().nullable(),
  support_phone: z.string().max(20).optional().nullable(),
  support_email: z.string().email().max(255).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  minimum_order_value: z.number().nonnegative().default(0),
  base_delivery_fee: z.number().nonnegative().default(0),
  avg_preparation_time_min: z.number().int().min(1).max(300).default(30),
  accepts_pickup: z.boolean().default(true),
  accepts_delivery: z.boolean().default(true),
});

const UpdateRestaurantSchema = CreateRestaurantSchema.partial().omit({ slug: true });

// --------------------------------------------------------------------------
// Categoria
// --------------------------------------------------------------------------

const CategorySchema = z.object({
  name: z.string().min(2).max(120).trim(),
  slug: slugSchema.optional(),
  sort_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

const UpdateCategorySchema = CategorySchema.partial();

// --------------------------------------------------------------------------
// Produto
// --------------------------------------------------------------------------

const ProductSchema = z.object({
  category_id: z.coerce.number().int().positive().optional().nullable(),
  name: z.string().min(2).max(180).trim(),
  slug: slugSchema.optional(),
  description: z.string().max(2000).optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  base_price: z.number().positive('Preço deve ser maior que zero.'),
  stock_control_enabled: z.boolean().default(false),
  stock_quantity: z.number().int().optional().nullable(),
  preparation_time_min: z.number().int().min(1).max(600).default(20),
  sort_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

const UpdateProductSchema = ProductSchema.partial();

// --------------------------------------------------------------------------
// Grupo de adicionais
// --------------------------------------------------------------------------

const AddonGroupBaseSchema = z.object({
  name: z.string().min(2).max(160).trim(),
  description: z.string().max(255).optional().nullable(),
  min_select: z.number().int().nonnegative().default(0),
  max_select: z.number().int().positive().default(1),
  is_required: z.boolean().default(false),
  sort_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

const AddonGroupSchema = AddonGroupBaseSchema.refine((d) => d.max_select >= d.min_select, {
  message: 'max_select deve ser >= min_select.',
  path: ['max_select'],
});

const UpdateAddonGroupSchema = AddonGroupBaseSchema.partial();

// --------------------------------------------------------------------------
// Adicional
// --------------------------------------------------------------------------

const AddonSchema = z.object({
  addon_group_id: z.coerce.number().int().positive(),
  name: z.string().min(2).max(160).trim(),
  description: z.string().max(255).optional().nullable(),
  price_delta: z.number().nonnegative().default(0),
  sort_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

const UpdateAddonSchema = AddonSchema.partial().omit({ addon_group_id: true });

// --------------------------------------------------------------------------
// Vínculo produto-grupo de adicionais
// --------------------------------------------------------------------------

const ProductAddonGroupSchema = z.object({
  addon_group_id: z.coerce.number().int().positive(),
});

// --------------------------------------------------------------------------
// Combo
// --------------------------------------------------------------------------

const ComboSchema = z.object({
  category_id: z.coerce.number().int().positive().optional().nullable(),
  name: z.string().min(2).max(180).trim(),
  slug: slugSchema.optional(),
  description: z.string().max(2000).optional().nullable(),
  combo_price: z.number().positive('Preço do combo deve ser maior que zero.'),
  is_active: z.boolean().default(true),
  available_from: z.string().datetime().optional().nullable(),
  available_until: z.string().datetime().optional().nullable(),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().positive().default(1),
      min_quantity: z.number().int().positive().default(1),
      max_quantity: z.number().int().positive().default(1),
    })
  ).min(2, 'Um combo deve ter pelo menos 2 itens.'),
});

const UpdateComboSchema = ComboSchema.partial().omit({ items: true });

// --------------------------------------------------------------------------
// Cupom
// --------------------------------------------------------------------------

const CouponBaseSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[A-Z0-9_-]+$/, 'Código deve conter apenas letras maiúsculas, números, _ e -.')
    .trim(),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_delivery']),
  discount_value: z.number().nonnegative(),
  max_discount_amount: z.number().positive().optional().nullable(),
  min_order_value: z.number().nonnegative().default(0),
  usage_limit_total: z.number().int().positive().optional().nullable(),
  usage_limit_per_user: z.number().int().positive().default(1),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  is_active: z.boolean().default(true),
});

const CouponSchema = CouponBaseSchema.refine((d) => new Date(d.ends_at) > new Date(d.starts_at), {
  message: 'ends_at deve ser posterior a starts_at.',
  path: ['ends_at'],
});

const UpdateCouponSchema = CouponBaseSchema.partial().omit({ code: true });

// --------------------------------------------------------------------------
// Horários de funcionamento
// --------------------------------------------------------------------------

const OperatingHourSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  shift_index: z.number().int().positive().default(1),
  opens_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato HH:MM').optional().nullable(),
  closes_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato HH:MM').optional().nullable(),
  is_closed: z.boolean().default(false),
});

const BulkOperatingHoursSchema = z.object({
  hours: z.array(OperatingHourSchema).min(1),
});

// --------------------------------------------------------------------------
// Zonas de entrega
// --------------------------------------------------------------------------

const DeliveryZoneSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  zone_type: z.enum(['radius', 'polygon']).default('radius'),
  radius_km: z.number().positive().optional().nullable(),
  polygon_geojson: z.string().optional().nullable(),
  minimum_order_value: z.number().nonnegative().default(0),
  delivery_fee: z.number().nonnegative().default(0),
  estimated_delivery_time_min: z.number().int().positive().default(45),
  is_active: z.boolean().default(true),
});

const UpdateDeliveryZoneSchema = DeliveryZoneSchema.partial();

// --------------------------------------------------------------------------
// Equipe do restaurante
// --------------------------------------------------------------------------

const InviteTeamMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['manager', 'attendant', 'kitchen', 'courier', 'finance']),
});

const UpdateTeamMemberRoleSchema = z.object({
  role: z.enum(['manager', 'attendant', 'kitchen', 'courier', 'finance']),
});

// --------------------------------------------------------------------------
// Status do pedido (backoffice)
// --------------------------------------------------------------------------

const UpdateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'canceled']),
  notes: z.string().max(500).optional().nullable(),
});

module.exports = {
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
  CategorySchema,
  UpdateCategorySchema,
  ProductSchema,
  UpdateProductSchema,
  AddonGroupSchema,
  UpdateAddonGroupSchema,
  AddonSchema,
  UpdateAddonSchema,
  ProductAddonGroupSchema,
  ComboSchema,
  UpdateComboSchema,
  CouponSchema,
  UpdateCouponSchema,
  OperatingHourSchema,
  BulkOperatingHoursSchema,
  DeliveryZoneSchema,
  UpdateDeliveryZoneSchema,
  InviteTeamMemberSchema,
  UpdateTeamMemberRoleSchema,
  UpdateOrderStatusSchema,
  slugSchema,
};
