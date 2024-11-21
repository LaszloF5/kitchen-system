import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

export default function Register({ alreadyHaveAcc, setIsVisibleRegisterForm }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (userName === undefined || userName === null) {
      return;
    }
    console.log(userName);
    try {
      await axios.post("http://localhost:5500/register", {
        username: userName,
        password,
      });
      setUserName("");
      setPassword("");
      setIsVisibleRegisterForm(false);
      alert("Registration successful.");
    } catch {
      console.error("Failed to register user");
      setError("Registration failed. Please try again.");
      return;
    }
  };

  return (
    <form className="register-form" onSubmit={handleRegister}>
      <h2 className="registerH2">New account?</h2>
      <label htmlFor="newUserName">
        Username:
        <input
          type="text"
          name="newUserName"
          id="newUserName"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </label>
      <label htmlFor="newPassword">
        Password:
        <input
          type="password"
          name="newPassword"
          id="newPassword"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Register</button>
      <button className="SecondBtn" onClick={alreadyHaveAcc}>
        Already have an account? Log in!
      </button>
    </form>
  );
}
