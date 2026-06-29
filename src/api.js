import axios from "axios";

// This will use your Vercel VITE_API_URL, 
// or default to localhost if the variable isn't found.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // This is very important for your login sessions
});

export default api;