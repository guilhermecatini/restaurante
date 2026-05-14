'use strict';

/**
 * Seed: Usuarios iniciais para desenvolvimento e testes.
 *
 * Os hashes sao gerados em tempo de seed (bcrypt.hash),
 * garantindo que correspondam exatamente as senhas abaixo:
 *
 *   admin@example.com   -> Admin@123456
 *   guilherme@catini.org -> User@123456
 *
 * @param {import('knex').Knex} knex
 */

const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  // Limpa as tabelas antes de inserir (apenas em dev/test)
  await knex('refresh_tokens').del();
  await knex('users').del();

  // Gera os hashes agora -- garante correspondencia real com as senhas
  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash('Admin@123456', 12),
    bcrypt.hash('User@123456', 12),
  ]);

  await knex('users').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Admin',
      last_name: 'Sistema',
      birth_date: '1990-01-01',
      email: 'admin@example.com',
      phone: '+55 11 99999-0001',
      password_hash: adminHash,
      provider: 'local',
      provider_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Guilherme',
      last_name: 'Catini',
      birth_date: '1985-06-15',
      email: 'guilherme@catini.org',
      phone: '+55 11 99999-0002',
      password_hash: userHash,
      provider: 'local',
      provider_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('[seed] 2 usuarios criados.');
  console.log('  admin@example.com    -> Admin@123456');
  console.log('  guilherme@catini.org -> User@123456');
};
