import { type AxiosInstance } from "axios";

export const errorInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        // Dispatch a global event so React context can handle logout and UI updates
        try {
          // console.error(
          //   "[AUTH] Unauthorized dispatched from error.interceptor"
          // );
          window.dispatchEvent(new CustomEvent('app:unauthorized'));
        } catch (e) {
          // fallback to hard navigation if CustomEvent is not supported
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
};
