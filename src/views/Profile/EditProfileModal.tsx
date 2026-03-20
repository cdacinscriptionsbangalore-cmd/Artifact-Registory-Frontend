import type React from "react";
import { useContext, useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import AuthContext from "@/context/AuthContext";

const DEFAULT_BIO = "Archaeology enthusiast & digital volunteer";

interface EditProfileModalProps {
    userName: string;
    display: boolean;
    onClose: () => void;
    onEditSuccess: (message: string) => void;
    onEditError: (message: string) => void;
    setProfileName: (name: string) => void;
    setProfileImage: (imageUrl: string) => void;
    setCoverImage: (imageUrl: string) => void;
    bio: string;
    setBio: (bio: string) => void;
}

/**
 * Backend function to update user profile (username/bio)
 * @param payload - The profile fields to update
 * @returns Promise with the response from backend
 */
const updateProfile = async (payload: { username?: string; bio?: string }): Promise<any> => {
    try {
        const response = await coreBackendClient.post("user/updateProfile", payload);

        // Log response shape for debugging
        console.log("Edit profile API response:", {
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
        });

        const respBody = response?.data;

        if (typeof respBody === "object" && respBody !== null) {
            console.log("API returned object body:", respBody);
            return respBody;
        }

        // Fallback: unexpected response
        console.warn("Unexpected response shape for editProfile:", respBody);
        return { ok: true, message: "Profile updated" };
    } catch (error) {
        console.error("Edit profile API call failed:", error);
        throw error;
    }
};

const uploadProfileImage = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await coreBackendClient.post("user/uploadProfileImage", formData);
    return response?.data;
};

const uploadCoverImage = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await coreBackendClient.post("user/uploadCoverImage", formData);
    return response?.data;
};

const extractUserData = (responseBody: any) => {
    if (responseBody && typeof responseBody === "object" && responseBody.data && typeof responseBody.data === "object") {
        return responseBody.data;
    }
    return responseBody;
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    userName,
    display,
    onClose,
    onEditSuccess,
    onEditError,
    setProfileName,
    setProfileImage,
    setCoverImage,
    bio,
    setBio,
}) => {
    const { isAuthenticated } = useContext(AuthContext);

    const [inputValue, setInputValue] = useState(userName || "");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [bioInput, setBioInput] = useState(bio || DEFAULT_BIO);
    const [bioErrorMsg, setBioErrorMsg] = useState<string>("");
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Backend username rules: letters, numbers, and underscores only
    const usernameRegex = /^[a-zA-Z0-9_ ]+$/;
    // Backend bio rules: letters, numbers, and spaces only
    const bioRegex = /^(?=.*[A-Za-z0-9])[A-Za-z0-9 ]+$/;

    useEffect(() => {
        if (display) {
            setInputValue(userName || "");
            setErrorMsg("");
            setBioInput(bio || DEFAULT_BIO);
            setBioErrorMsg("");
            setProfileImageFile(null);
            setCoverImageFile(null);
        }
    }, [display, userName, bio]);

    const validateUsername = (value: string) => {
        const v = (value || "").trim();
        if (v.length < 3) return "Minimum 3 characters required.";
        if (v.length > 30) return "Maximum 30 characters allowed.";
        if (!usernameRegex.test(v)) return "Only letters, numbers, and underscores are allowed.";
        return "";
    };

    const handleInputChange = (value: string) => {
        // enforce max length at input time
        if (value.length > 30) {
            setErrorMsg("Maximum 30 characters allowed.");
            setInputValue(value.slice(0, 30));
            return;
        }
        setInputValue(value);

        // Clear error if valid
        const msg = validateUsername(value);
        if (!msg && errorMsg) {
            setErrorMsg("");
        }
    };

    const handleBioInputChange = (value: string) => {
        if (value.length > 150) {
            setBioErrorMsg("Maximum 150 characters allowed.");
            setBioInput(value.slice(0, 150));
            return;
        }

        setBioInput(value);
        if (bioErrorMsg) {
            setBioErrorMsg("");
        }
    };

    const handleEditProfile = async () => {
        if (!isAuthenticated) {
            onEditError("Your session has expired. Please log in again.");
            onClose();
            return;
        }

        const trimmed = (inputValue || "").trim();
        const currentName = (userName || "").trim();
        const currentBio = (bio || DEFAULT_BIO).trim();
        const normalizedBio = (bioInput || "").trim();
        const bioToSave = normalizedBio;
        const isNameChanged = trimmed !== currentName;
        const isBioChanged = bioToSave !== currentBio;
        const hasImageChanges = !!profileImageFile || !!coverImageFile;

        if (!isNameChanged && !isBioChanged && !hasImageChanges) {
            onEditError("No changes to save.");
            return;
        }

        if (isNameChanged) {
            const msg = validateUsername(trimmed);
            if (msg) {
                setErrorMsg(msg);
                onEditError(msg);
                return;
            }
        }

        if (isBioChanged) {
            if (bioToSave.length < 3 || bioToSave.length > 150) {
                const msg = "Bio must be between 3 and 150 characters.";
                setBioErrorMsg(msg);
                onEditError(msg);
                return;
            }

            if (!bioRegex.test(bioToSave)) {
                const msg = "Bio can only contain letters, numbers, and spaces.";
                setBioErrorMsg(msg);
                onEditError(msg);
                return;
            }
        }

        try {
            setIsSaving(true);
            let latestUserData: any = null;
            let updatedName = currentName;
            let updatedBio = currentBio;

            if (isNameChanged || isBioChanged) {
                const requestBody: { username?: string; bio?: string } = {};
                if (isNameChanged) requestBody.username = trimmed;
                if (isBioChanged) requestBody.bio = bioToSave;

                console.log("Updating profile", requestBody);
                const response = await updateProfile(requestBody);
                latestUserData = extractUserData(response);
                updatedName = latestUserData?.username ?? trimmed;
                updatedBio = latestUserData?.bio ?? bioToSave;
                setProfileName(updatedName);
                setBio(updatedBio);
            }

            if (profileImageFile) {
                const profileImageResponse = await uploadProfileImage(profileImageFile);
                latestUserData = extractUserData(profileImageResponse) ?? latestUserData;
                if (latestUserData?.profileImage) {
                    setProfileImage(latestUserData.profileImage);
                }
            }

            if (coverImageFile) {
                const coverImageResponse = await uploadCoverImage(coverImageFile);
                latestUserData = extractUserData(coverImageResponse) ?? latestUserData;
                if (latestUserData?.coverImage) {
                    setCoverImage(latestUserData.coverImage);
                }
            }

            if ((!isNameChanged || !isBioChanged) && latestUserData) {
                if (!isNameChanged && (latestUserData?.username || latestUserData?.name)) {
                    const fallbackUsername = latestUserData?.username ?? latestUserData?.name;
                    if (fallbackUsername) {
                        setProfileName(fallbackUsername);
                        updatedName = fallbackUsername;
                    }
                }
                if (!isBioChanged && latestUserData?.bio) {
                    setBio(latestUserData.bio);
                    updatedBio = latestUserData.bio;
                }
            }

            onEditSuccess("Profile updated successfully!");
            setInputValue(updatedName || "");
            setBioInput(updatedBio || "");
            setErrorMsg("");
            setBioErrorMsg("");
            setProfileImageFile(null);
            setCoverImageFile(null);
            onClose();
        } catch (error) {
            console.error("Edit profile failed:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            onEditError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageSelection = (
        event: React.ChangeEvent<HTMLInputElement>,
        type: "profile" | "cover"
    ) => {
        const file = event.target.files?.[0] || null;
        if (!file) {
            if (type === "profile") setProfileImageFile(null);
            if (type === "cover") setCoverImageFile(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            onEditError("Please select a valid image file.");
            return;
        }

        if (type === "profile") setProfileImageFile(file);
        if (type === "cover") setCoverImageFile(file);
    };

    return (
        <AnimatePresence>
            {display && (
                <motion.div
                    className="fixed w-screen h-screen z-999 flex items-center justify-center top-0 left-0 bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-xl flex flex-col gap-5 items-center w-96"
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ duration: 0.25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-bold text-black">Edit Profile</h2>

                        <div className="w-full capitalize">
                            <TextField
                                label="Name"
                                
                                placeholder="Enter your name"
                                size="small"
                                value={inputValue || ""}
                                onChange={(e) => handleInputChange(e.target.value)}
                                fullWidth
                                error={!!errorMsg}
                                helperText={errorMsg || `${inputValue.length}/30`}
                                FormHelperTextProps={{ style: { color: errorMsg ? "#d32f2f" : "inherit", margin: 0, textTransform: "capitalize" } }}
                                sx={{
                                    marginBottom: 2,
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: errorMsg ? "#ffebee" : "inherit",
                                        borderColor: errorMsg ? "#d32f2f" : "inherit",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: errorMsg ? "#d32f2f" : "inherit",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: errorMsg ? "#d32f2f" : "inherit",
                                    },
                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: errorMsg ? "#d32f2f" : "inherit",
                                    },
                                }}
                            />
                            <TextField
                                label="Bio"
                                placeholder="Enter your bio"
                                size="small"
                                value={bioInput || ""}
                                onChange={(e) => handleBioInputChange(e.target.value)}
                                fullWidth
                                error={!!bioErrorMsg}
                                helperText={bioErrorMsg || `${bioInput.length}/150`}
                                FormHelperTextProps={{ style: { color: bioErrorMsg ? "#d32f2f" : "inherit", margin: 0 } }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: bioErrorMsg ? "#ffebee" : "inherit",
                                        borderColor: bioErrorMsg ? "#d32f2f" : "inherit",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: bioErrorMsg ? "#d32f2f" : "inherit",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: bioErrorMsg ? "#d32f2f" : "inherit",
                                    },
                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: bioErrorMsg ? "#d32f2f" : "inherit",
                                    },
                                }}
                            />
                            <div className="mt-4 flex flex-col gap-3">
                                <div className="">
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Profile Picture
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageSelection(e, "profile")}
                                        className="file:cursor-pointer block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {profileImageFile ? `Selected: ${profileImageFile.name}` : "No file selected"}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        Cover Picture
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageSelection(e, "cover")}
                                        className="file:cursor-pointer block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {coverImageFile ? `Selected: ${coverImageFile.name}` : "No file selected"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex justify-between gap-3">
                            <button
                                onClick={handleEditProfile}
                                disabled={isSaving}
                                className="flex-1 cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded font-medium transition-colors"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={() => {
                                    // prompt user if there's unsaved input
                                    const hasNameDraft = (inputValue || "").trim() !== (userName || "").trim();
                                    const currentBio = (bio || DEFAULT_BIO).trim();
                                    const draftBio = (bioInput || "").trim();
                                    const hasBioDraft = draftBio !== currentBio;
                                    const hasFileDraft = !!profileImageFile || !!coverImageFile;
                                    if (hasNameDraft || hasBioDraft || hasFileDraft) {
                                        const confirmClose = window.confirm("You have unsaved changes. Discard?\nPress OK to discard, Cancel to continue editing.");
                                        if (!confirmClose) return;
                                    }
                                    setInputValue(userName || "");
                                    setErrorMsg("");
                                    setBioInput(bio || "");
                                    setBioErrorMsg("");
                                    setProfileImageFile(null);
                                    setCoverImageFile(null);
                                    onClose();
                                }}
                                className="flex-1 cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
