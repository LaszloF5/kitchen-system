import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validUserId, setValidUserId] = useState('');

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
      const userId = response.data.userId;
      localStorage.setItem('userId', userId);
      setValidUserId(localStorage.getItem('userId'));
      alert("Bejelentkezés sikeres!");
      console.log('A bejelentkezett felhasználó id-je: ', userId);
    } catch (error) {
      console.log("Bejelentkezés sikertelen", error);
      setErrorMessage("Hibás felhasználónév vagy jelszó!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('userId');
    setValidUserId('');
    alert("Kijelentkezés sikeres!");
    console.log("Kijelentkezés sikeres!");
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="userName" name="username" required />
        <input type="password" placeholder="Password" name="password" required />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Bejelentkezés..." : "Login"}
        </button>
      </form>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      {validUserId.length > 0 && <button onClick={handleLogOut}>Kijelentkezés</button>}
    </div>
  );
}
