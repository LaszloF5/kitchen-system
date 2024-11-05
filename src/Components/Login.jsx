import React, { useState } from "react";
import axios from 'axios';

export default function Login({setRenderToken}) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5500/login', {username: userName, password});
        const receivedToken = response.data.token;
        const receivedUserName = response.data.username;
        setToken(receivedToken);
        setRenderToken(receivedToken);
        setUserName(receivedUserName);
        localStorage.setItem("token", receivedToken);
    } catch (error) {
        console.error("Error:", error.message);
    }
  }

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    alert('Logout successful.');
  }

  return (
    <>
    {!token ? (<form onSubmit={handleLogin}>
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
    </form>) : (
      <>
      <h2>Welcome, {userName}!</h2>
      <button onClick={handleLogout}>Logout</button>
      </>
    )}
    </>
  );
}
