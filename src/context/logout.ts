const logout = async () => {
    forceLoggedOutState({
      reason: "manual-logout",
      broadcast: true,
      redirect: false,
      preserveCurrentPath: false,
    });
    try {
      const res = await apiClient.post("/oauth2/logout");
      console.log("Logout response:", res);
      if (res.status === 200) {
        console.log("Logout successful");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Logout failed:", {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      });
      return false;
    }
  };