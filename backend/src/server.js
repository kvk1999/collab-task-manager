import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// --- Serve frontend build ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// If you're using CRA: "build"
// If you're using Vite: "dist"
const frontendPath = path.join(__dirname, 'build');  // or 'dist'
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});
// ----------------------------

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
