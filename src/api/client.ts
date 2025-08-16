import axios from "axios";

const API_BASE =
  (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); // no trailing slash

export const api = axios.create({
  baseURL: API_BASE,           // e.g. https://ai-powered-backend-fcty.onrender.com
  withCredentials: true,       // <-- send cookies for session auth
  headers: { "Content-Type": "application/json" },
});
