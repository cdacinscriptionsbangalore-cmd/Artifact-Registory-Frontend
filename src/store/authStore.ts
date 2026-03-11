// auth/authStore.ts (NOT a hook)
let accessToken: string | null = null;

export const authStore = {
  getToken() {
    console.log("Getting token in authStore:", accessToken);
    return accessToken;
  },

  setToken(token: string) {
    console.log("Setting token in authStore:", token);
    accessToken = token;
  },

  clear() {
    accessToken = null;
  },
};
