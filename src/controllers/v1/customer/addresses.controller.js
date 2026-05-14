'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { NotFoundError, ForbiddenError } = require('../../../errors/AppError');

async function list(req, res, next) {
  try {
    const addresses = await db('user_addresses as ua')
      .join('addresses as a', 'a.id', 'ua.address_id')
      .where({ 'ua.user_id': req.user.id })
      .whereNull('ua.deleted_at')
      .whereNull('a.deleted_at')
      .select(
        'ua.id', 'ua.label', 'ua.is_default', 'ua.reference_note',
        'a.id as address_id', 'a.zip_code', 'a.street', 'a.number',
        'a.complement', 'a.neighborhood', 'a.city', 'a.state', 'a.country',
        'a.latitude', 'a.longitude'
      )
      .orderBy('ua.is_default', 'desc');

    return ok(res, { data: addresses });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      zip_code, street, number, complement, neighborhood,
      city, state, country, label, is_default, reference_note,
      latitude, longitude,
    } = req.body;

    const [addressId] = await db('addresses').insert({
      zip_code, street, number: number.toString(), complement,
      neighborhood, city, state, country: country || 'Brazil',
      latitude, longitude,
    });

    if (is_default) {
      await db('user_addresses')
        .where({ user_id: req.user.id })
        .whereNull('deleted_at')
        .update({ is_default: false });
    }

    const [userAddressId] = await db('user_addresses').insert({
      user_id: req.user.id,
      address_id: addressId,
      label: label || 'Home',
      is_default: is_default || false,
      reference_note: reference_note || null,
    });

    return created(res, {
      data: {
        id: userAddressId,
        addressId,
        // Compatibilidade retroativa
        address_id: addressId,
      },
      message: 'Endereço cadastrado.',
    });
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  try {
    const address = await db('user_addresses as ua')
      .join('addresses as a', 'a.id', 'ua.address_id')
      .where({ 'ua.id': req.params.addressId, 'ua.user_id': req.user.id })
      .whereNull('ua.deleted_at')
      .select('ua.id', 'ua.label', 'ua.is_default', 'ua.reference_note',
        'a.zip_code', 'a.street', 'a.number', 'a.complement',
        'a.neighborhood', 'a.city', 'a.state')
      .first();

    if (!address) throw new NotFoundError('Endereço não encontrado.');
    return ok(res, { data: address });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const ua = await db('user_addresses')
      .where({ id: req.params.addressId, user_id: req.user.id })
      .whereNull('deleted_at')
      .first();

    if (!ua) throw new NotFoundError('Endereço não encontrado.');

    const { label, reference_note, zip_code, street, number, complement, neighborhood, city, state } = req.body;

    await db('addresses').where({ id: ua.address_id }).update({
      ...(zip_code && { zip_code }),
      ...(street && { street }),
      ...(number && { number: number.toString() }),
      ...(complement !== undefined && { complement }),
      ...(neighborhood && { neighborhood }),
      ...(city && { city }),
      ...(state && { state }),
    });

    await db('user_addresses').where({ id: ua.id }).update({
      ...(label && { label }),
      ...(reference_note !== undefined && { reference_note }),
    });

    return ok(res, { message: 'Endereço atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('user_addresses')
      .where({ id: req.params.addressId, user_id: req.user.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Endereço não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function setDefault(req, res, next) {
  try {
    const ua = await db('user_addresses')
      .where({ id: req.params.addressId, user_id: req.user.id })
      .whereNull('deleted_at')
      .first();

    if (!ua) throw new NotFoundError('Endereço não encontrado.');

    await db('user_addresses')
      .where({ user_id: req.user.id })
      .whereNull('deleted_at')
      .update({ is_default: false });

    await db('user_addresses').where({ id: ua.id }).update({ is_default: true });

    return ok(res, { message: 'Endereço padrão atualizado.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, get, update, remove, setDefault };
