import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const userId = localStorage.getItem("userId");
    if (userId) config.headers["x-user-id"] = userId;
    return config;
});
