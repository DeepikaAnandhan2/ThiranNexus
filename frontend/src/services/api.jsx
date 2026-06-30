import axios from "axios";

const api = axios.create({
  baseURL: "https://thirannexus.onrender.com/api",
});

export default api;