import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5500/",
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("Server is unreachable, logging out user...");
      localStorage.removeItem("userId");
      alert("Server connection lost. You have been logged out.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Ezt a megoldást majd tesztelni kell, egyelőre nincs élesítve.