'use strict';

/**
 * Seed: 100 clientes aleatorios para desenvolvimento e testes.
 *
 * Dados realistas brasileiros: razoes sociais, setores, segmentos,
 * stakeholders, objetivos de negocio e restricoes tecnicas variaveis.
 *
 * @param {import('knex').Knex} knex
 */

const { v4: uuidv4 } = require('uuid');

// --------------------------------------------------------------------------
// Dados de referencia para geracao aleatoria
// --------------------------------------------------------------------------

const COMPANY_PREFIXES = [
  'Acme', 'Alpha', 'Apex', 'Atlas', 'Avant', 'Axion', 'Azul', 'Beta',
  'Brio', 'Calix', 'Celta', 'Centrix', 'Cetus', 'Clarity', 'Codex',
  'Core', 'Croma', 'Crown', 'Cruz', 'Dalta', 'Delta', 'Denova', 'Devox',
  'Digital', 'Dinamo', 'Duplex', 'Edux', 'Elevo', 'Eluma', 'Empower',
  'Enexa', 'Engex', 'Enova', 'Epsilon', 'Equus', 'Evolux', 'Exato',
  'Exito', 'Expen', 'Facio', 'Fast', 'Fenix', 'Fiber', 'Fides', 'Flux',
  'Focus', 'Forte', 'Fusion', 'Galaxy', 'Genius', 'Global', 'Grupo',
  'Harbor', 'Helix', 'Horizon', 'Hub', 'Hydra', 'Icon', 'Ideia', 'Ilex',
  'Impact', 'Implex', 'Inova', 'Intelx', 'Intex', 'Itera', 'Kairos',
  'Kineto', 'Klaro', 'Kronos', 'Lambda', 'Layer', 'Levo', 'Linea',
  'Logic', 'Lumex', 'Lynx', 'Macro', 'Magnum', 'Matrix', 'Maximus',
  'Mentor', 'Metro', 'Mimax', 'Modus', 'Momentum', 'Mundo', 'Nativa',
  'Neon', 'Netx', 'Nexo', 'Nexus', 'Nimbus', 'Nodus', 'Nova', 'Nuvem',
  'Omega', 'Onix', 'Open', 'Opus', 'Orbit', 'Origin', 'Orion', 'Oval',
];

const COMPANY_SUFFIXES = [
  'Tecnologia', 'Sistemas', 'Solucoes', 'Digital', 'Inovacao',
  'Consultoria', 'Servicos', 'Negocios', 'Engenharia', 'Plataforma',
  'Analytics', 'Software', 'Automacao', 'Inteligencia', 'Dados',
  'Cloud', 'Network', 'Ventures', 'Partners', 'Group',
];

const LEGAL_FORMS = ['S/A', 'Ltda', 'Ltda.', 'ME', 'EPP', 'EIRELI', 'S.A.'];

const INDUSTRY_SECTORS = [
  'Tecnologia da Informacao',
  'Financeiro e Bancario',
  'Saude e Farmacias',
  'Varejo e E-commerce',
  'Industria e Manufatura',
  'Energia e Utilities',
  'Educacao e EdTech',
  'Logistica e Transporte',
  'Agronegocio',
  'Telecomunicacoes',
  'Construcao Civil',
  'Seguros',
  'Governo e Setor Publico',
  'Midia e Entretenimento',
  'Servicos Profissionais',
];

const MARKET_SEGMENTS = [
  'B2B SaaS', 'B2C', 'B2B', 'B2B2C', 'Marketplace', 'Enterprise SaaS',
  'SMB', 'Fintech', 'Healthtech', 'Edtech', 'Insurtech', 'Agritech',
  'Proptech', 'Retailtech', 'Govtech',
];

const COMPANY_SIZES = ['micro', 'small', 'medium', 'large', 'enterprise'];

const STATUSES = ['active', 'prospect', 'closed'];

const CITIES = [
  { city: 'Sao Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Brasilia', state: 'DF' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Recife', state: 'PE' },
  { city: 'Fortaleza', state: 'CE' },
  { city: 'Manaus', state: 'AM' },
  { city: 'Florianopolis', state: 'SC' },
  { city: 'Campinas', state: 'SP' },
  { city: 'Goiania', state: 'GO' },
  { city: 'Ribeirao Preto', state: 'SP' },
  { city: 'Uberlandia', state: 'MG' },
];

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gustavo',
  'Helena', 'Igor', 'Juliana', 'Lucas', 'Mariana', 'Nicolas', 'Olivia',
  'Pedro', 'Renata', 'Sergio', 'Tatiana', 'Ulisses', 'Vanessa',
  'Rafael', 'Patricia', 'Marcelo', 'Luciana', 'Rodrigo', 'Camila',
  'Diego', 'Amanda', 'Thiago', 'Beatriz', 'Felipe', 'Carolina',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa',
  'Ferreira', 'Rodrigues', 'Almeida', 'Nascimento', 'Araujo', 'Gomes',
  'Moreira', 'Barbosa', 'Carvalho', 'Ribeiro', 'Martins', 'Rocha',
  'Nunes', 'Mendes', 'Azevedo', 'Cardoso', 'Ramos', 'Lopes', 'Castro',
];

const BUSINESS_ROLES = [
  'CEO', 'CTO', 'CFO', 'COO', 'Diretor de TI', 'Diretor de Operacoes',
  'Gerente de Projetos', 'Head de Produto', 'VP de Tecnologia',
  'Diretor de Inovacao', 'Gerente de TI', 'Coordenador de Sistemas',
];

const TECHNICAL_ROLES = [
  'Arquiteto de Solucoes', 'Tech Lead', 'Engenheiro Senior', 'CTO',
  'Gerente de Infraestrutura', 'DevOps Lead', 'Head de Engenharia',
  'Coordenador de TI', 'Analista de Sistemas Senior', 'Staff Engineer',
];

const BUSINESS_OBJECTIVES_POOL = [
  'Modernizar o sistema legado de gestao para uma plataforma cloud-native, reduzindo custo operacional em 30%.',
  'Implementar um portal self-service para clientes, eliminando 60% das chamadas ao suporte.',
  'Integrar os sistemas de ERP e CRM para ter uma visao unificada do cliente em tempo real.',
  'Digitalizar o processo de onboarding, reduzindo o tempo de ativacao de 15 dias para 2 dias.',
  'Construir uma plataforma de analytics para decisao baseada em dados, substituindo relatorios manuais em Excel.',
  'Automatizar o workflow de aprovacao de contratos para reduzir o ciclo de vendas em 40%.',
  'Migrar a infraestrutura on-premise para cloud (AWS/Azure), melhorando disponibilidade para 99.9%.',
  'Implementar autenticacao SSO e politicas Zero Trust para atender requisitos de conformidade ISO 27001.',
  'Criar uma API publica para ecossistema de parceiros, habilitando integracoes B2B em escala.',
  'Desenvolver app mobile para equipe de campo, eliminando processos baseados em papel.',
  'Implantar sistema de monitoramento em tempo real para prevencao de fraudes.',
  'Unificar dados de multiplos sistemas em um Data Warehouse centralizado para BI e ML.',
  'Implementar processo CI/CD para reduzir time-to-market de novas funcionalidades de 6 meses para 2 semanas.',
  'Construir plataforma de pagamentos propria para reduzir dependencia de intermediarios e taxas.',
  'Modernizar a experiencia do usuario com redesign completo do produto principal (UX/UI).',
];

const TECHNICAL_CONSTRAINTS_POOL = [
  'Infraestrutura 100% on-premise. Cloud publica nao e permitida por politica interna.',
  'Sistema legado em COBOL em mainframe IBM — migracao deve ser gradual e nao pode ter downtime.',
  'Banco de dados Oracle 12c. Migracao para outro SGBD nao esta no escopo.',
  'Politica de seguranca exige todos os dados em territorio nacional (LGPD + requisito interno).',
  'Autenticacao obrigatoriamente via Active Directory (LDAP/SAML). Sem contas locais.',
  'Janela de manutencao restrita: domingos das 02h as 06h (horario de Brasilia).',
  'Ambiente regulado pela ANS — qualquer mudanca requer validacao formal antes do deploy.',
  'Rede segregada sem acesso a internet publica nos servidores de producao.',
  'Legado em Delphi 7 — integracao deve ser feita via arquivos CSV ou banco de dados compartilhado.',
  'SLA contratual de 99.95% de disponibilidade — qualquer manutencao exige aviso com 72h de antecedencia.',
  'Conformidade PCI-DSS nivel 1. Todos os sistemas que tocam dados de cartao precisam de certificacao.',
  'Time de TI interno reduzido. A solucao deve ser de baixa operacao e ter suporte 24x7.',
  'Integracao obrigatoria com SAP S/4HANA via iDocs ou APIs REST do SAP Integration Suite.',
  'Dado de producao nao pode ser usado em ambientes de teste. Necessidade de geracao de dados sinteticos.',
  'Versao do Java fixada em 11 por restricao de licenca. Atualizacao de runtime nao esta aprovada.',
];

// --------------------------------------------------------------------------
// Utilitarios
// --------------------------------------------------------------------------

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const d = new Date(start + Math.random() * (end - start));
  return d.toISOString().split('T')[0];
}

function randomCnpj() {
  const n = () => randomInt(0, 9);
  return `${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}/000${randomInt(1, 2)}-${n()}${n()}`;
}

function randomPhone(ddd) {
  return `+55 ${ddd} 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
}

function randomEmail(firstName, lastName, domain) {
  const f = firstName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const l = lastName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return `${f}.${l}@${domain}`;
}

function generateDomain(companyName) {
  return companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) + '.com.br';
}

function generateStakeholders(domain, ddd) {
  const count = randomInt(2, 4);
  const roles = [...BUSINESS_ROLES, ...TECHNICAL_ROLES].sort(() => Math.random() - 0.5);
  return Array.from({ length: count }, (_, i) => {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    return {
      name: `${fn} ${ln}`,
      role: roles[i] || pick(BUSINESS_ROLES),
      email: randomEmail(fn, ln, domain),
    };
  });
}

// --------------------------------------------------------------------------
// Gerador de cliente
// --------------------------------------------------------------------------

function generateClient(index, createdBy) {
  const prefix = pick(COMPANY_PREFIXES);
  const suffix = pick(COMPANY_SUFFIXES);
  const legal = pick(LEGAL_FORMS);
  const companyName = `${prefix} ${suffix} ${legal}`;
  const tradeName = `${prefix}${suffix}`;
  const domain = generateDomain(tradeName);

  const location = pick(CITIES);
  const ddd = randomInt(11, 99).toString();
  const sector = pick(INDUSTRY_SECTORS);
  const segment = pick(MARKET_SEGMENTS);
  const size = pick(COMPANY_SIZES);
  const status = pick(STATUSES);

  const bizFirstName = pick(FIRST_NAMES);
  const bizLastName = pick(LAST_NAMES);
  const techFirstName = pick(FIRST_NAMES);
  const techLastName = pick(LAST_NAMES);

  const stakeholders = generateStakeholders(domain, ddd);

  // Adiciona os contatos principais como stakeholders tambem
  stakeholders.unshift({
    name: `${bizFirstName} ${bizLastName}`,
    role: pick(BUSINESS_ROLES),
    email: randomEmail(bizFirstName, bizLastName, domain),
  });

  const objectives = pickN(BUSINESS_OBJECTIVES_POOL, randomInt(1, 3)).join('\n\n');
  const constraints = pickN(TECHNICAL_CONSTRAINTS_POOL, randomInt(1, 3)).join('\n\n');

  // Gera CEP fake mas com formato correto
  const cep = `${randomInt(10000, 99999)}-${randomInt(100, 999)}`;

  return {
    id: uuidv4(),
    company_name: companyName,
    trade_name: tradeName,
    tax_id: randomCnpj(),
    company_size: size,
    industry_sector: sector,
    market_segment: segment,
    website: `https://www.${domain}`,
    address: `${pick(['Av.', 'Rua', 'Alameda', 'Travessa'])} ${pick(LAST_NAMES)}, ${randomInt(1, 9999)}`,
    city: location.city,
    state: location.state,
    country: 'Brasil',
    zip_code: cep,
    business_contact_name: `${bizFirstName} ${bizLastName}`,
    business_contact_email: randomEmail(bizFirstName, bizLastName, domain),
    business_contact_phone: randomPhone(ddd),
    technical_contact_name: `${techFirstName} ${techLastName}`,
    technical_contact_email: randomEmail(techFirstName, techLastName, domain),
    technical_contact_phone: randomPhone(ddd),
    business_objectives: objectives,
    technical_constraints: constraints,
    stakeholders: JSON.stringify(stakeholders),
    notes: randomInt(0, 1) === 1
      ? `Cliente adquirido via ${pick(['indicacao', 'evento', 'inbound', 'prospecao ativa', 'parceiro'])}. Prioridade ${pick(['alta', 'media', 'normal'])}.`
      : null,
    status,
    relationship_start_date: status !== 'prospect' ? randomDate(2018, 2025) : null,
    created_by: createdBy,
    is_active: status !== 'closed' ? true : randomInt(0, 1) === 1,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

// --------------------------------------------------------------------------
// Seed
// --------------------------------------------------------------------------

exports.seed = async function (knex) {
  // Remove apenas os clientes gerados por bulk (preserva os do seed 02)
  await knex('clients')
    .whereNotIn('id', [
      '10000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
    ])
    .del();

  const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
  const clients = Array.from({ length: 100 }, (_, i) => generateClient(i, ADMIN_ID));

  // Insere em lotes de 25 para nao sobrecarregar o banco
  const BATCH_SIZE = 25;
  for (let i = 0; i < clients.length; i += BATCH_SIZE) {
    await knex('clients').insert(clients.slice(i, i + BATCH_SIZE));
  }

  const counts = clients.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  console.log('[seed] 100 clientes aleatorios inseridos.');
  console.log('  active  :', counts.active || 0);
  console.log('  prospect:', counts.prospect || 0);
  console.log('  closed  :', counts.closed || 0);
};
