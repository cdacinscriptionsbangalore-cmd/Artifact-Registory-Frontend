import { createAxiosClient } from "../axiosFactory";
import { attachAuthToken } from "../interceptors/authRequest.interceptor";
import { errorInterceptor } from "../interceptors/error.interceptor";
import { refreshTokenInterceptor } from "../interceptors/refreshToken.interceptor";
import { retryInterceptor } from "../interceptors/retry.interceptor";
const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

// FOR CALLING BACKEND APIS WITH AUTHENTICATION AND RETRY LOGIC
export const coreBackendClient = createAxiosClient(
  backendApiUrl,
  [
    attachAuthToken,
    refreshTokenInterceptor, 
    retryInterceptor, 
    errorInterceptor
  ]
);
