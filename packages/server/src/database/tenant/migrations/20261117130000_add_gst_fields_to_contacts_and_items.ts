/**
 * India GST master data:
 * - contacts (customers and vendors): GSTIN, GST treatment (registration type)
 *   and default place of supply (2-digit GST state code).
 * - items: HSN (goods) or SAC (services) code.
 *
 * All columns are nullable so non-Indian organizations are unaffected.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const contactsHasGstin = await knex.schema.hasColumn('contacts', 'gstin');

  if (!contactsHasGstin) {
    await knex.schema.table('contacts', (table) => {
      table.string('gstin', 15).nullable();
      table.string('gst_treatment', 32).nullable();
      table.string('place_of_supply', 2).nullable();
    });
  }
  const itemsHasHsn = await knex.schema.hasColumn('items', 'hsn_sac_code');

  if (!itemsHasHsn) {
    await knex.schema.table('items', (table) => {
      table.string('hsn_sac_code', 8).nullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.table('contacts', (table) => {
    table.dropColumn('gstin');
    table.dropColumn('gst_treatment');
    table.dropColumn('place_of_supply');
  });
  await knex.schema.table('items', (table) => {
    table.dropColumn('hsn_sac_code');
  });
};
