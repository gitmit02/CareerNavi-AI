import axiosClient from "./axiosClient";

// POST /api/auth/register
export const registerUser = (payload) => axiosClient.post("/auth/register", payload);

// POST /api/auth/login
export const loginUser = (payload) => axiosClient.post("/auth/login", payload);
