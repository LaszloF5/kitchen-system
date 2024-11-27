import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

export default function Register({
  alreadyHaveAcc,
  goToLogin,
  setGoToLogin,
}) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (goToLogin) {
      navigate("/login");
      setGoToLogin(false);
    }
  }, [goToLogin, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (
      userName === undefined ||
      userName === null ||
      userName.trim().length <= 2
    ) {
      console.log("A felhasználónévnek minimum 3 karakternek kell lennie.");
      return;
    }

    if (password.length < 6) {
      console.log("A jelszónak minimum 6 karakter hosszúnak kell lennie.");
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
      alert("Registration successful.");
    } catch {
      console.error("Failed to register user");
      setError("Registration failed. Please try again.");
      return;
    }
  };

  return (
    <div className="form-div">
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
    </div>
  );
}
