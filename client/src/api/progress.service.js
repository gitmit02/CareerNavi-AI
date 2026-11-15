import axiosClient from "./axiosClient";

// GET /api/progress
export const getAllProgress = () => axiosClient.get("/progress");

// GET /api/progress/:roadmapId
export const getProgressForRoadmap = (roadmapId) => axiosClient.get(`/progress/${roadmapId}`);

// POST /api/progress/:roadmapId/step
export const updateStepProgress = (roadmapId, stepId, completed) =>
  axiosClient.post(`/progress/${roadmapId}/step`, { stepId, completed });

// POST /api/progress/:roadmapId/weekly-update
export const addWeeklyUpdate = (roadmapId, note) =>
  axiosClient.post(`/progress/${roadmapId}/weekly-update`, { note });
