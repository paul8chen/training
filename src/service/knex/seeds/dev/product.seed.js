/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('Product').del();
  await knex('Product').insert([
    {
      name: 'yow kontiki 28',
      price: 330,
      remark: 'surfskate for surfing on the land',
    },
    {
      name: 'yow kontiki 38',
      price: 300,
      remark: 'surfskate for surfing on the land',
    },
    {
      name: 'yow kontiki 34',
      price: 290,
      remark: 'surfskate for surfing on the land',
    },
  ]);
};
