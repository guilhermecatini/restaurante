'use strict';

/**
 * Model de Usuário — definição de tipos/estrutura (sem ORM).
 *
 * Este arquivo documenta a estrutura do objeto User que trafega
 * pela aplicação. É o "contrato" entre services, controllers e o banco.
 *
 * Os campos seguem camelCase no JS e são convertidos para snake_case
 * pelo Knex (configurado no knexfile.js) ao interagir com o banco.
 *
 * @typedef {object} User
 * @property {string}  id            - UUID (PK)
 * @property {string}  firstName     - Nome (varchar 100)
 * @property {string}  lastName      - Sobrenome (varchar 100)
 * @property {string}  birthDate     - Data de nascimento (YYYY-MM-DD)
 * @property {string}  email         - E-mail único
 * @property {string}  [phone]       - Telefone (opcional)
 * @property {string}  [passwordHash]- Hash bcrypt (null em contas OAuth)
 * @property {'local'|'google'|'microsoft'} provider - Provider de autenticação
 * @property {string}  [providerId]  - ID externo do provider OAuth
 * @property {boolean} isActive      - Soft delete flag
 * @property {Date}    createdAt     - Timestamp de criação
 * @property {Date}    updatedAt     - Timestamp de atualização
 */

/**
 * Campos que NUNCA devem ser enviados ao cliente.
 * Use para fazer o strip antes de serializar a resposta.
 */
const SENSITIVE_FIELDS = ['passwordHash', 'password_hash'];

/**
 * Remove campos sensíveis de um objeto de usuário.
 *
 * @param {object} user
 * @returns {object} Usuário sem campos sensíveis
 */
function sanitizeUser(user) {
  if (!user) return null;
  const sanitized = { ...user };
  SENSITIVE_FIELDS.forEach((field) => delete sanitized[field]);
  return sanitized;
}

/**
 * Nome da tabela no banco de dados.
 */
const TABLE_NAME = 'users';

module.exports = { TABLE_NAME, SENSITIVE_FIELDS, sanitizeUser };
