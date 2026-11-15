import axiosClient from "./axiosClient";

// GET /api/ai/usage
export const getAiUsage = () => axiosClient.get("/ai/usage");
