import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Required for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// API routes first
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// -----------------------------
// Serve React frontend
// -----------------------------
const frontendPath = path.join(__dirname, 'public'); // after build, copy React files here
app.use(express.static(frontendPath));

// Any route not starting with /api should serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
