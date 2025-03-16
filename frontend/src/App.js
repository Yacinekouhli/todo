import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Fonction pour récupérer la liste des todos depuis le backend
  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/todos");
      setTodos(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des todos :", error);
    }
  };

  // Charge les todos au montage du composant
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fonction pour ajouter un nouveau todo (POST)
  const addTodo = async () => {
    if (newTodo.trim() === "") return;
    try {
      const response = await axios.post("http://127.0.0.1:8000/todos", {
        title: newTodo,
        completed: false,
      });
      // Ajoute le nouveau todo à la liste
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du todo :", error);
    }
  };

  // Fonction pour supprimer un todo (DELETE)
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}`);
      // Supprime le todo de la liste locale
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du todo :", error);
    }
  };

  // Fonction pour mettre à jour (basculer) le statut "completed" d'un todo (PUT)
  const toggleTodo = async (id) => {
    try {
      // Trouve le todo à mettre à jour
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (!todoToUpdate) return;

      // Prépare les données mises à jour : on inverse le statut "completed"
      const updatedTodo = {
        title: todoToUpdate.title,
        completed: !todoToUpdate.completed,
      };

      // Envoie la requête PUT pour mettre à jour le todo
      const response = await axios.put(`http://127.0.0.1:8000/todos/${id}`, updatedTodo);
      
      // Met à jour la liste locale des todos avec la réponse du backend
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du todo :", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Todo List</h1>
      <input
        type="text"
        placeholder="Ajouter une tâche"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
      />
      <button onClick={addTodo}>Ajouter</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={{ margin: "10px 0" }}>
            {/* Le titre est cliquable pour basculer son état "completed" */}
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
                marginRight: "10px",
              }}
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
