import { createAxiosClient } from "../axiosFactory";
import type { AxiosInstance } from "axios";

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

// Debug interceptor to log requests/responses for the auth client
const debugAuthInterceptor = (client: AxiosInstance) => {
    client.interceptors.request.use(
        (req) => {
            try {
                console.log("authClient.request:", {
                    url: req.url,
                    method: req.method,
                    headers: req.headers,
                    data: req.data,
                });
            } catch (e) {
                console.log("authClient.request logging error", e);
            }
            return req;
        },
        (err) => {
            console.error("authClient.request error:", err);
            return Promise.reject(err);
        }
    );

    client.interceptors.response.use(
        (res) => {
            try {
                console.log("authClient.response:", { url: res.config?.url, status: res.status, data: res.data });
            } catch (e) {
                console.log("authClient.response logging error", e);
            }
            return res;
        },
        (err) => {
            console.error("authClient.response error:", {
                message: (err as any)?.message,
                response: (err as any)?.response?.data,
                status: (err as any)?.response?.status,
                config: (err as any)?.config,
            });
            return Promise.reject(err);
        }
    );
};

// FOR REFRESH TOKEN
export const authClient = createAxiosClient(backendApiUrl, [debugAuthInterceptor]);