import axios, { type AxiosInstance } from "axios";

type InterceptorFn = (client: AxiosInstance) => void;

export function createAxiosClient(
  baseURL: string,
  interceptors: InterceptorFn[] = [],
  withCredentials: boolean = true
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    withCredentials: withCredentials,
  });

  interceptors.forEach((attach) => attach(client));

  return client;
}
