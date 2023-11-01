/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('Product').del();
  await knex('Product').insert([
    {
      name: 'YOW MEADOW 28',
      price: 330,
      remark: 'surfskate for surfing on the land',
      sold: 3,
      stock: 10,
    },
    {
      name: 'yow kontiki 38',
      price: 300,
      remark: 'surfskate for surfing on the land',
      sold: 0,
      stock: 10,
    },
    {
      name: 'YOW X PUKAS FLAME 33 DECK',
      price: 290,
      remark: 'surfskate for surfing on the land',
      sold: 5,
      stock: 10,
    },
  ]);

  await knex('Purchase').del();
  await knex('Purchase').insert([
    {
      product_id: 1,
      price: 300,
      quantity: 10,
    },
    {
      product_id: 2,
      price: 270,
      quantity: 10,
    },
    {
      product_id: 3,
      price: 260,
      quantity: 10,
    },
  ]);
};
