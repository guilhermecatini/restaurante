'use strict';

const { db } = require('../../../config/database');
const { ok } = require('../../../shared/response');

async function list(req, res, next) {
  try {
    const hours = await db('operating_hours')
      .where({ restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .orderBy(['weekday', 'shift_index'])
      .select('id', 'weekday', 'shift_index', 'opens_at', 'closes_at', 'is_closed');

    return ok(res, { data: hours });
  } catch (err) {
    return next(err);
  }
}

async function bulkUpdate(req, res, next) {
  try {
    const { hours } = req.body; // [{ weekday, shift_index, opens_at, closes_at, is_closed }]

    await db('operating_hours')
      .where({ restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (hours && hours.length) {
      await db('operating_hours').insert(
        hours.map((h) => ({
          restaurant_id: req.restaurant.id,
          weekday: h.weekday,
          shift_index: h.shift_index || 0,
          opens_at: h.opens_at,
          closes_at: h.closes_at,
          is_closed: h.is_closed || false,
        }))
      );
    }

    return ok(res, { message: 'Horários atualizados.' });
  } catch (err) {
    return next(err);
  }
}

async function updateOne(req, res, next) {
  try {
    const { opens_at, closes_at, is_closed } = req.body;
    const affected = await db('operating_hours')
      .where({ id: req.params.hourId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ opens_at, closes_at, is_closed });

    if (!affected) {
      // Cria novo se não existe
      await db('operating_hours').insert({
        restaurant_id: req.restaurant.id,
        weekday: req.body.weekday,
        shift_index: req.body.shift_index || 0,
        opens_at, closes_at, is_closed,
      });
    }

    return ok(res, { message: 'Horário atualizado.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, bulkUpdate, updateOne };
