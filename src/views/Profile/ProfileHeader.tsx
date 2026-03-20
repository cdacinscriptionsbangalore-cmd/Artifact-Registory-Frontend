import type React from "react";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import { SquarePen } from "lucide-react";
import coverPhoto from "@assets/banner111.jpg"
import { Snackbar, Alert, Slide } from "@mui/material";
import EditProfileModal from "./EditProfileModal";
import ShareProfileModal from "./ShareProfileModal";

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

interface ProfileHeaderProps {
  user: User;
}


const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [displayModal, setDisplayModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [profileName, setProfileName] = useState(user?.username || user?.name || "");
  const [bio, setBio] = useState(user?.bio || "Archaeology enthusiast & digital volunteer");
  const [profileImage, setProfileImage] = useState(normalizeUserImageUrl(user?.profileImage));
  const [coverImage, setCoverImage] = useState(normalizeUserImageUrl(user?.coverImage));

  useEffect(() => {
    setProfileName(user?.username || user?.name || "");
    setBio(user?.bio || "Archaeology enthusiast & digital volunteer");
    setProfileImage(normalizeUserImageUrl(user?.profileImage));
    setCoverImage(normalizeUserImageUrl(user?.coverImage));
  }, [user]);

  const handleSetProfileImage = (imageUrl: string) => {
    setProfileImage(normalizeUserImageUrl(imageUrl));
  };

  const handleSetCoverImage = (imageUrl: string) => {
    setCoverImage(normalizeUserImageUrl(imageUrl));
  };

  const handleOpenModal = () => setDisplayModal(true);
  const handleCloseModal = () => setDisplayModal(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditSuccess = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleEditError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  };

  const coverSrc = coverImage || coverPhoto;

  const getInitials = (name?: string) => {
    if (!name) return 'U';

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative rounded-lg pt-6 pb-6 mb-50 border-1 border-slate-800/50 min-h-[200px] md:min-h-[400px]">
      <img
        key={coverSrc}
        src={coverSrc}
        alt="Profile cover"
        className="absolute inset-0 h-full w-full rounded-lg object-cover object-center pointer-events-none select-none z-0"
        onError={() => setCoverImage("")}
      />
      <EditProfileModal
        userName={profileName || user.username || user.name}
        display={displayModal}
        onClose={handleCloseModal}
        onEditSuccess={handleEditSuccess}
        onEditError={handleEditError}
        setProfileName={setProfileName}
        setProfileImage={handleSetProfileImage}
        setCoverImage={handleSetCoverImage}
        bio={bio}
        setBio={setBio}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div className="flex flex-col items-center z-20" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translate(-50%, 78%)", backgroundColor: "none" }}>
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt={profileName || user.username || user.name || "Profile Image"}
              className="w-20 h-20 rounded-full border-2 border-orange-500 object-cover"
              onError={() => setProfileImage("")}
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-orange-500 bg-gray-600 flex items-center justify-center text-3xl font-bold text-white">
              {getInitials(profileName || user.username || user.name)}
            </div>
          )}
        </div>

        <div className="flex-1 sm:text-center mt-4 w-100 text-center">
          <h1 className="text-2xl font-bold text-black mb-2 capitalize">{profileName || user.username || user.name}</h1>
          <p className="text-black mb-4">{bio}</p>

          <div className="flex gap-2 justify-center sm:justify-center">
            <button onClick={handleOpenModal} className="flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <SquarePen className="h-4 w-4" />
              Edit Profile
            </button>
            <ShareProfileModal />
            {/* <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer">
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
