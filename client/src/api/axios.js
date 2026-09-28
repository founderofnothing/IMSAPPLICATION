import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL;

export const SERVER_URL =
  API_URL.replace("/api", "");

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  (config) => {

const token =
  sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

export default API;