import dotenv from 'dotenv';
import path from 'path';
import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;
const dotenvPath = path.join(__dirname, '..', '..', '..', '.env');
const seedTestPath = path.join(__dirname, 'seeds', 'test');
const migrationPath = path.join(__dirname, 'migrations');

dotenv.config({ path: dotenvPath });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

export default {
  development: {
    client: 'mysql',
    version: process.env.MYSQL_VERSION,
    connection: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      charset: process.env.MYSQL_CHARSET,
    },
    pool: {
      afterCreate: function (connection, callback) {
        connection.query(
          `SET time_zone = "${process.env.MYSQL_TIMEZONE}";`,
          function (err) {
            callback(err, connection);
          }
        );
      },
    },
    seeds: { directory: './seeds/dev' },
  },
  test: {
    client: 'mysql',
    version: process.env.MYSQL_VERSION,
    connection: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE_TEST,
      charset: process.env.MYSQL_CHARSET,
    },
    pool: {
      afterCreate: function (connection, callback) {
        connection.query(
          `SET time_zone = "${process.env.MYSQL_TIMEZONE}";`,
          function (err) {
            callback(err, connection);
          }
        );
      },
    },
    migrations: { directory: migrationPath },
    seeds: { directory: seedTestPath },
    // migrations: { directory: 'src/service/knex/migrations' },
    // seeds: { directory: 'src/service/knex/seeds/test' },
  },
};
