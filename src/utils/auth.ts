import AuthContext from "@/context/AuthContextType";
import { authStore } from "@/store/authStore";
import { useContext } from "react";

export const logout = (): void => {
  authStore.clear();
  const authCtx = useContext(AuthContext);
  authCtx.clear();
};