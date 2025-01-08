import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login({userId, setUserId}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const haventAcc = (e) => {
    e.preventDefault();
    navigate('/register');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const userName = e.target.username.value;
    const password = e.target.password.value;
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5500/login", {
        userName,
        password,
      });
      console.log("Bejelentkezés sikeres", response.data);
      const myUserId = response.data.userId;
      localStorage.setItem('userId', myUserId);
      setUserId(localStorage.getItem('userId'));
      alert("Bejelentkezés sikeres!");
      console.log('A bejelentkezett felhasználó id-je: ', myUserId);
    } catch (error) {
      console.log("Bejelentkezés sikertelen", error);
      setErrorMessage("Hibás felhasználónév vagy jelszó!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    alert("Kijelentkezés sikeres!");
    console.log("Kijelentkezés sikeres!");
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <p>Login</p>
        <input className="login-form_input" type="text" placeholder="Username" name="username" required />
        <input className="login-form_input" type="password" placeholder="Password" name="password" required />
        <button className="login-form_button" type="submit" disabled={isLoading}>
          {isLoading ? "Bejelentkezés..." : "Login"}
        </button>
        <button className="login-form_button" type="submit" onClick={haventAcc}>0 acc? Reg</button>
      </form>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      {(userId && userId.length > 0) ? <button onClick={handleLogOut}>Kijelentkezés</button> : ''}
    </div>
  );
}
