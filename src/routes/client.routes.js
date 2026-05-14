'use strict';

const { Router } = require('express');
const clientController = require('../controllers/client.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  CreateClientSchema,
  UpdateClientSchema,
  ListClientsQuerySchema,
} = require('../validations/client.validation');

const router = Router();

router.use(authenticateJWT);

// ============================================================================
// GET /api/clients
// ============================================================================

/**
 * @swagger
 * /clients:
 *   get:
 *     tags: [Clients]
 *     summary: Lista clientes paginados
 *     description: Retorna clientes ativos com suporte a paginacao e filtros por status e segmento.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero da pagina.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Registros por pagina (max 100).
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, prospect, closed]
 *         description: Filtra por status do cliente.
 *       - in: query
 *         name: marketSegment
 *         schema:
 *           type: string
 *         description: Filtra por segmento de mercado (busca parcial).
 *         example: B2B
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por razao social, nome fantasia ou CNPJ.
 *         example: Acme
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClientResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', validate(ListClientsQuerySchema, 'query'), clientController.list);

// ============================================================================
// GET /api/clients/:id
// ============================================================================

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Busca cliente por ID
 *     description: Retorna todos os campos do cliente, incluindo stakeholders e contexto BRD/FRD.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID do cliente.
 *         example: 10000000-0000-0000-0000-000000000001
 *     responses:
 *       200:
 *         description: Cliente encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClientResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', clientController.findById);

// ============================================================================
// POST /api/clients
// ============================================================================

/**
 * @swagger
 * /clients:
 *   post:
 *     tags: [Clients]
 *     summary: Cria novo cliente
 *     description: Apenas companyName e obrigatorio. Os demais campos sao opcionais.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientRequest'
 *           example:
 *             companyName: Acme Tecnologia S/A
 *             tradeName: AcmeTech
 *             taxId: 12.345.678/0001-99
 *             companySize: large
 *             industrySector: Tecnologia da Informacao
 *             marketSegment: B2B SaaS
 *             status: prospect
 *             businessContactName: Carla Ferreira
 *             businessContactEmail: carla@acmetech.com
 *             technicalContactName: Rafael Costa
 *             technicalContactEmail: rafael@acmetech.com
 *             businessObjectives: Modernizar sistema legado de gestao.
 *             technicalConstraints: Infraestrutura on-premise. Sem cloud publica.
 *             stakeholders:
 *               - name: Carla Ferreira
 *                 role: Diretora de Operacoes
 *                 email: carla@acmetech.com
 *               - name: Rafael Costa
 *                 role: Arquiteto de Solucoes
 *                 email: rafael@acmetech.com
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClientResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */
router.post('/', validate(CreateClientSchema), clientController.create);

// ============================================================================
// PUT /api/clients/:id
// ============================================================================

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     tags: [Clients]
 *     summary: Atualiza cliente parcialmente
 *     description: Todos os campos sao opcionais. Ao menos um deve ser informado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: 10000000-0000-0000-0000-000000000001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClientRequest'
 *     responses:
 *       200:
 *         description: Cliente atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClientResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */
router.put('/:id', validate(UpdateClientSchema), clientController.update);

// ============================================================================
// DELETE /api/clients/:id
// ============================================================================

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     tags: [Clients]
 *     summary: Desativa cliente (soft delete)
 *     description: Define is_active=false. O registro nao e removido do banco.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: 10000000-0000-0000-0000-000000000001
 *     responses:
 *       200:
 *         description: Cliente desativado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Cliente desativado com sucesso.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', clientController.remove);

module.exports = router;
