const POST_LOGIN_REDIRECT_KEY = "auth:post-login-redirect";

const isSafeInternalPath = (path: string) => {
  return path.startsWith("/") && !path.startsWith("//");
};

export const setPostLoginRedirect = (path: string) => {
  if (isSafeInternalPath(path)) {
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
  }
};

export const getPostLoginRedirect = () => {
  const value = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  if (!value || !isSafeInternalPath(value)) return null;
  return value;
};

export const clearPostLoginRedirect = () => {
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
};

export const consumePostLoginRedirect = () => {
  const value = getPostLoginRedirect();
  clearPostLoginRedirect();
  return value;
};

