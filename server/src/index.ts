import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import recipeRoutes from './routes/recipe.routes';
import mealPlanRoutes from './routes/mealPlan.routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import { dbService } from './services/db.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Sync database / JSON fallback
dbService.connect();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meals', mealPlanRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Production-grade server is sizzling on port ${PORT}`);
});
