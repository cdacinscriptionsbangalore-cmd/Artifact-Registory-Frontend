export const getAuthToken = (): string | null => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1] || null;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = (): void => {

  // Clear the cookie by setting it to expire
  // document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=inscriptions.cdacb.in; Secure; SameSite=Lax;';


  setTimeout(() => {
    window.location.reload();
  }, 1000);
  // Redirect to login
  window.location.href = '/login';
};
