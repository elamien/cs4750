import express from 'express';
import cors from 'cors';
import { testDbConnection } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import route modules
import eventsRoutes from './routes/events.js';
import usersRoutes from './routes/users.js';
import bandsRoutes from './routes/bands.js';
import fillInRequestsRoutes from './routes/fillInRequests.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
testDbConnection();

// Basic route
app.get('/', (req, res) => {
  res.send('HooJams Backend is running! (Modular Version)');
});

// API Routes
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bands', bandsRoutes);
app.use('/api/fill-in-requests', fillInRequestsRoutes);

// Keep the legacy event-requests endpoint for compatibility
app.use('/api/event-requests', eventsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (Modular)`);
}); 