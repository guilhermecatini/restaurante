'use strict';

/**
 * Seed: Clientes de exemplo para desenvolvimento e testes.
 *
 * @param {import('knex').Knex} knex
 */
exports.seed = async function (knex) {
  await knex('clients').del();

  await knex('clients').insert([
    {
      id: '10000000-0000-0000-0000-000000000001',
      company_name: 'Acme Tecnologia S/A',
      trade_name: 'AcmeTech',
      tax_id: '12.345.678/0001-99',
      company_size: 'large',
      industry_sector: 'Tecnologia da Informação',
      market_segment: 'B2B SaaS',
      website: 'https://acmetech.example.com',
      address: 'Av. Paulista, 1234 — Sala 501',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zip_code: '01310-100',
      business_contact_name: 'Carla Ferreira',
      business_contact_email: 'carla.ferreira@acmetech.example.com',
      business_contact_phone: '+55 11 3000-0001',
      technical_contact_name: 'Rafael Costa',
      technical_contact_email: 'rafael.costa@acmetech.example.com',
      technical_contact_phone: '+55 11 3000-0002',
      business_objectives: `
        - Modernizar o sistema legado de gestão de contratos (atualmente em Delphi 7).
        - Integrar com ERP SAP S/4HANA via APIs REST.
        - Reduzir tempo de aprovação de contratos de 5 dias úteis para 1 dia.
        - Implementar módulo de assinatura digital integrado à ICP-Brasil.
      `.trim(),
      technical_constraints: `
        - Infraestrutura on-premise — sem possibilidade de cloud pública no curto prazo.
        - Banco de dados Oracle 12c (não pode ser migrado).
        - Política de segurança exige autenticação via Active Directory (LDAP).
        - Janela de manutenção: apenas domingos entre 02h e 06h.
      `.trim(),
      stakeholders: JSON.stringify([
        { name: 'Carla Ferreira', role: 'Diretora de Operações', email: 'carla.ferreira@acmetech.example.com' },
        { name: 'Rafael Costa', role: 'Arquiteto de Soluções', email: 'rafael.costa@acmetech.example.com' },
        { name: 'Marcos Lima', role: 'CTO', email: 'marcos.lima@acmetech.example.com' },
      ]),
      status: 'active',
      relationship_start_date: '2023-03-15',
      notes: 'Cliente estratégico. Contrato de 24 meses assinado em março/2023.',
      created_by: '00000000-0000-0000-0000-000000000001',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      company_name: 'Healthflow Planos de Saúde Ltda',
      trade_name: 'Healthflow',
      tax_id: '98.765.432/0001-10',
      company_size: 'medium',
      industry_sector: 'Saúde',
      market_segment: 'B2C Planos de Saúde',
      website: 'https://healthflow.example.com',
      address: 'Rua das Laranjeiras, 200',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      zip_code: '22240-003',
      business_contact_name: 'Patricia Souza',
      business_contact_email: 'patricia.souza@healthflow.example.com',
      business_contact_phone: '+55 21 3100-0010',
      technical_contact_name: 'Bruno Alves',
      technical_contact_email: 'bruno.alves@healthflow.example.com',
      technical_contact_phone: '+55 21 3100-0011',
      business_objectives: `
        - Digitalizar o processo de solicitação de reembolso de consultas.
        - Portal do beneficiário responsivo (mobile-first).
        - Integração com TISS (Troca de Informações em Saúde Suplementar) da ANS.
      `.trim(),
      technical_constraints: `
        - Sistema legado em Java 8 — migração gradual apenas.
        - Conformidade com LGPD e normas da ANS.
        - Toda comunicação de dados de saúde deve ser criptografada em repouso e em trânsito.
      `.trim(),
      stakeholders: JSON.stringify([
        { name: 'Patricia Souza', role: 'Gerente de Projetos', email: 'patricia.souza@healthflow.example.com' },
        { name: 'Bruno Alves', role: 'Tech Lead', email: 'bruno.alves@healthflow.example.com' },
      ]),
      status: 'prospect',
      relationship_start_date: '2024-11-01',
      notes: 'Em fase de proposta. Reunião de kickoff agendada para o próximo mês.',
      created_by: '00000000-0000-0000-0000-000000000001',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('[seed] 2 clientes criados.');
};
