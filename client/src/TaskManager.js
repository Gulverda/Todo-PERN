import React, { useEffect, useState } from "react";
import axios from "axios";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get("http://localhost:5000/tasks");
      setTasks(response.data);
    };
    fetchTasks();
  }, []);

  // Add a new task
  const addTask = async () => {
    const response = await axios.post("http://localhost:5000/tasks", newTask);
    setTasks([...tasks, response.data]);
    setNewTask({ title: "", description: "" });
  };

  // Update a task
  const updateTask = async (id, updatedTask) => {
    const response = await axios.put(`http://localhost:5000/tasks/${id}`, {
      title: updatedTask.title,
      description: updatedTask.description,
      completed: !updatedTask.completed, // Toggle the completed status
    });
    setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
  };

  // Delete a task
  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/tasks/${id}`);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <div>
        <input
          type="text"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>Status: {task.completed ? "Completed" : "Incomplete"}</p>
            <button onClick={() => updateTask(task.id, task)}>
              {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
            </button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
