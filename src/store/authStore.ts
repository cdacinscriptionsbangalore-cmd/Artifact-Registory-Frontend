// auth/authStore.ts (NOT a hook)
let accessToken: string | null = null;

export const authStore = {
  getToken() {
    console.log("Getting token in authStore:", accessToken);
    return accessToken;
  },

  setToken(token: string) {
    console.log("Setting token in authStore:", token);
    try {
      // capture caller stack for debugging
      const stack = new Error().stack;
      console.log("authStore.setToken called from:\n", stack);
    } catch {}
    accessToken = token;
  },

  clear() {
    accessToken = null;
  },
};
