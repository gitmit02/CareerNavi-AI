import axiosClient from "./axiosClient";

// GET /api/users/profile
export const getProfile = () => axiosClient.get("/users/profile");

// PUT /api/users/profile
export const updateProfile = (payload) => axiosClient.put("/users/profile", payload);
