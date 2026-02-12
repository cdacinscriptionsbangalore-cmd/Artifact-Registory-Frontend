import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { authClient } from "@/utils/http/clients/authClient.client";
import AuthContext from "@/context/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { loginSuccess, logout } = useContext(AuthContext);

  useEffect(() => {
    const completeLogin = async () => {
      try {
        console.log("OAuthCallback: calling refresh-token to complete OAuth flow");
        const res = await authClient.post("/oauth2/authenticated/refresh-token");
        console.log("OAuthCallback: refresh response:", res && res.data);

        const accessToken = res?.data?.data?.accessToken || res?.data?.auth_token || res?.data?.token;
        console.log("OAuthCallback: computed accessToken:", accessToken);
        if (accessToken) {
          loginSuccess(accessToken);
          navigate("/feed");
        } else {
          console.warn("OAuthCallback: no access token found in response", res?.data);
          logout();
          navigate("/login");
        }
      } catch (error) {
        console.error("Error completing OAuth login:", {
          message: (error as any)?.message,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        logout();
        navigate("/login");
      }
    };

    completeLogin();
  }, []);

  return <CircularProgress />;
};

export default OAuthCallback;
