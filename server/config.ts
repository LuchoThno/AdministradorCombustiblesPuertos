import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/port-fuel-management',
  jwtSecret: process.env.JWT_SECRET ?? 'change-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  seedDemoData: process.env.SEED_DEMO_DATA !== 'false',
};
