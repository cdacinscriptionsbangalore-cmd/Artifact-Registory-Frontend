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
        const res = await authClient.post("/oauth2/authenticated/refresh-token");
        const { accessToken } = res.data.data;
        console.log("Received access token in OAuthCallback:", accessToken);
        loginSuccess(accessToken);
        navigate("/feed");
      } catch (error) {
        console.error("Error completing OAuth login:", error);
        logout();
        navigate("/login");
      }
    };

    completeLogin();
  }, []);

  return <CircularProgress />;
};

export default OAuthCallback;
