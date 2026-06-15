export const getEnvConfig = (
  runtimeEnv = window._env_,
  viteEnv = import.meta.env
) => ({
  backendDetectUrl:
    runtimeEnv?.VITE_BACKEND_AI_URL ||
    viteEnv.VITE_BACKEND_AI_URL,

  backendApiUrl:
    runtimeEnv?.VITE_BACKEND_API_URL ||
    viteEnv.VITE_BACKEND_API_URL,

  webhookUrl:
    runtimeEnv?.VITE_N8N_WEBHOOK_URL ||
    viteEnv.VITE_N8N_WEBHOOK_URL,
});