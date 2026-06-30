// Model.tsx
import type React from "react";
import { useState } from "react";
// import { getCookie } from "@/utils/Auth/auth";

import { TextField } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";

interface ModelProps {
    postId: string;
    display: boolean;
    onClose: () => void;
    onPostSuccess: (message: string) => void;
    onPostError: (message: string) => void;
    onDescriptionAdded?: (createdComment: any) => void;
}

const extractErrorMessageFromPayload = (payload: unknown): string | null => {
    if (!payload || typeof payload !== "object") return null;

    const payloadRecord = payload as Record<string, unknown>;
    const directCandidates = [
        payloadRecord.error_message,
        payloadRecord.message,
        payloadRecord.error,
    ];

    for (const candidate of directCandidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }

    if (payloadRecord.data) {
        return extractErrorMessageFromPayload(payloadRecord.data);
    }

    return null;
};

const resolveRequestErrorMessage = (error: unknown, fallback: string): string => {
    if (error && typeof error === "object") {
        const errorRecord = error as Record<string, unknown>;
        const response = errorRecord.response as Record<string, unknown> | undefined;
        const responseMessage = extractErrorMessageFromPayload(response?.data);
        if (responseMessage) {
            return responseMessage;
        }

        const directMessage = errorRecord.message;
        if (typeof directMessage === "string" && directMessage.trim()) {
            return directMessage.trim();
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message.trim();
    }

    return fallback;
};

const extractApiPayload = (body: unknown): any => {
    if (body && typeof body === "object" && "data" in body) {
        return (body as { data: unknown }).data;
    }
    return body;
};

const resolveApiOk = (body: any, payload: any): boolean => {
    if (typeof body?.ok === "boolean") return body.ok;
    if (typeof payload?.ok === "boolean") return payload.ok;
    if (body?.data === false || payload?.data === false) return false;
    return true;
};

const resolveApiMessage = (body: any, payload: any, fallback: string): string => {
    if (typeof body?.message === "string" && body.message.trim()) return body.message;
    if (typeof payload?.message === "string" && payload.message.trim()) return payload.message;
    if (typeof body?.error_message === "string" && body.error_message.trim()) return body.error_message;
    if (typeof payload?.error_message === "string" && payload.error_message.trim()) return payload.error_message;
    return fallback;
};

const extractModerationReason = (message: string): string | null => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return null;

    const normalizedMessage = trimmedMessage.toLowerCase();
    const moderationSignals = [
        "moderation",
        "inappropriate",
        "profan",
        "bad word",
        "blocked word",
        "forbidden word",
        "offensive language",
        "abusive language",
        "policy violation",
        "banned word",
    ];

    if (!moderationSignals.some((signal) => normalizedMessage.includes(signal))) {
        return null;
    }

    const reasonMatch = trimmedMessage.match(/(?:reason|details?)\s*[:\-]\s*(.+)$/i);
    if (reasonMatch?.[1]?.trim()) {
        return reasonMatch[1].trim();
    }

    const firstColonIndex = trimmedMessage.indexOf(":");
    if (firstColonIndex >= 0 && firstColonIndex < trimmedMessage.length - 1) {
        const reason = trimmedMessage.slice(firstColonIndex + 1).trim();
        return "Invalid input: " + reason || "Invalid input: Contains inappropriate language.";
    }

    return "Invalid input: Contains inappropriate language.";
};

const looksLikeCommentRecord = (value: unknown): value is Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const record = value as Record<string, unknown>;
    return Boolean(
        record._id ??
        record.id ??
        record.description ??
        record.discription ??
        record.comment ??
        record.postId ??
        record.post_id
    );
};

const findCreatedCommentInResponse = (value: unknown): Record<string, unknown> | null => {
    if (!value) return null;

    if (Array.isArray(value)) {
        for (const entry of value) {
            const nested = findCreatedCommentInResponse(entry);
            if (nested) return nested;
        }
        return null;
    }

    if (typeof value !== "object") {
        return null;
    }

    if (looksLikeCommentRecord(value)) {
        return value as Record<string, unknown>;
    }

    const record = value as Record<string, unknown>;
    const candidates = [
        record.data,
        record.comment,
        record.description,
        record.discription,
        record.result,
        record.createdComment,
        record.payload,
    ];

    for (const candidate of candidates) {
        const nested = findCreatedCommentInResponse(candidate);
        if (nested) return nested;
    }

    return null;
};

const Model: React.FC<ModelProps> = ({ postId, display, onClose, onDescriptionAdded, onPostSuccess, onPostError }) => {

    const [inputValue, setInputValue] = useState("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (value: string) => {
        // enforce max length at input time
        if (value.length > 200) {
            setErrorMsg("Maximum 200 characters allowed.");
            setInputValue(value.slice(0, 200));
            return;
        }
        if (errorMsg) setErrorMsg("");
        setInputValue(value);
    };

    const handlePost = async () => {
        if (isSubmitting) return;

        // basic validation before submit
        const trimmed = (inputValue || "").trim();
        if (!trimmed) {
            setErrorMsg("Description cannot be empty.");
            return;
        }
        if (trimmed.length > 200) {
            setErrorMsg("Maximum 200 characters allowed.");
            return;
        }

        try {
            setErrorMsg("");
            setIsSubmitting(true);
            const urlencoded = new URLSearchParams();
            urlencoded.append("postId", postId);
            // Send both keys to support current backend ("discription") and moderation payload semantics ("description").
            urlencoded.append("description", trimmed);
            urlencoded.append("discription", trimmed);
            const response = await coreBackendClient.post(`post/addPoastDiscription`, urlencoded);
            const respBody = response?.data;
            const payload = extractApiPayload(respBody);
            const ok = resolveApiOk(respBody, payload);
            if (!ok) {
                throw new Error(resolveApiMessage(respBody, payload, "Failed to post description."));
            }

            const createdComment = findCreatedCommentInResponse(respBody);
            onDescriptionAdded?.(createdComment ?? trimmed);
            onPostSuccess?.("Comment posted successfully.");
            setInputValue("");
            setErrorMsg("");
            onClose();
        } catch (error) {
            const message = resolveRequestErrorMessage(error, "Failed to post description.");
            const moderationReason = extractModerationReason(message);
            if (moderationReason) {
                setErrorMsg(moderationReason);
            } else {
                onPostError?.(message);
            }
        } finally {
            setIsSubmitting(false);
        }

        // console.log("Posting:", inputValue);
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
                        className="bg-secondary-background p-4 rounded-lg shadow-xl flex flex-col gap-5 items-center w-sm"
                        style={{ backgroundColor: "white" }}
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ duration: 0.25 }}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="w-full">
                            <TextField
                                label="Description"
                                placeholder="This inscription belongs to the 12th century temple walls."
                                size="small"
                                value={inputValue || ""}
                                onChange={(e) => handleInputChange(e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                                disabled={isSubmitting}
                                error={!!errorMsg}
                                helperText={errorMsg || `${inputValue.length}/200`}
                                FormHelperTextProps={{ style: { margin: 0 } }}
                                slotProps={{
                                    htmlInput: {
                                        "data-testid": "add-transcription-text-input",
                                    },
                                }}
                            />
                        </div>

                        <div className="w-full flex justify-between">
                            <button
                                onClick={handlePost}
                                disabled={isSubmitting}
                                className="ml-2 cursor-pointer bg-orange-400 text-white px-3 py-1 rounded disabled:opacity-60"
                                data-testid="post-transcription-btn"
                            >
                                {isSubmitting ? "Posting..." : "Post"}
                            </button>
                            <button onClick={() => {
                                // prompt user if there's unsaved input
                                if ((inputValue || "").trim().length > 0) {
                                    const confirmClose = window.confirm("You have unsaved text. Cancel posting and close?\nPress OK to discard, Cancel to continue editing.");
                                    if (!confirmClose) return;
                                }
                                onClose();
                            }} disabled={isSubmitting} className="ml-2 cursor-pointer bg-slate-700 text-white px-3 py-1 rounded disabled:opacity-60">
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Model;
