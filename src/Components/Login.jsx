import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ userId, setUserId }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toggleChangePw, settoggleChangePw] = useState(false);
  const navigate = useNavigate();

  const visibleChangePwForm = () => {
    settoggleChangePw(!toggleChangePw);
  };

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
      navigate("/");
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
    settoggleChangePw(false);
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
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
      settoggleChangePw(false);
      window.location.reload();
    } catch {
      console.error("Failed to delete account.");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const oldPassword = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;
  
    if (!userId) {
      console.error("No userId found in localStorage!");
      return;
    }
  
    if (!oldPassword || !newPassword) {
      console.error("Missing required fields.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:5500/change-password",
        {
          userId,
          oldPassword,
          newPassword,
        }
      );
  
      if (response.status === 200) {
        alert("Password changed successfully!");
        console.log("Password changed successfully!");
        e.target.oldPassword.value = '';
        e.target.newPassword.value = '';
        settoggleChangePw(false);
      } else {
        alert(`Error: ${response.data.error}`);
      }
    } catch (err) {
      console.error("Failed to change password:", err.message);
      alert("Failed to change password.");
    }
  };
  

  return (
    <div className="login-container">
      {userId && userId.length > 0 ? (
        <div className="is-logged-in-container">
          <button className="login-form_button" disabled={isLoading} onClick={handleLogOut}>
            {isLoading ? "Loading..." : "Log out"}
          </button>
          <button className="login-form_button" onClick={visibleChangePwForm}>Change password</button>
          <button className="login-form_button" onClick={handleDeleteAccount}>
            Delete account
          </button>
        {toggleChangePw &&  <form className="change-pw-form" onSubmit={handleChangePassword}>
        <label className="change-pw-form_label" htmlFor="oldPassword">
          Current password
          <input
          className="change-pw-form_input"
            type="password"
            name="oldPassword"
            id="oldPassword"
            required
            autoComplete="false"
          />
        </label>
        <label className="change-pw-form_label" htmlFor="newPassword">
          New password
          <input
          className="change-pw-form_input"
            type="password"
            name="newPassword"
            id="newPassword"
            required
            autoComplete="false"
          />
        </label>
        <button className="change-pw-form_button" type="submit" disabled={isLoading}>{isLoading ? "Loading..." : "Change password"}</button>
      </form>}
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
