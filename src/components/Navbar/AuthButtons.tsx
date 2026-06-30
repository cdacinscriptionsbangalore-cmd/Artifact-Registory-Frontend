import AuthContext from "@/context/AuthContext";
import { LogIn, LogOut, Settings } from "lucide-react";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import { useContext, useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearPostLoginRedirect, setPostLoginRedirect } from "@/utils/postLoginRedirect";
import { Divider, Menu, MenuItem } from "@mui/material";
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import { PROFILE_UPDATED_EVENT, type ProfileUpdateDetail } from "@/utils/profileEvents";

const backendApiUrl =
  window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

const normalizeUserImageUrl = (rawUrl?: string | null): string => {
  if (!rawUrl) return "";

  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const match = trimmed.match(/\/user\/public\/images\/([^/?#]+)/);
  if (match?.[1] && backendApiUrl) {
    const imageId = match[1];
    try {
      return new URL(`user/public/images/${imageId}`, backendApiUrl).toString();
    } catch {
      return `${backendApiUrl.replace(/\/+$/, "")}/user/public/images/${imageId}`;
    }
  }

  return trimmed;
};

const getInitials = (name?: string) => {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const AuthButtons = ({ authenticated }: { authenticated: boolean | null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [authMenuAnchorEl, setAuthMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const isAuthMenuOpen = Boolean(authMenuAnchorEl);

  useEffect(() => {
    if (authenticated) {
      const fetchUserProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const response = await coreBackendClient.post("post/userProfile");
          const user = response.data?.data;
          setUserData(user);
          if (user?.profileImage) {
            setUserProfileImage(normalizeUserImageUrl(user.profileImage));
          } else {
            setUserProfileImage("");
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setIsLoadingProfile(false);
        }
      };

      fetchUserProfile();
    } else {
      setUserData(null);
      setUserProfileImage("");
    }
  }, [authenticated]);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdateDetail>).detail;
      if (!detail) return;

      setUserData((currentUser: any) => ({
        ...(currentUser || {}),
        ...detail,
      }));

      if ("profileImage" in detail) {
        setUserProfileImage(normalizeUserImageUrl(detail.profileImage));
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
  }, []);

  const handleOpenAuthMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAuthMenuAnchorEl(event.currentTarget);
  };

  const handleCloseAuthMenu = () => {
    setAuthMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    clearPostLoginRedirect();
    setUserData(null);
    setUserProfileImage("");
    handleCloseAuthMenu();
    navigate("/login", { replace: true });
  };

  if (authenticated === null) {
    return <div className="h-10 w-10 rounded-full bg-gray-200" aria-hidden="true" />;
  }

  if (authenticated) {
    const displayName = userData?.username || userData?.name || "User";
    const initials = getInitials(displayName);

    return (
      <>
        <button
          onClick={handleOpenAuthMenu}
          aria-controls={isAuthMenuOpen ? "auth-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isAuthMenuOpen ? "true" : undefined}
          className="flex items-center justify-center rounded-full border-2 border-orange-500 hover:border-orange-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          disabled={isLoadingProfile}
        >
          {userProfileImage ? (
            <img
              alt={displayName}
              src={userProfileImage}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setUserProfileImage("")}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
        </button>

        <Menu
          id="auth-menu"
          className="mt-4"
          anchorEl={authMenuAnchorEl}
          open={isAuthMenuOpen}
          onClose={handleCloseAuthMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem className="space-x-3" style={{cursor:"auto"}}>
            {userProfileImage ? (
              <img
                alt={displayName}
                src={userProfileImage}
                className="w-10 h-10 cursor-auto rounded-full object-cover border-2 border-orange-500 hover:border-orange-800 transition-colors"
                onError={() => setUserProfileImage("")}
              />
            ) : (
              <div className="w-10 h-10 cursor-auto rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
            {userData?.username || userData?.name || "User"}
          </MenuItem>
          <Divider sx={{ width: "90%", margin: "0 auto" }} />
          <MenuItem onClick={() => { }} className="px-3 py-2">
            <AccountBoxOutlinedIcon className=" mr-2 " sx={{ width: "1rem", height: "1rem", strokeWidth: "0.1", stroke: "currentColor" }} />
            <NavLink to="/profile" onClick={handleCloseAuthMenu} className="">Profile</NavLink>
          </MenuItem>
          <MenuItem onClick={() => { }} className="px-3 py-2 ">
            <Settings className="w-4 h-4 mr-2" />
            <span className="">Settings</span>
          </MenuItem>
          <MenuItem onClick={handleLogout} className="px-3 py-2 borderRed">
            <LogOut className="w-4 h-4 mr-2 text-red-500" />
            <span className="text-red-500">Logout</span>
          </MenuItem>
        </Menu>
      </>
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
