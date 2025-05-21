import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Sequelize instance
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'social_media',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
