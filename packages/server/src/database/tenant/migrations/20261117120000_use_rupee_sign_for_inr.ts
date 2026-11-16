/**
 * Replaces the "Rs" sign seeded from js-money with the rupee sign (₹) for INR.
 * Only rows still holding the old seeded value are changed, so a sign the user
 * edited by hand is kept.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex('currencies')
    .where({ currency_code: 'INR', currency_sign: 'Rs' })
    .update({ currency_sign: '₹' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex('currencies')
    .where({ currency_code: 'INR', currency_sign: '₹' })
    .update({ currency_sign: 'Rs' });
};
