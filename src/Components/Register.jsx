import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const userName = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post("http://localhost:5500/register", {
        userName,
        password,
      });
      console.log("Sikeres regisztráció", response.data);
      alert('Sikeres regisztráció!');
    } catch (error) {
      if (error.response) {
        // Backend válasza
        // Ha van hibaüzenet, szöveggé alakítjuk
        setErrorMessage(error.response.data.error || "Sikertelen regisztráció");
      } else {
        // Más típusú hiba (pl. hálózati hiba)
        setErrorMessage("Hálózati hiba történt");
      }
      console.log("Hiba történt:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="userName" name="username" required />
        <input type="password" placeholder="Password" name="password" required />
        <button type="submit">Regisztráció</button>
      </form>
      {/* Csak akkor rendereljük a hibát, ha van */}
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
}
