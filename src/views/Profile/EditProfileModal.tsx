import type React from "react";
import { useState } from "react";
import { Snackbar, Alert, Slide, TextField } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import type { User } from "@/types";

interface EditProfileModalProps {
    userName: string;
    display: boolean;
    onClose: () => void;
    onEditSuccess: (message: string) => void;
    onEditError: (message: string) => void;
    setProfileName: (name: string) => void;
    bio: string;
    setBio: (bio: string) => void;
}

/**
 * Backend function to edit user profile name
 * @param name - The new name to update
 * @returns Promise with the response from backend
 * 
 * TODO: Backend route not yet created
 * Expected endpoint: POST /user/editProfile or similar
 * Expected request body: { name: string }
 * Expected response: { ok: boolean, data?: any, message?: string }
 */
const editProfileName = async (name: string): Promise<any> => {
    try {
        const urlencoded = new URLSearchParams();
        urlencoded.append("name", name);

        // TODO: Replace with actual backend endpoint once created
        const response = await coreBackendClient.post(`user/editProfile`, urlencoded);

        // Log response shape for debugging
        console.log("Edit profile API response:", {
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
        });

        const respBody = response?.data;

        // Handle { ok: boolean, data: any, message?: string } response format
        if (typeof respBody === 'object' && respBody !== null && 'ok' in respBody) {
            if (!respBody.ok) {
                const errMsg = respBody.message || JSON.stringify(respBody);
                throw new Error(`${response.status || 'HTTP?'} - ${errMsg}`);
            }
            return respBody.data ?? respBody;
        }

        // If API returned the object directly
        if (typeof respBody === 'object' && respBody !== null) {
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

const EditProfileModal: React.FC<EditProfileModalProps> = ({ userName, display, onClose, onEditSuccess, onEditError, setProfileName, bio, setBio }) => {

    const [inputValue, setInputValue] = useState(userName || "");
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Allow letters, numbers, spaces, and basic punctuation
    const allowedRegex = /^[a-zA-Z0-9\s\-\.]+$/;

    const validateFieldValue = (value: string) => {
        const v = (value || "").trim();
        if (v.length < 3) return "Minimum 3 characters required.";
        if (v.length > 50) return "Maximum 50 characters allowed.";
        if (!allowedRegex.test(v)) return "Special characters are not allowed.";
        return "";
    };

    const handleInputChange = (value: string) => {
        // enforce max length at input time
        if (value.length > 50) {
            setErrorMsg("Maximum 50 characters allowed.");
            setInputValue(value.slice(0, 50));
            return;
        }
        setInputValue(value);

        // Clear error if valid
        const msg = validateFieldValue(value);
        if (!msg && errorMsg) {
            setErrorMsg("");
        }
    };

    const handleEditProfile = async () => {
        // basic validation before submit
        const trimmed = (inputValue || "").trim();
        const msg = validateFieldValue(trimmed);

        if (msg) {
            setErrorMsg(msg);
            onEditError(msg);
            return;
        }

        try {

            const urlencoded = new URLSearchParams();
            urlencoded.append("name", trimmed);

            console.log("Editing profile name", { name: trimmed });
            const response = await editProfileName(trimmed);

            console.log("API response:", response);
            onEditSuccess("Profile updated successfully!");
            setInputValue("");
            setErrorMsg("");
            onClose();
        } catch (error) {
            console.error("Edit profile failed:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            onEditError(errorMessage);
        }
    };

    const SlideTransition = (props: any) => {
        return <Slide {...props} direction="down" />;
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
                                helperText={errorMsg || `${inputValue.length}/50`}
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
                                value={bio || ""}
                                onChange={(e) => setBio(e.target.value)}
                                fullWidth
                                error={!!errorMsg}
                                helperText={errorMsg || `${bio.length}/50`}
                                FormHelperTextProps={{ style: { color: errorMsg ? "#d32f2f" : "inherit", margin: 0 } }}
                                sx={{
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
                        </div>

                        <div className="w-full flex justify-between gap-3">
                            <button
                                onClick={handleEditProfile}
                                className="flex-1 cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded font-medium transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    // prompt user if there's unsaved input
                                    if ((inputValue || "").trim().length > 0 && inputValue !== userName) {
                                        const confirmClose = window.confirm("You have unsaved changes. Discard?\nPress OK to discard, Cancel to continue editing.");
                                        if (!confirmClose) return;
                                    }
                                    setInputValue(userName || "");
                                    setErrorMsg("");
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
