import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/todos");
      setTodos(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des todos :", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim() === "") return;
    try {
      const response = await axios.post("http://127.0.0.1:8000/todos", {
        title: newTodo,
        completed: false,
      });
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du todo :", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du todo :", error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = {
        title: todoToUpdate.title,
        completed: !todoToUpdate.completed,
      };

      const response = await axios.put(`http://127.0.0.1:8000/todos/${id}`, updatedTodo);
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du todo :", error);
    }
  };

  return (
    <div className="container">
      <h1>Todo List</h1>
      <div className="form-group">
        <input
          type="text"
          placeholder="Ajouter une tâche"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo}>Ajouter</button>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <span
              className={`todo-title ${todo.completed ? "completed" : ""}`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.title} {todo.completed ? "(Fait)" : "(À faire)"}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
