import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Register.css'

export default function Register() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const navigate = useNavigate();

  const isHaveAcc = (e) => {
    e.preventDefault();
    navigate('/Login');
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    const userName = e.target.username.value;
    const password = e.target.password.value;
    setIsWaiting(true);
    try {
      const response = await axios.post("http://localhost:5500/register", {
        userName,
        password,
      });
      console.log("Sikeres regisztráció", response.data);
      alert('Sikeres regisztráció!');
    } 
    catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || "Sikertelen regisztráció");
      } else {
        setErrorMessage("Hálózati hiba történt");
      }
      console.log("Hiba történt:", error);
    }
    finally {
      setIsWaiting(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <p>Register</p>
        <input className="register-form_input" type="text" placeholder="Username" name="username" required autoComplete="false" autoFocus/>
        <input className="register-form_input" type="password" placeholder="Password" name="password" required autoComplete="false"/>
        <button className="register-form_button" type="submit" disabled={isWaiting}>{isWaiting ? 'Loading...' : 'Register'}</button>
        <button className="register-form_button" type="submit" onClick={isHaveAcc}>Already have an account? Log in!</button>
      </form>
      {/* Csak akkor rendereljük a hibát, ha van */}
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
}
