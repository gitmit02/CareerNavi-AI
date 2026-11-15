import axiosClient from "./axiosClient";

// GET /api/opportunities/roles?skills=
export const getMatchedRoles = (params = {}) => axiosClient.get("/opportunities/roles", { params });

// GET /api/opportunities/search
export const searchOpportunities = (params = {}) => axiosClient.get("/opportunities/search", { params });

// GET /api/opportunities/:id
export const getOpportunity = (id) => axiosClient.get(`/opportunities/${id}`);

// POST /api/opportunities/:id/analyze  (AI explanation + prep roadmap; cached server-side)
export const analyzeOpportunity = (id, refresh = false) =>
  axiosClient.post(`/opportunities/${id}/analyze`, { refresh }, { timeout: 90000 });
