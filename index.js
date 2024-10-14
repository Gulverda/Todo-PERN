import express from 'express';
import cors from 'cors';
import { Client } from 'pg'; // Importing `Client` directly from 'pg'
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection setup
const client = new Client({
  connectionString: process.env.DATABASE_URL || null, // Use DATABASE_URL if available
  host: process.env.DB_HOST || undefined, // If DATABASE_URL is not available, fallback to .env values
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || undefined,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Enable SSL for production
});

client
  .connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Database connection error:', err.stack));

// API Routes

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).send('Server Error');
  }
});

// Add a new task
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).send('Server Error');
  }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const result = await client.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *',
      [title, description, completed, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).send('Server Error');
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
