import React, { useState } from "react";
import DeleteUser from "./DeleteUser";
import axios from "axios";
import './Login.css'

export default function Login({ setRenderToken, setIsVisibleLoginForm }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5500/login", {
        username: userName,
        password,
      });
      const receivedToken = response.data.token;
      const receivedUserName = response.data.username;
      setToken(receivedToken);
      setRenderToken(receivedToken);
      setUserName(receivedUserName);
      localStorage.setItem("token", receivedToken);
      setIsVisibleLoginForm(false);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setRenderToken("");
    alert("Logout successful.");
  };

  return (
    <>
      {!token ? (
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="loginH2">Log in!</h2>
          <label htmlFor="LoginuserNameId">
            Username:
            <input
              type="text"
              name="LoginuserName"
              id="LoginuserNameId"
              placeholder="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </label>
          <label htmlFor="LoginPasswordId">
            Password:
            <input
              type="password"
              name="password"
              id="LoginPasswordId"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Login</button>
        </form>
      ) : (
        <>
          <h2>Welcome, {userName}!</h2>
          <DeleteUser />
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </>
  );
}
