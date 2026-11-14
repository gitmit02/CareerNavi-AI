import axiosClient from "./axiosClient";

// POST /api/skill-gap/analyze
export const analyzeSkillGap = (payload) => axiosClient.post("/skill-gap/analyze", payload);
