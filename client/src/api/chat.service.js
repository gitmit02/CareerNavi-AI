import axiosClient from "./axiosClient";

// POST /api/chat/ask
export const askMentor = (question) => axiosClient.post("/chat/ask", { question });
