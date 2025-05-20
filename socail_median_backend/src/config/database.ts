import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('', 'root', '', {
  host: 'localhost',
  port: 3306, // default MySQL port in XAMPP
  dialect: 'mysql',
});
