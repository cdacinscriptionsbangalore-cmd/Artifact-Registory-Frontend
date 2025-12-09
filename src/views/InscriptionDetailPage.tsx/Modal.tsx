// Model.tsx
import type React from "react";
import { useState } from "react";
// import { getCookie } from "@/utils/Auth/auth";

import { Snackbar, Alert, Slide } from "@mui/material";

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

interface ModelProps {
    postId: string;
    display: boolean;
    onClose: () => void;
    onPostSuccess: (message: string) => void;
    onPostError: (message: string) => void;
    onDescriptionAdded?: (createdComment: any) => void;
}

const Model: React.FC<ModelProps> = ({ postId, display, onClose, onPostSuccess, onPostError }) => {

    const [inputValue, setInputValue] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleInputChange = (e: String) => {
        setInputValue(e as string);
    };

    function getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    }

    const handlePost = async () => {
        try {
            const token = getCookie("token");
            const form = new FormData();
            form.append("postId", postId);
            form.append("description", inputValue);

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const urlencoded = new URLSearchParams();
            urlencoded.append("postId", postId);
            urlencoded.append("discription", inputValue);

            const requestOptions: RequestInit = {
                method: "POST",
                headers: myHeaders,
                body: urlencoded,
                redirect: "follow"
            };

            const response = await fetch(`${backendApiUrl}post/addPoastDiscription`, requestOptions);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Server response:", data);

            onPostSuccess("Description uploaded successfully!");
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                console.error("Upload failed:", error.message);
                onPostError("Upload failed: " + error.message);
            } else {
                console.error("Unknown error:", error);
                onPostError("An unknown error occurred.");
            }
        } finally {
            setInputValue("");
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const SlideTransition = (props: any) => {
        return <Slide {...props} direction="down" />;
    };

    if (!display) return null; // don't render if hidden

    return (
        <div className="fixed w-screen h-screen z-999 flex items-center justify-center top-0 left-0 bg-black/80" >
            <div className="bg-secondary-background p-4 rounded shadow flex flex-col gap-5 items-center w-sm" style={{ backgroundColor: "white" }}>

                <div className="w-full">
                    <label className="block text-sm font-medium mb-2 text-secondary-dark">Description</label>
                    <textarea
                        value={inputValue || ""}
                        onChange={e => handleInputChange(e.target.value)}
                        placeholder="This inscription belongs to the 12th century temple walls."
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg text-[#000000] resize-none"
                        rows={3}
                    />
                </div>

                <div className="w-full flex justify-between">
                    <button onClick={handlePost} className="ml-2 cursor-pointer bg-orange-400 text-white px-3 py-1 rounded">
                        Post
                    </button>
                    <button onClick={onClose} className="ml-2 cursor-pointer bg-slate-700 text-white px-3 py-1 rounded">
                        Close
                    </button>
                </div>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    TransitionComponent={SlideTransition}
                >
                    <Alert onClose={handleSnackbarClose} severity={"success"} sx={{ width: "100%" }}>
                        {"Description uploaded successfully!"}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
};

export default Model;
