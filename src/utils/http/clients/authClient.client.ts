import { createAxiosClient } from "../axiosFactory";

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

// FOR REFRESH TOKEN
export const authClient = createAxiosClient(
    backendApiUrl, []
)