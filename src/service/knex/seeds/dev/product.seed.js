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

  await knex('Order').del();
  await knex('Order').insert({
    buyer: 'Paul',
    amount: 610,
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });

  await knex('Order').insert({
    buyer: 'John',
    amount: 1530,
  });

  await knex('OrderDetail').del();
  await knex('OrderDetail').insert([
    { product_id: 1, order_id: 1, price: 330, quantity: 1 },
    { product_id: 3, order_id: 1, price: 290, quantity: 2 },
    { product_id: 1, order_id: 2, price: 330, quantity: 2 },
    { product_id: 3, order_id: 2, price: 290, quantity: 3 },
  ]);
};
