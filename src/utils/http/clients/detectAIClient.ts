import { createAxiosClient } from "../axiosFactory";

const backendApiUrl = window._env_?.VITE_BACKEND_AI_URL || import.meta.env.VITE_BACKEND_AI_URL;
// FOR CALLING PUBLIC BACKEND APIS

export const detectAIClient = createAxiosClient(
    backendApiUrl, 
    [], 
    500000,
    false
)