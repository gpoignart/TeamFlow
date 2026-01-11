const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db, initDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const messageRoutes = require('./routes/messages');
const statsRoutes = require('./routes/stats');
const teamRoutes = require('./routes/teams');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/messages', messageRoutes);
app.use('/stats', statsRoutes);
app.use('/teams', teamRoutes);

const PORT = process.env.PORT || 5000;

// Initialize the database
initDB()
  .then(() => {
    console.log('Database initialized:', db.data);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
