import type React from "react";
import { useState } from "react";
import type { User } from "@/types";
import { Share, SquarePen } from "lucide-react";
// import profileImg from "@assets/user/profile.png";
import coverPhoto from "@assets/banner111.jpg"
import { Snackbar, Alert, Slide } from "@mui/material";
import EditProfileModal from "./EditProfileModal";
import ShareProfileModal from "./ShareProfileModal";
interface ProfileHeaderProps {
  user: User;
}


const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [displayModal, setDisplayModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("Archaeology enthusiast & digital volunteer");

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
    <div className="rounded-lg pt-6 pb-6 mb-50 border-1 border-slate-800/50 min-h-[200px] md:min-h-[400px] bg-center bg-fill md:bg-cover bg-no-repeat" style={{ background: `url(${coverPhoto})`, position: "relative", backgroundSize: "cover", backgroundPosition: "center" }}>
      <EditProfileModal
        userName={user.name}
        display={displayModal}
        onClose={handleCloseModal}
        onEditSuccess={handleEditSuccess}
        onEditError={handleEditError}
        setProfileName={setProfileName}
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
      <div className="flex flex-col items-center" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translate(-50%, 78%)", backgroundColor: "none" }}>
        <div className="relative">
          {/* only the first leter of the name */}
          <div className="w-20 h-20 rounded-full border-2 border-orange-500 bg-gray-600 flex items-center justify-center text-3xl font-bold text-white">
            {/* {profileName.trim.length >= 1 ? profileName.charAt(0).toUpperCase()+"asd" : user.name ? user.name.charAt(0).toUpperCase() : 'U'} */}
            {getInitials(user.name)}
          </div>
          {/* <img 
            src={user.profileImage} 
            alt={user.name}
            className="w-20 h-20 rounded-full border-2 border-orange-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = profileImg;
            }}
          /> */}
          {/* <div className="absolute font-bold -bottom-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            6
          </div> */}
        </div>

        <div className="flex-1 sm:text-center mt-4 w-100 text-center">
          <h1 className="text-2xl font-bold text-black mb-2 capitalize">{user.name}</h1>
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