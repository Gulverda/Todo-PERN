import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create a new Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Add a new task
app.post("/api/tasks", async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *",
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body; 
  try {
    const result = await pool.query(
      "UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *",
      [title, description, completed, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Export the app as a serverless function
export default app;
