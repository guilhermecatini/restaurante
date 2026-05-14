'use strict';

/**
 * Model de Cliente — definição de tipos/estrutura (sem ORM).
 *
 * Os campos foram projetados para suportar o contexto de documentação técnica
 * BRD (Business Requirement Document) e FRD (Functional Requirements Document),
 * incluindo dados de identificação, contatos, objetivos e restrições.
 *
 * @typedef {object} Stakeholder
 * @property {string} name  - Nome completo
 * @property {string} role  - Cargo / função
 * @property {string} email - E-mail de contato
 *
 * @typedef {object} Client
 * @property {string}  id                      - UUID (PK)
 * @property {string}  companyName             - Razão social
 * @property {string}  [tradeName]             - Nome fantasia
 * @property {string}  [taxId]                 - CNPJ ou identificador fiscal
 * @property {'micro'|'small'|'medium'|'large'|'enterprise'} [companySize] - Porte
 * @property {string}  [industrySector]        - Setor de atuação (ex: Financeiro, Saúde)
 * @property {string}  [marketSegment]         - Segmento de mercado
 * @property {string}  [website]               - Site da empresa
 * @property {string}  [address]               - Endereço completo
 * @property {string}  [city]                  - Cidade
 * @property {string}  [state]                 - Estado / UF
 * @property {string}  [country]               - País
 * @property {string}  [zipCode]               - CEP / código postal
 * @property {string}  [businessContactName]   - Responsável de negócio (nome)
 * @property {string}  [businessContactEmail]  - Responsável de negócio (e-mail)
 * @property {string}  [businessContactPhone]  - Responsável de negócio (telefone)
 * @property {string}  [technicalContactName]  - Responsável técnico (nome)
 * @property {string}  [technicalContactEmail] - Responsável técnico (e-mail)
 * @property {string}  [technicalContactPhone] - Responsável técnico (telefone)
 * @property {string}  [businessObjectives]    - Objetivos de negócio (texto livre)
 * @property {string}  [technicalConstraints]  - Restrições técnicas (texto livre)
 * @property {Stakeholder[]} [stakeholders]    - Stakeholders principais (JSON)
 * @property {'active'|'prospect'|'closed'} status - Status do cliente
 * @property {string}  [relationshipStartDate] - Data de início do relacionamento
 * @property {string}  [notes]                 - Observações adicionais
 * @property {string}  [createdBy]             - UUID do usuário que criou (FK)
 * @property {boolean} isActive                - Soft delete flag
 * @property {Date}    createdAt               - Timestamp de criação
 * @property {Date}    updatedAt               - Timestamp de atualização
 */

const TABLE_NAME = 'clients';

/**
 * Valores padrão para novos clientes.
 */
const DEFAULTS = {
  status: 'prospect',
  isActive: true,
  country: 'Brasil',
  stakeholders: [],
};

module.exports = { TABLE_NAME, DEFAULTS };
