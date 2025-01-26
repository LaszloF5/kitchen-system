import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import './Register.css'

export default function Register() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const navigate = useNavigate();

  const isHaveAcc = (e) => {
    e.preventDefault();
    navigate('/login');
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    const userName = e.target.username.value;
    const password = e.target.password.value;
    setIsWaiting(true);
    try {
      await axios.post("https://kitchen-system.onrender.com/register", {
        userName,
        password,
      });
      alert('Successfully registration!');
      navigate('/login');
    } 
    catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || "Registration failed");
      } else if (error.message === 'Network Error'){
        setErrorMessage("Network error! Please try again alter!");
      }
      console.error("Someting went wrong: ", error);
    }
    finally {
      setIsWaiting(false);
      e.target.username.value = '';
      e.target.password.value = '';
    }
  };

  return (
    <div className="register-container">
      <Helmet>
        <title>My Food Minder | Register</title>
      </Helmet>
      <form className="register-form" onSubmit={handleRegister}>
        <h3 className="register-form_h3">Register</h3>
        <input className="register-form_input" type="text" placeholder="Username" name="username" required autoComplete="false" autoFocus/>
        <input className="register-form_input" type="password" placeholder="Password" name="password" required autoComplete="false" minLength="8"/>
        {errorMessage && <p className="registration-error">{errorMessage}</p>}
        <button className="register-form_button" type="submit" disabled={isWaiting}>{isWaiting ? 'Loading...' : 'Register'}</button>
        <button className="register-form_button" type="submit" onClick={isHaveAcc}>Already have an account? Log in!</button>
      </form>
    </div>
  );
}
