'use strict';

/**
 * Configuracao das strategies do Passport.js
 *
 * Strategies configuradas:
 *  - LocalStrategy    : autenticacao por email + senha (bcrypt)
 *  - GoogleStrategy   : OAuth 2.0 via Google
 *  - MicrosoftStrategy: OAuth 2.0 via Microsoft (Azure AD / Entra ID)
 *
 * Nao utilizamos serialize/deserializeUser pois a autenticacao e
 * stateless (JWT) - o Passport e usado apenas para validar credenciais
 * e retornar o objeto de usuario; a sessao HTTP nao e usada.
 */

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const env = require('./env');
const { db } = require('./database');

// --------------------------------------------------------------------------
// Helper: upsertOAuthUser
// --------------------------------------------------------------------------

/**
 * Faz upsert de um usuario OAuth.
 * Se ja existe um registro com o mesmo email, atualiza o provider_id.
 * Caso contrario, cria um novo usuario.
 *
 * @param {object} profile - Perfil retornado pelo provider OAuth
 * @param {'google'|'microsoft'} provider
 * @returns {Promise<object>} Usuario do banco de dados
 */
async function upsertOAuthUser(profile, provider) {
  const email =
    profile.emails && profile.emails[0] && profile.emails[0].value
      ? profile.emails[0].value
      : null;

  if (!email) {
    throw new Error('O provider ' + provider + ' nao retornou um e-mail valido.');
  }

  // Verifica se ja existe usuario com este email
  let user = await db('users').where({ email }).first();

  if (user) {
    // Atualiza provider_id se necessario
    if (user.provider_id !== profile.id || user.provider !== provider) {
      await db('users')
        .where({ id: user.id })
        .update({
          provider,
          provider_id: profile.id,
          updated_at: db.fn.now(),
        });
      user = await db('users').where({ id: user.id }).first();
    }
    return user;
  }

  // Cria novo usuario OAuth
  const displayName = profile.displayName || '';
  const nameParts = displayName.split(' ');
  const firstName = (profile.name && profile.name.givenName) || nameParts[0] || 'Usuario';
  const lastName =
    (profile.name && profile.name.familyName) || nameParts.slice(1).join(' ') || 'OAuth';

  const newUser = {
    id: uuidv4(),
    first_name: firstName,
    last_name: lastName,
    birth_date: '1900-01-01', // Placeholder - OAuth nao fornece data de nascimento
    email,
    provider,
    provider_id: profile.id,
    is_active: true,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  };

  await db('users').insert(newUser);

  return db('users').where({ id: newUser.id }).first();
}

// --------------------------------------------------------------------------
// Strategy: Local (email + senha)
// --------------------------------------------------------------------------
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await db('users')
          .where({ email: email.toLowerCase().trim(), is_active: true })
          .first();

        if (!user) {
          return done(null, false, { message: 'Credenciais invalidas.' });
        }

        // Usuarios OAuth nao possuem senha
        // Nota: postProcessResponse do Knex converte snake_case -> camelCase,
        // entao o campo vem como user.passwordHash (nao user.password_hash)
        if (!user.passwordHash) {
          return done(null, false, {
            message: 'Esta conta usa login via ' + user.provider + '. Use o metodo correto.',
          });
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return done(null, false, { message: 'Credenciais invalidas.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// --------------------------------------------------------------------------
// Strategy: Google OAuth 2.0
// --------------------------------------------------------------------------
if (env.GOOGLE.CLIENT_ID && env.GOOGLE.CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE.CLIENT_ID,
        clientSecret: env.GOOGLE.CLIENT_SECRET,
        callbackURL: env.GOOGLE.CALLBACK_URL,
        scope: ['profile', 'email'],
        session: false,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await upsertOAuthUser(profile, 'google');
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  console.warn(
    '[passport] Google OAuth nao configurado - variaveis GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET ausentes.'
  );
}

// --------------------------------------------------------------------------
// Strategy: Microsoft OAuth 2.0
// --------------------------------------------------------------------------
if (env.MICROSOFT.CLIENT_ID && env.MICROSOFT.CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: env.MICROSOFT.CLIENT_ID,
        clientSecret: env.MICROSOFT.CLIENT_SECRET,
        callbackURL: env.MICROSOFT.CALLBACK_URL,
        scope: ['user.read'],
        session: false,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await upsertOAuthUser(profile, 'microsoft');
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  console.warn(
    '[passport] Microsoft OAuth nao configurado - variaveis MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET ausentes.'
  );
}

// Sem serialize/deserializeUser - autenticacao puramente stateless via JWT
module.exports = passport;
