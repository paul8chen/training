import { redisConnection } from './service/redis/connection.js';

export default async () => {
  const setupDatabase = async () => {
    await redisConnection.connect();
  };

  await setupDatabase();
};
