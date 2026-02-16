// Model.tsx
import type React from "react";
import { useState } from "react";
// import { getCookie } from "@/utils/Auth/auth";

import { Snackbar, Alert, Slide } from "@mui/material";
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";

interface ModelProps {
    postId: string;
    display: boolean;
    onClose: () => void;
    onPostSuccess: (message: string) => void;
    onPostError: (message: string) => void;
    onDescriptionAdded?: (createdComment: any) => void;
}

const Model: React.FC<ModelProps> = ({ postId, display, onClose, onDescriptionAdded, onPostSuccess, onPostError }) => {

    const [inputValue, setInputValue] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleInputChange = (e: String) => {
        setInputValue(e as string);
    };

    const handlePost = async () => {
    try {

      const urlencoded = new URLSearchParams();
      urlencoded.append("postId", postId);
      // keep spelling used by backend if required; adjust if backend expects "description"
      urlencoded.append("discription", inputValue);
            console.log("Posting description", { postId, inputValue });
            const response = await coreBackendClient.post(`post/addPoastDiscription`, urlencoded);

            // Log response shape for debugging
            console.log("API response (axios):", {
                status: response?.status,
                statusText: response?.statusText,
                data: response?.data,
            });

            // Support multiple possible shapes: { ok, data, message } or { data: {...} } or raw object
            const respBody = response?.data;

            // If API follows { ok: boolean, data: any, message?: string }
            if (typeof respBody === 'object' && respBody !== null && 'ok' in respBody) {
                if (!respBody.ok) {
                    const errMsg = respBody.message || JSON.stringify(respBody);
                    throw new Error(`${response.status || 'HTTP?'} - ${errMsg}`);
                }

                const created = respBody.data ?? respBody;
                console.log("Description upload created object:", created);
                // Normalize created object to expected shape before passing up
                const cc: any = created ?? {};
                const normalized = {
                    _id: cc._id ?? cc.id ?? `local-${Date.now()}`,
                    postId: cc.postId ?? cc.post_id ?? postId,
                    userId: cc.userId ?? cc.user_id ?? cc.user_id_fk,
                    username: cc.username ?? cc.user_name ?? cc.name ?? (cc.user && cc.user.name) ?? undefined,
                    description: cc.description ?? cc.discription ?? cc.comment ?? inputValue,
                    upvote: typeof cc.upvote === 'number' ? cc.upvote : (typeof cc.upvotes === 'number' ? cc.upvotes : 0),
                    userVote: Array.isArray(cc.userVote) ? cc.userVote : (Array.isArray(cc.user_vote) ? cc.user_vote : []),
                    createdAt: cc.createdAt ? new Date(cc.createdAt) : new Date(),
                    updatedAt: cc.updatedAt ? new Date(cc.updatedAt) : new Date(),
                };

                onDescriptionAdded?.(normalized);
                onPostSuccess?.("Description uploaded successfully!");
                onClose();
                return;
            }

            // If API returned the created object directly
            if (typeof respBody === 'object' && respBody !== null) {
                console.log("API returned object body:", respBody);
                const cc2: any = respBody ?? {};
                const normalized2 = {
                    _id: cc2._id ?? cc2.id ?? `local-${Date.now()}`,
                    postId: cc2.postId ?? cc2.post_id ?? postId,
                    userId: cc2.userId ?? cc2.user_id ?? cc2.user_id_fk,
                    username: cc2.username ?? cc2.user_name ?? cc2.name ?? (cc2.user && cc2.user.name) ?? undefined,
                    description: cc2.description ?? cc2.discription ?? cc2.comment ?? inputValue,
                    upvote: typeof cc2.upvote === 'number' ? cc2.upvote : (typeof cc2.upvotes === 'number' ? cc2.upvotes : 0),
                    userVote: Array.isArray(cc2.userVote) ? cc2.userVote : (Array.isArray(cc2.user_vote) ? cc2.user_vote : []),
                    createdAt: cc2.createdAt ? new Date(cc2.createdAt) : new Date(),
                    updatedAt: cc2.updatedAt ? new Date(cc2.updatedAt) : new Date(),
                };
                onDescriptionAdded?.(normalized2);
                onPostSuccess?.("Description uploaded successfully!");
                onClose();
                return;
            }

            // Fallback: unexpected response
                console.warn("Unexpected response shape for addPoastDiscription:", respBody);
                const fallback = {
                    _id: `local-${Date.now()}`,
                    postId,
                    userId: undefined,
                    username: undefined,
                    description: inputValue,
                    upvote: 0,
                    userVote: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                onDescriptionAdded?.(fallback);
                onPostSuccess?.("Description uploaded (fallback)");
                onClose();
    } catch (error) {
            console.error("Upload failed NOT ERROR:", error);
            // Log richer error details from axios
            try {
                console.error("Axios error details:", {
                    message: (error as any)?.message,
                    response: (error as any)?.response?.data,
                    status: (error as any)?.response?.status,
                    config: (error as any)?.config,
                });
            } catch (e) {}

            if (error instanceof Error) {
                console.error("Upload failed:", error);
                onPostError?.(error.message || 'Upload failed');
            } else {
                console.error("Unknown error:", error);
                onPostError?.('An unknown error occurred.');
            }
    } finally {
      setInputValue("");
    }

    // console.log("Posting:", inputValue);
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
