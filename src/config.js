import 'dotenv/config';

class Config {
  NODE_ENV = process.env.NODE_ENV || 'development';
  CLIENT_URL = process.env.CLIENT_URL || '';
  SERVER_PORT = process.env.SERVER_PORT || '';
  SERVER_PORT_TEST = process.env.SERVER_PORT_TEST || '';
  BASE_PATH = process.env.BASE_PATH || '';
  API_VERSION = process.env.API_VERSION || '';
  MYSQL_VERSION = process.env.MYSQL_VERSION || '';
  MYSQL_HOST = process.env.MYSQL_HOST || '';
  MYSQL_PORT = process.env.MYSQL_PORT || '';
  MYSQL_USER = process.env.MYSQL_USER || '';
  MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
  MYSQL_DATABASE = process.env.MYSQL_DATABASE || '';
  MYSQL_DATABASE_TEST = process.env.MYSQL_DATABASE_TEST || '';
  MYSQL_CHARSET = process.env.MYSQL_CHARSET || 'utf8mb4';
  MYSQL_TIMEZONE = process.env.MYSQL_TIMEZONE || '+08:00';
  REDIS_HOST = process.env.REDIS_HOST || '';
  REDIS_PORT = process.env.REDIS_PORT || '';
  BASE_ITEMS_PER_PAGE = process.env.ITEMS_PER_PAGE || 20;
  BASE_PAGE = process.env.BASE_PAGE || 1;
  BASE_ORDER = process.env.BASE_ORDER || 'desc';
  UUID_NAMESPACE = process.env.UUID_NAMESPACE || '';
  REDIS_RETRY_DELAY_TIME_S = process.env.REDIS_RETRY_DELAY_TIME_S || 1;
  REDIS_LOCK_EXPIRY_TIME_S = process.env.REDIS_LOCK_EXPIRY_TIME_S || 5;

  validateConfig() {
    for (const [key, val] of Object.entries(this)) {
      if (!val) throw new Error(`Config ${key} is undefined`);
    }
  }
}

export default new Config();
