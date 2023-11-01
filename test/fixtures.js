import knex from '../src/service/knex/index.js';

// export async function mochaGlobalSetup() {
//   await knex.migrate.up();
//   await knex.seed.run({ specific: 'seed.js' });
// }

// export async function mochaGlobalTeardown() {
//   await knex.migrate.down();
// }

export const mochaHooks = {
  async afterEach() {
    await knex.migrate.down();
  },

  async beforeEach() {
    await knex.migrate.up();
    await knex.seed.run({ specific: 'seed.js' });
  },
};
