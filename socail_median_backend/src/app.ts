import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import likeRoutes from './routes/like.routes';
import followRoutes from './routes/follow.routes';

// Import models for sequelize sync
import { connectDB } from './config/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/follows', followRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Social Media API' });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    // Sync database models

    connectDB();
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
});
