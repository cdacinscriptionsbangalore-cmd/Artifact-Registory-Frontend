import axios, { type AxiosInstance } from "axios";

type InterceptorFn = (client: AxiosInstance) => void;

export function createAxiosClient(
  baseURL: string,
  interceptors: InterceptorFn[] = [],
  timeout: number = 15000,
  withCredentials: boolean = true
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    withCredentials,
  });

  interceptors.forEach((attach) => attach(client));

  return client;
}
