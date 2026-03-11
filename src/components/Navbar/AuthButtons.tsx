import AuthContext from "@/context/AuthContext";
import { LogIn, LogOut } from "lucide-react";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearPostLoginRedirect, setPostLoginRedirect } from "@/utils/postLoginRedirect";

const AuthButtons = ({ authenticated }: { authenticated: boolean | null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  if (authenticated === null) {
    return <div className="h-10 w-24" aria-hidden="true" />;
  }

  if (authenticated) {
    return (
      <button
        onClick={async () => {
          await logout();
          clearPostLoginRedirect();
          navigate("/login", { replace: true });
        }}
        className="flex items-center gap-2 bg-primary-dark text-white border-2 border-white px-4 py-2 rounded-lg cursor-pointer"
      >
        <LogOut /> Logout
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        const next = new URLSearchParams(location.search).get("next") || "";
        if (location.pathname === "/login" && next.startsWith("/") && !next.startsWith("//")) {
          setPostLoginRedirect(next);
          return;
        }

        clearPostLoginRedirect();
        navigate("/login", { replace: true });
      }}
      className="flex items-center gap-2 text-white bg-primary-light border-2 border-white px-4 py-2 rounded-lg cursor-pointer"
    >
      <LogIn /> Login
    </button>
  );
};

export default AuthButtons;
