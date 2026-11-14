import axiosClient from "./axiosClient";

// POST /api/roadmap/generate
export const generateRoadmap = (payload = {}) => axiosClient.post("/roadmap/generate", payload);

// GET /api/roadmap
export const getRoadmaps = () => axiosClient.get("/roadmap");

// GET /api/roadmap/:id
export const getRoadmapById = (id) => axiosClient.get(`/roadmap/${id}`);
