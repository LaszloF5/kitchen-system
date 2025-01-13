import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ userId, setUserId }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const haventAcc = (e) => {
    e.preventDefault();
    navigate("/register");
  };

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
      localStorage.setItem("userId", myUserId);
      setUserId(localStorage.getItem("userId"));
      alert("Bejelentkezés sikeres!");
      console.log("A bejelentkezett felhasználó id-je: ", myUserId);
    } catch (error) {
      console.log("Bejelentkezés sikertelen", error);
      setErrorMessage("Hibás felhasználónév vagy jelszó!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOut = async () => {
    localStorage.removeItem("userId");
    setUserId(null);
    alert("Kijelentkezés sikeres!");
    console.log("Kijelentkezés sikeres!");
  };

  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No userId found in localStorage!");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible, and all your data will be deleted."
    );

    if (!confirmDelete) {
      console.log("Delete account canceled.");
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:5500/delete-account",
        {
          data: { userId },
        }
      );
      alert(response.data.message);
      localStorage.removeItem("userId");
      localStorage.removeItem("curr");
      setUserId(null);
      window.location.reload();
    } catch {
      console.error("Failed to delete account.");
      return;
    }
  };

  return (
    <div className="login-container">
      {userId && userId.length > 0 ? (
        <div className="is-logged-in-container">
          <button className="login-form_button" onClick={handleLogOut}>
            Log out
          </button>
          <button className="login-form_button" onClick={handleDeleteAccount}>
            Delete account
          </button>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleLogin}>
          <p>Login</p>
          <input
            className="login-form_input"
            type="text"
            placeholder="Username"
            name="username"
            required
            autoComplete="false"
          />
          <input
            className="login-form_input"
            type="password"
            placeholder="Password"
            name="password"
            required
            autoComplete="false"
          />
          <button
            className="login-form_button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Log in"}
          </button>
          <button
            className="login-form_button"
            type="submit"
            onClick={haventAcc}
          >
            0 acc? Reg
          </button>
        </form>
      )}
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
}
