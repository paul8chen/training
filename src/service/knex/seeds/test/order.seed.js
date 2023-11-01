/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  // Deletes ALL existing entries

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
