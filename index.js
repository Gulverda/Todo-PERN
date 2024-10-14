import express from "express";
import cors from "cors";
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Database connection
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


client.connect();

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Add a new task
app.post("/tasks", async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await client.query(
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
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body; // Ensure completed is included
  try {
    const result = await client.query(
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
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await client.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
