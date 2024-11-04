import React, { useState } from "react";
import axios from 'axios';

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5500/login', {userName, password});
        setToken(response.data.token);
        alert('Login successful.');
    } catch (error) {
        console.error("Error:", error.message);
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="userName"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button>Login</button>
    </form>
  );
}
