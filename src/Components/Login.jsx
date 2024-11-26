import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Login.css'

export default function Login({ token, setToken, setRenderToken, setIsVisibleLoginForm }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token])

  return (
    <>
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="loginH2">Log in!</h2>
          <label htmlFor="LoginuserName">
            Username:
            <input
              type="text"
              name="LoginuserName"
              id="LoginuserName"
              placeholder="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </label>
          <label htmlFor="LoginPassword">
            Password:
            <input
              type="password"
              name="LoginPassword"
              id="LoginPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Login</button>
        </form>
    </>
  );
}
