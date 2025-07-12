const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const columnRoutes = require('./routes/column');
const taskRoutes = require('./routes/task');

// Middleware
app.use(cors({
  origin: [
    'https://smart-collab-snowy.vercel.app',
    'http://localhost:5174'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

module.exports = app; 