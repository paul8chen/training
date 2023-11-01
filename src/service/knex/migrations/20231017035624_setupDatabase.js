/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema
    .createTable('Product', function (table) {
      table.increments('id').primary();
      table.string('name', 40).notNullable();
      table.double('price', 10, 6).notNullable();
      table.integer('sold').notNullable().defaultTo(0);
      table.integer('stock').notNullable().defaultTo(0);
      table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
      table
        .timestamp('updated_at', { precision: 0 })
        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.string('remark', 200);
    })
    .createTable('Order', function (table) {
      table.increments('id').primary();
      table.string('buyer', 40).notNullable();
      table.string('status', 20).defaultTo('PENDING');
      table.double('amount', 10, 6).notNullable();
      table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
    })
    .createTable('Purchase', function (table) {
      table.increments('id').primary();
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('Product.id')
        .onDelete('CASCADE');
      table.integer('quantity').notNullable();
      table.double('price', 10, 6).notNullable();
      table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
    })
    .createTable('OrderDetail', function (table) {
      table.increments('id').primary();
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('Product.id')
        .onDelete('CASCADE');
      table
        .integer('order_id')
        .unsigned()
        .notNullable()
        .references('Order.id')
        .onDelete('CASCADE');
      table.integer('quantity').notNullable();
      table.double('price', 10, 6).notNullable();
      table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema
    .dropTable('OrderDetail')
    .dropTable('Purchase')
    .dropTable('Order')
    .dropTable('Product');
};
