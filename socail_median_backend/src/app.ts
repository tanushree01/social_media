import express from 'express';
import userRoutes from './routes/user.routes';
import { sequelize } from './config/database';

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.error('DB connection failed:', err));

export default app;
