import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ThumbsUp, MapPin, Calendar, Languages, BookOpen, Plus, MessageSquareWarning, Star, Trash, Edit, Check, TriangleAlert } from 'lucide-react';
import CommentCard from './CommentCard';
// import RatingModal from './RatingModal';
import { useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
// import Model from './Model';
import Modal from './Modal';
// import ImageCarousel from './ImageCarousel';
// import { FaSpinner } from 'react-icons/fa';
// import placeholderImage1 from '@/assets/placeholder.svg';
// import placeholderImage2 from '@/assets/parallaxImages/banner2.jpg';
// import placeholderImage3 from '@/assets/parallaxImages/banner3.jpg';
// import placeholderImage4 from '@/assets/parallaxImages/banner4.png';
import ImageCarousel1 from './ImageCarousel1';
import {
    Snackbar,
    Alert,
    Slide,
    Tooltip,
    Menu,
    MenuItem,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RatingModal1 from './RatingModal1';
import cdacRoundLogo from '@/assets/cdacroundlogo.png';
import type { User } from '@/types';
import ShareModal from '@/components/ShareModal/ShareModal';
import { coreBackendClient } from '@/utils/http/clients/coreBackend.client';
import { detectAIClient } from '@/utils/http/clients/detectAIClient';
import mockDiscoveryPosts from '@/Db/feeds';
import { getDummyCommentsByPostId } from './dummyData';
import { AnimatePresence, motion } from "framer-motion";
import AuthContext from '@/context/AuthContext';
import RatingStars from './RatingStars';
import { MoreVert } from '@mui/icons-material';
import AppImage from "@/components/AppImage";

const USE_FALLBACK = true;
const REPORT_REASONS = [
    "Bullying or harassment",
    "Hate symbols or hate speech",
    "Inappropriate language",
    "Spam or misleading",
    "Violence or dangerous organizations",
    "Selling or promoting restricted items",
];
const DESCRIPTION_PREVIEW_CHAR_LIMIT = 320;

export interface Comment {
    id?: string;
    _id: string;
    postId: string;
    userId: string;
    username: string;
    userImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    upvote: number;
    userVote: string[];
}

interface UserRating {
    userId: string;
    rating: number;
}

interface Post {
    _id: string;
    user_id: string;
    user_name?: string;
    username?: string;
    userName?: string;
    createdAt: Date;
    images: {
        thumbnailImage: string[];
        image: string[];
    };
    description: {
        title: string;
        description: string;
        scriptLanguage: string[];
        language: string[];
        englishTranslation: string;
        upvote: number;
        geolocation?: {
            lon: number;
            lat?: number;
            state?: string;
            city?: string;
            region?: string;
        };
        createdAt: Date;
        updatedAt: Date;
    };
    userrating?: UserRating[];
    topic: string;
    script: string[];
    type: string;
    rating: number;
    visiblity?: boolean;
    visibility?: boolean;
}


interface EditPostFormState {
    title: string;
    language: string;
    script: string;
    topic: string;
    type: string;
    postedAnonymously: boolean;
    description: string;
}

interface PendingEditImage {
    id: string;
    file: File;
    previewUrl: string;
}


const normalizeEntityId = (rawId: unknown): string => {
    if (typeof rawId === "string") return rawId;
    if (typeof rawId === "number" || typeof rawId === "bigint") return String(rawId);

    if (rawId && typeof rawId === "object") {
        const rawObj = rawId as Record<string, unknown>;
        const nestedId =
            rawObj.$oid ?? rawObj.oid ?? rawObj._id ?? rawObj.id ?? rawObj.userId ?? rawObj.user_id;
        if (nestedId && nestedId !== rawId) {
            return normalizeEntityId(nestedId);
        }
    }

    return "";
};

const isMongoObjectId = (value: string): boolean => /^[a-fA-F0-9]{24}$/.test(value);

const unwrapApiData = (payload: unknown): any => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as { data: unknown }).data;
    }
    return payload;
};

const resolveApiSuccess = (body: any, payload: any): boolean => {
    if (typeof body?.ok === "boolean") return body.ok;
    if (typeof payload?.ok === "boolean") return payload.ok;
    if (body?.data === false || payload === false || payload?.data === false) return false;
    return true;
};

const resolveApiMessage = (body: any, payload: any, fallback: string): string => {
    if (typeof body?.message === "string" && body.message.trim()) return body.message;
    if (typeof payload?.message === "string" && payload.message.trim()) return payload.message;
    return fallback;
};

type ModerationFieldName = "topic" | "title" | "description";
type ModerationFieldErrors = Partial<Record<ModerationFieldName, string>>;

const isModerationFieldName = (field: keyof EditPostFormState): field is ModerationFieldName =>
    field === "title" || field === "topic" || field === "description";

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

const extractModerationReason = (message: string): string | null => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return null;

    const moderationPrefix = "content failed moderation and was not saved";
    if (!trimmedMessage.toLowerCase().includes(moderationPrefix)) {
        return null;
    }

    const firstColonIndex = trimmedMessage.indexOf(":");
    if (firstColonIndex >= 0 && firstColonIndex < trimmedMessage.length - 1) {
        const reason = trimmedMessage.slice(firstColonIndex + 1).trim();
        return "Invalid input: " + reason || "Invalid input: Contains inappropriate language.";
    }

    return "Invalid input: Contains inappropriate language.";
};

const containsModerationFieldReference = (segment: string, field: ModerationFieldName): boolean => {
    const normalizedSegment = segment.toLowerCase();

    if (field === "topic") {
        return (
            /\b(topic|subject)\s*(field|input)?\s*[:=-]/.test(normalizedSegment) ||
            /\b(topic|subject)\s+field\b/.test(normalizedSegment) ||
            /\bin\s+(the\s+)?(topic|subject)\b/.test(normalizedSegment)
        );
    }

    if (field === "title") {
        return (
            /\b(title|heading)\s*(field|input)?\s*[:=-]/.test(normalizedSegment) ||
            /\b(title|heading)\s+field\b/.test(normalizedSegment) ||
            /\bin\s+(the\s+)?(title|heading)\b/.test(normalizedSegment)
        );
    }

    return (
        /\b(description|comment|body)\s*(field|input)?\s*[:=-]/.test(normalizedSegment) ||
        /\b(description|comment|body)\s+field\b/.test(normalizedSegment) ||
        /\bin\s+(the\s+)?(description|comment|body)\b/.test(normalizedSegment)
    );
};

const extractQuotedTermsFromModerationReason = (reason: string): string[] =>
    [...reason.matchAll(/['"]([^'"\r\n]{2,})['"]/g)]
        .map((match) => match[1]?.trim().toLowerCase() ?? "")
        .filter(Boolean);

const inferRejectedFieldFromReason = (
    reason: string,
    fieldValues?: Partial<Record<ModerationFieldName, string>>
): ModerationFieldName => {
    if (containsModerationFieldReference(reason, "topic")) {
        return "topic";
    }

    if (containsModerationFieldReference(reason, "title")) {
        return "title";
    }

    if (containsModerationFieldReference(reason, "description")) {
        return "description";
    }

    if (fieldValues) {
        const quotedTerms = extractQuotedTermsFromModerationReason(reason);
        if (quotedTerms.length > 0) {
            const matchedFields = (["title", "topic", "description"] as ModerationFieldName[]).filter((field) => {
                const fieldValue = (fieldValues[field] ?? "").toLowerCase();
                return quotedTerms.some((term) => fieldValue.includes(term));
            });

            if (matchedFields.length === 1) {
                return matchedFields[0];
            }
        }
    }

    return "description";
};

const buildModerationFieldErrors = (
    reason: string,
    fieldValues?: Partial<Record<ModerationFieldName, string>>
): ModerationFieldErrors => {
    const normalizedReason = reason.trim() || "Contains inappropriate language.";
    const segmentedReasons = normalizedReason
        .split(/\r?\n|\|/)
        .map((segment) => segment.trim())
        .filter(Boolean);
    const fieldErrors: ModerationFieldErrors = {};

    segmentedReasons.forEach((segment) => {
        if (containsModerationFieldReference(segment, "topic")) {
            fieldErrors.topic = fieldErrors.topic ?? segment;
        }

        if (containsModerationFieldReference(segment, "title")) {
            fieldErrors.title = fieldErrors.title ?? segment;
        }

        if (containsModerationFieldReference(segment, "description")) {
            fieldErrors.description = fieldErrors.description ?? segment;
        }
    });

    if (Object.keys(fieldErrors).length > 0) {
        return fieldErrors;
    }

    const rejectedField = inferRejectedFieldFromReason(normalizedReason, fieldValues);
    return { [rejectedField]: normalizedReason };
};

const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
            .filter(Boolean);
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? [trimmed] : [];
    }
    return [];
};

const parseCommaSeparatedValues = (value: string): string[] =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const extractImageIdFromUrl = (imageUrl: string): string => {
    if (!imageUrl) return "";

    try {
        const parsedUrl = new URL(imageUrl);
        const segments = parsedUrl.pathname.split("/").filter(Boolean);
        return segments[segments.length - 1] ?? "";
    } catch {
        const segments = imageUrl.split("/").filter(Boolean);
        return segments[segments.length - 1] ?? "";
    }
};

const toVoteUserIds = (rawVote: unknown): string[] => {
    if (!Array.isArray(rawVote)) return [];

    return rawVote
        .map((entry) => {
            if (typeof entry === "string") return normalizeEntityId(entry);
            if (entry && typeof entry === "object") {
                const voteObj = entry as Record<string, unknown>;
                const candidate = voteObj.userId ?? voteObj.user_id ?? voteObj._id ?? voteObj.id;
                return normalizeEntityId(candidate);
            }
            return "";
        })
        .filter((userId): userId is string => Boolean(userId))
        .filter((userId, index, arr) => arr.indexOf(userId) === index);
};

const normalizeComment = (rawComment: any, fallbackPostId: string, currentUser?: User): Comment => {
    const createdAtRaw = rawComment?.createdAt ?? rawComment?.created_at;
    const updatedAtRaw = rawComment?.updatedAt ?? rawComment?.updated_at;
    const normalizedId = rawComment?._id ?? rawComment?.id ?? `local-${Date.now()}`;

    return {
        id: normalizeEntityId(rawComment?.id ?? rawComment?._id ?? normalizedId) || normalizedId,
        _id: normalizeEntityId(normalizedId) || normalizedId,
        postId: normalizeEntityId(rawComment?.postId ?? rawComment?.post_id ?? fallbackPostId) || fallbackPostId,
        userId:
            normalizeEntityId(rawComment?.userId ?? rawComment?.user_id ?? rawComment?.user_id_fk ?? currentUser?._id) ||
            "unknown",
        username:
            rawComment?.username ??
            rawComment?.user_name ??
            rawComment?.name ??
            rawComment?.user?.name ??
            currentUser?.name ??
            "Unknown",
        userImageUrl: rawComment?.userImageUrl ?? rawComment?.user_image_url ?? rawComment?.user?.image,
        createdAt: createdAtRaw ? new Date(createdAtRaw) : new Date(),
        updatedAt: updatedAtRaw ? new Date(updatedAtRaw) : new Date(),
        description: rawComment?.description ?? rawComment?.discription ?? rawComment?.comment ?? "",
        upvote:
            typeof rawComment?.upvote === "number"
                ? rawComment.upvote
                : typeof rawComment?.upvotes === "number"
                    ? rawComment.upvotes
                    : typeof rawComment?.likes === "number"
                        ? rawComment.likes
                        : 0,
        userVote: toVoteUserIds(rawComment?.userVote ?? rawComment?.user_vote),
    };
};

// const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

// Main Inscription Details Component
const InscriptionDetailsPage: React.FC = () => {
    // Mock data based on your structure


    const [post, setPost] = useState(null as Post | null);
    const [comments, setComments] = useState([] as Comment[]);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    // const [isBookmarked, setIsBookmarked] = useState(false);
    const [display, setDisplay] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [userDetails, setUserDetails] = useState(undefined as User | undefined);
    const [description, setDescription] = useState<string>(""); // populate from fetch/original data
    const [showDeletePostModal, setShowDeletePostModal] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [showEditPostModal, setShowEditPostModal] = useState(false);
    const [isUpdatingPost, setIsUpdatingPost] = useState(false);
    const [isReportPostModalOpen, setIsReportPostModalOpen] = useState(false);
    const [reportPostReason, setReportPostReason] = useState("");
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [postActionAnchorEl, setPostActionAnchorEl] = useState<HTMLElement | null>(null);
    const [editPostForm, setEditPostForm] = useState<EditPostFormState>({
        title: "",
        language: "",
        script: "",
        topic: "",
        type: "Stone",
        postedAnonymously: false,
        description: "",
    });
    const [editPostModerationErrors, setEditPostModerationErrors] = useState<ModerationFieldErrors>({});
    const [editablePostImages, setEditablePostImages] = useState<string[]>([]);
    const [selectedImagesForDeletion, setSelectedImagesForDeletion] = useState<string[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [newImagesForUpload, setNewImagesForUpload] = useState<PendingEditImage[]>([]);

    // Disable page scrolling when any modal is open (edit, delete, report, rating, or generic display)
    useEffect(() => {
        const anyModalOpen = Boolean(
            display || showEditPostModal || showDeletePostModal || isReportPostModalOpen || showRatingModal
        );

        const previousOverflow = document.body.style.overflow;
        if (anyModalOpen) {
            // prevent background scrolling
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = previousOverflow || "";
        }

        return () => {
            // ensure we restore overflow when component unmounts or effect re-runs
            document.body.style.overflow = previousOverflow || "";
        };
    }, [display, showEditPostModal, showDeletePostModal, isReportPostModalOpen, showRatingModal]);
    const [unsavedCommentDrafts, setUnsavedCommentDrafts] = useState<Record<string, boolean>>({});
    const [isCheckingImagesForUpload, setIsCheckingImagesForUpload] = useState(false);

    const handleOpen = () => setDisplay(true);
    const handleClose = () => setDisplay(false);
    const hasUnsavedCommentEdits = Object.values(unsavedCommentDrafts).some(Boolean);
    const shouldBlockUnsavedCommentNavigation = useCallback(
        ({ currentLocation, nextLocation }) => {
            if (!hasUnsavedCommentEdits) return false;

            return (
                currentLocation.pathname !== nextLocation.pathname ||
                currentLocation.search !== nextLocation.search ||
                currentLocation.hash !== nextLocation.hash
            );
        },
        [hasUnsavedCommentEdits]
    );
    const unsavedCommentEditBlocker = useBlocker(shouldBlockUnsavedCommentNavigation);


    // inside your component
    const { id: postId } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        const mainScrollContainer = document.querySelector(".flex-1.overflow-y-auto");
        if (mainScrollContainer instanceof HTMLElement) {
            mainScrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
    }, [postId, location.pathname]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!hasUnsavedCommentEdits) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedCommentEdits]);

    useEffect(() => {
        setLoading(true);
        if (USE_FALLBACK) {
            // 🔹 hard stop: no backend calls
            setUserDetails({
                _id: "dummy-user",
                name: "John Doe",
            } as User);

            const matchedFallbackPost =
                mockDiscoveryPosts.data.find((fallbackPost) => String(fallbackPost._id) === String(postId)) ??
                mockDiscoveryPosts.data[0];
            setPost((matchedFallbackPost ?? null) as unknown as Post | null);
            const selectedFallbackPostId = matchedFallbackPost?._id ?? postId;
            setComments(getDummyCommentsByPostId(selectedFallbackPostId));
            setLoading(false);
            return;
        }

        // ===== REAL API LOGIC BELOW =====

        const fetchUserDetails = async () => {
            try {
                const response = await coreBackendClient.post("post/userProfile");
                const payload = unwrapApiData(response.data);
                const normalizedUser = Array.isArray(payload) ? payload[0] : payload;
                console.log("Fetched user details:", normalizedUser);
                setUserDetails(normalizedUser as User);
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        };

        const fetchPostDetails = async () => {
            if (!postId) {
                console.error("No postId found in route params");
                setPost(null);
                setLoading(false);
                return;
            }

            try {
                const response = await coreBackendClient.post(`post/getAllPost`);

                const payload = unwrapApiData(response.data);
                const allPosts = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : [];
                const matchedPost =
                    allPosts.find((p: Post) => String(p._id) === String(postId)) || null;

                console.log(matchedPost);
                setPost(matchedPost);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
            }
        };

        const fetchComments = async () => {
            if (!postId) {
                console.error("No postId found in route params");
                setComments([]);
                return;
            }
            try {

                const urlencoded = new URLSearchParams();
                urlencoded.append("postId", postId);

                const response = await coreBackendClient.post(`post/getPostDiscription`, urlencoded);

                const payload = unwrapApiData(response.data);
                // console.log(payload)
                const fetchedComments = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : [];
                setComments(
                    fetchedComments.map((comment: any) =>
                        normalizeComment(comment, postId)
                    )
                );
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetails();
        fetchComments();
        fetchPostDetails();
    }, [postId]);

    const submitRatingToAPI = async (postId: string, rating: number): Promise<string> => {
        const urlencoded = new URLSearchParams();
        urlencoded.append("postId", postId);
        urlencoded.append("rating", rating.toString());

        const response = await coreBackendClient.post("post/addRating", urlencoded);
        const body = response?.data;
        const payload = unwrapApiData(body);
        const success = resolveApiSuccess(body, payload);
        if (!success) {
            throw new Error(resolveApiMessage(body, payload, "Failed to submit rating."));
        }

        return resolveApiMessage(body, payload, "Rating submitted successfully.");
    };



    const handleRating = async (newRating: number) => {
        const resolvedPostId = normalizeEntityId(postId) || normalizeEntityId(post?._id);
        if (!resolvedPostId) {
            throw new Error("Post id missing. Unable to submit rating.");
        }

        const previousUserRating = userRating;
        const previousPostRating = Number(post?.rating ?? 0);
        setUserRating(newRating);
        setPost((previous) => (previous ? { ...previous, rating: newRating } : previous));

        try {
            await submitRatingToAPI(resolvedPostId, newRating);
        } catch (error) {
            setUserRating(previousUserRating);
            setPost((previous) => (previous ? { ...previous, rating: previousPostRating } : previous));
            throw new Error(resolveRequestErrorMessage(error, "Failed to submit rating."));
        }
    };

    const handleCommentEditDraftChange = useCallback((commentId: string, hasUnsavedDraft: boolean) => {
        if (!commentId) return;

        setUnsavedCommentDrafts((previous) => {
            const hasExistingDraft = Boolean(previous[commentId]);
            if (hasUnsavedDraft) {
                if (hasExistingDraft) return previous;
                return { ...previous, [commentId]: true };
            }

            if (!hasExistingDraft) return previous;
            const next = { ...previous };
            delete next[commentId];
            return next;
        });
    }, []);

    const handleClick = (lat: number, lon: number) => {
        const url = `https://www.google.com/maps?q=${lat},${lon}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        setIsDescriptionExpanded(false);
    }, [post?._id, post?.description?.description]);



    // Ensure dummy data is rendered when loading is false
    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-background flex items-center justify-center">
                <div className='flex flex-col items-center'>
                    {/* <FaSpinner className="animate-spin text-4xl text-[#66B0FF]" /> */}
                    <img src={cdacRoundLogo} className="mr-3 mb-4 size-20 cdacSpinner" />
                    <div className="text-[#000000] text-lg">Loading inscription details...</div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-secondary-background flex items-center justify-center">
                <div className="text-white text-lg">Inscription not found</div>
            </div>
        );
    }

    const handleDescriptionAdded = (createdComment: any) => {
        const resolvedPostId = normalizeEntityId(postId) || String(postId ?? "").trim();

        const refreshComments = async () => {
            if (!resolvedPostId) return;

            try {
                const urlencoded = new URLSearchParams();
                urlencoded.append("postId", resolvedPostId);

                const response = await coreBackendClient.post("post/getPostDiscription", urlencoded);
                const payload = unwrapApiData(response.data);
                const fetchedComments = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : [];

                setComments(
                    fetchedComments.map((comment: any) =>
                        normalizeComment(comment, resolvedPostId, userDetails)
                    )
                );
            } catch (error) {
                console.error("Failed to refresh comments after posting:", error);
            }
        };

        if (createdComment && typeof createdComment === "object") {
            const normalized = normalizeComment(createdComment, resolvedPostId, userDetails);
            const normalizedId = normalizeEntityId(normalized._id ?? normalized.id);

            if (isMongoObjectId(normalizedId)) {
                setComments((previous) => {
                    const withoutDuplicate = previous.filter((comment) => {
                        const existingId = normalizeEntityId(comment._id ?? comment.id);
                        return existingId !== normalizedId;
                    });
                    return [normalized, ...withoutDuplicate];
                });
                setDescription(normalized.description);
                return;
            }
        }

        if (typeof createdComment === "string") {
            setDescription(createdComment);
        } else if (createdComment && typeof createdComment === "object") {
            const commentRecord = createdComment as Record<string, unknown>;
            const candidateDescription =
                commentRecord.description ??
                commentRecord.discription ??
                commentRecord.comment;

            if (typeof candidateDescription === "string" && candidateDescription.trim()) {
                setDescription(candidateDescription);
            }
        }

        void refreshComments();
    };

    const handleCommentLikeUpdated = (commentId: string, updates: Partial<Comment>) => {
        setComments((prevComments) =>
            prevComments.map((comment) => {
                const existingId = comment._id ?? comment.id;
                if (String(existingId) !== String(commentId)) return comment;

                return {
                    ...comment,
                    upvote:
                        typeof updates.upvote === "number"
                            ? updates.upvote
                            : comment.upvote,
                    userVote: Array.isArray(updates.userVote) ? updates.userVote : comment.userVote,
                };
            })
        );
    };

    const handleCommentUpdated = (commentId: string, updates: Partial<Comment>) => {
        setComments((prevComments) =>
            prevComments.map((comment) => {
                const existingId = comment._id ?? comment.id;
                if (String(existingId) !== String(commentId)) return comment;

                return {
                    ...comment,
                    description:
                        typeof updates.description === "string"
                            ? updates.description
                            : comment.description,
                    updatedAt:
                        updates.updatedAt instanceof Date
                            ? updates.updatedAt
                            : comment.updatedAt,
                };
            })
        );
    };

    const handleCommentDeleted = (commentId: string) => {
        setComments((prevComments) =>
            prevComments.filter((comment) => {
                const existingId = comment._id ?? comment.id;
                return String(existingId) !== String(commentId);
            })
        );
    };
    const handleStayOnCommentEditPage = () => {
        if (unsavedCommentEditBlocker.state === "blocked") {
            unsavedCommentEditBlocker.reset();
        }
    };
    const handleLeaveCommentEditPage = () => {
        if (unsavedCommentEditBlocker.state === "blocked") {
            unsavedCommentEditBlocker.proceed();
        }
    };


    // Render dummy data if post and comments are unavailable
    // const postToRender = post || dummyPost;
    // const commentsToRender = comments.length > 0 ? comments : dummyComments;

    // Log commentsToRender to verify its contents
    // console.log('commentsToRender:', commentsToRender);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // const handlePostSuccess = (message: string) => {
    //     setSnackbarMessage(message);
    //     setSnackbarSeverity("success");
    //     setSnackbarOpen(true);
    // };

    const handlePostError = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    };

    const readFileAsDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(String(event.target?.result || ""));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const validateAndCheckStone = async (imageDataUrl: string): Promise<boolean> => {
        try {
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append("file", blob, "inscription.jpg");

            interface DetectAIResponse {
                result: string;
                confidence: number;
                internal_label: string;
                filename: string;
                detail?: string;
            }

            const { data } = await detectAIClient.post<DetectAIResponse>("predict/", formData);

            if (data?.detail?.toLowerCase().includes("suspicious content")) {
                handlePostError("Upload restricted: Suspicious content detected in file.");
                return false;
            }

            if (data?.result === "Stone Inscription") {
                return true;
            }

            handlePostError(`Upload restricted: Not a Stone Inscription (detected as ${data?.result || "unknown"}).`);
            return false;
        } catch (error) {
            handlePostError("Failed to check inscription type for image.");
            return false;
        }
    };

    const handlePostSuccess = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    // Add snackbar callbacks to handle rating submission success and failure
    const handleRatingSuccess = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    const handleRatingError = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    };

    const handleConfirmDeletePost = async () => {
        if (!isAuthenticated) {
            setShowDeletePostModal(false);
            handlePostError("Your session has expired. Please log in again.");
            return;
        }

        const resolvedPostId = normalizeEntityId(postToRender?._id) || normalizeEntityId(postId);
        if (!resolvedPostId) {
            handlePostError("Post id missing. Unable to delete.");
            return;
        }

        setIsDeletingPost(true);
        try {
            const urlencoded = new URLSearchParams();
            urlencoded.append("postId", resolvedPostId);

            const response = await coreBackendClient.post(
                "post/postDelete",
                urlencoded,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const body = response?.data;
            const payload = unwrapApiData(body);
            const success = resolveApiSuccess(body, payload);

            if (!success) {
                throw new Error(resolveApiMessage(body, payload, "Failed to delete post."));
            }

            setShowDeletePostModal(false);
            handlePostSuccess("Post deleted successfully.");
            window.setTimeout(() => {
                navigate("/feed", { replace: true });
            }, 1400);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to delete post.";
            handlePostError(message);
        } finally {
            setIsDeletingPost(false);
        }
    };

    const postToRender = post ?? mockDiscoveryPosts.data[0] as unknown as Post;
    const authorNameFromNav = (location.state as { authorName?: string } | null)?.authorName;
    const postAuthorName =
        postToRender.username ??
        postToRender.user_name ??
        postToRender.userName ??
        authorNameFromNav ??
        "Anonymous";
    const currentUserId = normalizeEntityId(userDetails?._id);
    const postOwnerId = normalizeEntityId(postToRender.user_id);
    const isPostAuthor = Boolean(currentUserId && postOwnerId && currentUserId === postOwnerId);
    const canManagePost = isAuthenticated && isPostAuthor;
    const canOpenPostOptions = isAuthenticated && Boolean(currentUserId);
    const normalizeInscriptionType = (value?: string) => {
        if (value === "Stone" || value === "Metal" || value === "Clay") {
            return value;
        }
        return "Stone";
    };
    const normalizedScriptValues = toStringArray(
        postToRender?.description?.scriptLanguage?.length
            ? postToRender.description.scriptLanguage
            : postToRender?.script
    );
    const normalizedLanguageValues = toStringArray(postToRender?.description?.language);
    const fullDescription =
        typeof postToRender?.description?.description === "string" ? postToRender.description.description : "";
    const hasDescription = fullDescription.trim().length > 0;
    const shouldShowDescriptionToggle = fullDescription.length > DESCRIPTION_PREVIEW_CHAR_LIMIT;
    const descriptionToDisplay = hasDescription
        ? isDescriptionExpanded || !shouldShowDescriptionToggle
            ? fullDescription
            : `${fullDescription.slice(0, DESCRIPTION_PREVIEW_CHAR_LIMIT).trimEnd()}...`
        : "No description provided.";
    const postLocationLabel =
        [postToRender?.description?.geolocation?.city, postToRender?.description?.geolocation?.state]
            .map((value) => (typeof value === "string" ? value.trim() : ""))
            .filter(Boolean)
            .join(", ") || "Location unavailable";
    const isPostActionMenuOpen = Boolean(postActionAnchorEl);

    const handleOpenPostActionMenu = (event: React.MouseEvent<HTMLElement>) => {
        setPostActionAnchorEl(event.currentTarget);
    };

    const handleClosePostActionMenu = () => {
        setPostActionAnchorEl(null);
    };

    const handleOpenEditPostModal = () => {
        const isAnonymousPost =
            typeof postToRender?.visiblity === "boolean"
                ? !postToRender.visiblity
                : typeof postToRender?.visibility === "boolean"
                    ? !postToRender.visibility
                    : false;

        setEditPostForm({
            title: postToRender?.description?.title ?? "",
            language: normalizedLanguageValues.join(", "),
            script: normalizedScriptValues.join(", "),
            topic: postToRender?.topic ?? "",
            type: normalizeInscriptionType(postToRender?.type),
            postedAnonymously: isAnonymousPost,
            description: postToRender?.description?.description ?? "",
        });
        setEditPostModerationErrors({});
        setEditablePostImages(Array.isArray(postToRender?.images?.image) ? postToRender.images.image : []);
        setSelectedImagesForDeletion([]);
        setDeletedImageIds([]);
        setNewImagesForUpload((previous) => {
            previous.forEach((image) => URL.revokeObjectURL(image.previewUrl));
            return [];
        });
        setShowEditPostModal(true);
    };

    const handleOpenEditPostFromMenu = () => {
        handleClosePostActionMenu();
        if (!canManagePost) {
            handlePostError("Your session has expired. Please log in again.");
            return;
        }
        handleOpenEditPostModal();
    };

    const handleOpenDeletePostFromMenu = () => {
        handleClosePostActionMenu();
        if (!canManagePost) {
            handlePostError("Your session has expired. Please log in again.");
            return;
        }
        setShowDeletePostModal(true);
    };

    const handleOpenReportPostFromMenu = () => {
        handleClosePostActionMenu();
        if (!isAuthenticated || isPostAuthor) {
            return;
        }
        setReportPostReason("");
        setIsReportPostModalOpen(true);
    };

    const handleCloseReportPostModal = () => {
        setIsReportPostModalOpen(false);
        setReportPostReason("");
    };

    const handleReportPost = () => {
        if (!reportPostReason) return;
        setIsReportPostModalOpen(false);
        setReportPostReason("");
        handlePostSuccess("Post reported successfully.");
    };

    const handleCloseEditPostModal = () => {
        setShowEditPostModal(false);
        setEditPostModerationErrors({});
        setEditablePostImages([]);
        setSelectedImagesForDeletion([]);
        setDeletedImageIds([]);
        setNewImagesForUpload((previous) => {
            previous.forEach((image) => URL.revokeObjectURL(image.previewUrl));
            return [];
        });
    };

    const handleEditPostFieldChange = <K extends keyof EditPostFormState>(
        field: K,
        value: EditPostFormState[K]
    ) => {
        setEditPostForm((previous) => ({ ...previous, [field]: value }));

        if (isModerationFieldName(field)) {
            setEditPostModerationErrors((previous) => {
                if (!previous[field]) return previous;
                const updated = { ...previous };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleToggleImageSelection = (imageUrl: string) => {
        setSelectedImagesForDeletion((previous) =>
            previous.includes(imageUrl)
                ? previous.filter((url) => url !== imageUrl)
                : [...previous, imageUrl]
        );
    };

    const handleDeleteSelectedImages = () => {
        if (selectedImagesForDeletion.length === 0) return;

        if (selectedImagesForDeletion.length >= editablePostImages.length) {
            handlePostError("At least one image is required in a post.");
            return;
        }

        const selectedImageIds = selectedImagesForDeletion
            .map(extractImageIdFromUrl)
            .filter(Boolean)
            .filter((imageId, index, imageIds) => imageIds.indexOf(imageId) === index);

        if (selectedImageIds.length === 0) {
            handlePostError("Unable to identify the selected images for deletion.");
            return;
        }

        const selectedImageIdSet = new Set(selectedImageIds);

        setDeletedImageIds((previous) =>
            [...previous, ...selectedImageIds].filter((imageId, index, imageIds) => imageIds.indexOf(imageId) === index)
        );
        setEditablePostImages((previous) =>
            previous.filter((imageUrl) => !selectedImageIdSet.has(extractImageIdFromUrl(imageUrl)))
        );
        setSelectedImagesForDeletion([]);
    };

    const handleAddEditPostImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (selectedFiles.length === 0) return;

        const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length === 0) {
            handlePostError("Please select valid image files.");
            event.target.value = "";
            return;
        }

        setIsCheckingImagesForUpload(true);
        const pendingImages = [];
        const errorMessages = [];

        for (const file of imageFiles) {
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const isStone = await validateAndCheckStone(dataUrl);
                
                if (!isStone) {
                    errorMessages.push(`${file.name}: not a stone inscription`);
                    continue;
                }

                pendingImages.push({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.name}`,
                    file,
                    previewUrl: dataUrl,
                });
            } catch (error) {
                errorMessages.push(`${file.name}: failed to process`);
            }
        }

        setIsCheckingImagesForUpload(false);

        if (pendingImages.length > 0) {
            setNewImagesForUpload((previous) => [...previous, ...pendingImages]);
            handlePostSuccess(`${pendingImages.length} valid inscription image(s) added.`);
        }

        if (errorMessages.length > 0) {
            handlePostError(`${errorMessages.join(" | ")}`);
        }

        event.target.value = "";
    };

    const handleRemovePendingImage = (pendingImageId: string) => {
        setNewImagesForUpload((previous) => {
            const imageToRemove = previous.find((image) => image.id === pendingImageId);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.previewUrl);
            }
            return previous.filter((image) => image.id !== pendingImageId);
        });
    };

    const handleConfirmEditPost = async () => {
        if (!isAuthenticated) {
            handlePostError("Your session has expired. Please log in again.");
            return;
        }

        const resolvedPostId = normalizeEntityId(postToRender?._id) || normalizeEntityId(postId);
        if (!resolvedPostId) {
            handlePostError("Post id missing. Unable to edit.");
            return;
        }

        const trimmedTitle = (editPostForm.title ?? "").trim();
        const parsedLanguageValues = parseCommaSeparatedValues(editPostForm.language ?? "");
        const parsedScriptValues = parseCommaSeparatedValues(editPostForm.script ?? "");
        const trimmedTopic = (editPostForm.topic ?? "").trim();
        const trimmedDescription = (editPostForm.description ?? "").trim();
        const normalizedType = normalizeInscriptionType(editPostForm.type);

        if (!trimmedTitle) {
            handlePostError("Title is required.");
            return;
        }

        if (!trimmedTopic) {
            handlePostError("Topic is required.");
            return;
        }

        if (!trimmedDescription) {
            handlePostError("Description is required.");
            return;
        }

        if (editablePostImages.length < 1 && newImagesForUpload.length < 1) {
            handlePostError("At least one image is required in a post.");
            return;
        }

        setEditPostModerationErrors({});
        setIsUpdatingPost(true);
        try {
            const postPayload = {
                description: {
                    title: trimmedTitle,
                    subject: trimmedTopic,
                    description: trimmedDescription,
                    scriptLanguage: parsedScriptValues,
                    language: parsedLanguageValues,
                },
                topic: trimmedTopic,
                script: parsedScriptValues,
                type: normalizedType,
                visiblity: !editPostForm.postedAnonymously,
            };

            const form = new FormData();
            form.append(
                "post",
                new Blob([JSON.stringify(postPayload)], { type: "application/json" })
            );
            form.append("postId", resolvedPostId);
            deletedImageIds.forEach((imageId) => {
                form.append("deletedImageIds", imageId);
            });
            newImagesForUpload.forEach((image) => {
                form.append("files", image.file, image.file.name);
            });

            const response = await coreBackendClient.post("post/updatePost", form);

            const body = response?.data;
            const payload = unwrapApiData(body);
            const success = resolveApiSuccess(body, payload);

            if (!success) {
                throw new Error(resolveApiMessage(body, payload, "Failed to update post."));
            }

            setPost((previous) => {
                if (!previous) return previous;
                return {
                    ...previous,
                    topic: trimmedTopic,
                    script: parsedScriptValues,
                    type: normalizedType,
                    visiblity: !editPostForm.postedAnonymously,
                    images: {
                        ...previous.images,
                        image: editablePostImages,
                        thumbnailImage: editablePostImages.length > 0 ? [editablePostImages[0]] : previous.images.thumbnailImage,
                    },
                    description: {
                        ...previous.description,
                        title: trimmedTitle,
                        scriptLanguage: parsedScriptValues,
                        language: parsedLanguageValues,
                        description: trimmedDescription,
                    },
                };
            });
            handleCloseEditPostModal();
            handlePostSuccess("Post updated successfully.");
        } catch (error) {
            const message = resolveRequestErrorMessage(error, "Failed to update post.");
            const moderationReason = extractModerationReason(message);

            if (moderationReason) {
                setEditPostModerationErrors(
                    buildModerationFieldErrors(moderationReason, {
                        title: trimmedTitle,
                        topic: trimmedTopic,
                        description: trimmedDescription,
                    })
                );
                handlePostError("Please remove inappropriate language from the highlighted fields.");
            } else {
                handlePostError(message);
            }
        } finally {
            setIsUpdatingPost(false);
        }
    };
    // const commentsToRender = comments.length > 0 ? comments : dummyComments;
    const canDeleteSelectedImages =
        selectedImagesForDeletion.length > 0 && selectedImagesForDeletion.length < editablePostImages.length;

    return (
        <div className="min-h-screen bg-primary-background">
            <Modal
                postId={postId as string}
                display={display}
                onClose={handleClose}
                onPostSuccess={handlePostSuccess}
                onPostError={handlePostError}
                onDescriptionAdded={handleDescriptionAdded}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                TransitionComponent={Slide}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%", whiteSpace: "pre-line" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <AnimatePresence >
                {showEditPostModal && (
                    <motion.div
                        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseEditPostModal}

                    >
                        <motion.div
                            className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl overflow-y-auto max-h-[90vh]"
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Post</h4>
                            <div className="mb-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-gray-800">Post Images</p>
                                    <label className={`inline-flex items-center gap-2 rounded-md border border-orange-300 px-3 py-1.5 text-sm font-medium transition-colors ${
                                        isCheckingImagesForUpload || isUpdatingPost
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            : "bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200"
                                    }`}>
                                        {isCheckingImagesForUpload ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                                                Validating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Add Images
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleAddEditPostImages}
                                            disabled={isUpdatingPost || isCheckingImagesForUpload}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">Images are validated as stone inscriptions before upload. Select images first, then remove them.</p>
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                                    {editablePostImages.map((imageUrl, index) => {
                                        const isSelected = selectedImagesForDeletion.includes(imageUrl);

                                        return (
                                            <Tooltip
                                                key={`${imageUrl}-${index}`}
                                                placement="top"
                                                arrow
                                                title={
                                                    <div className="w-72 max-w-[calc(100vw-3rem)] overflow-hidden rounded-md">
                                                        <AppImage
                                                            src={imageUrl}
                                                            alt={`Preview of post image ${index + 1}`}
                                                            className="block h-52 w-full object-cover"
                                                        />
                                                    </div>
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleImageSelection(imageUrl)}
                                                    disabled={isUpdatingPost}
                                                    className={`relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${isSelected
                                                        ? "border-red-500 ring-2 ring-red-200"
                                                        : "border-transparent hover:border-gray-300"
                                                        }`}
                                                >
                                                    <AppImage
                                                        src={imageUrl}
                                                        alt={`Post image ${index + 1}`}
                                                        className="h-24 w-full object-cover"
                                                    />
                                                    {isSelected && (
                                                        <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                                                            <Check className="h-3.5 w-3.5" />
                                                        </span>
                                                    )}
                                                </button>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                                {newImagesForUpload.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-medium text-gray-700 mb-2">New Images To Upload</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                                            {newImagesForUpload.map((pendingImage) => (
                                                <div key={pendingImage.id} className="relative overflow-hidden rounded-lg border border-blue-200">
                                                    <img
                                                        src={pendingImage.previewUrl}
                                                        alt={pendingImage.file.name}
                                                        className="h-24 w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePendingImage(pendingImage.id)}
                                                        disabled={isUpdatingPost}
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                                                        aria-label={`Remove ${pendingImage.file.name}`}
                                                    >
                                                        <Trash className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedImagesForDeletion.length > 0 && (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={handleDeleteSelectedImages}
                                            disabled={isUpdatingPost || !canDeleteSelectedImages}
                                            className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                                        >
                                            Delete Selected ({selectedImagesForDeletion.length})
                                        </button>
                                        <p className="mt-1 text-xs text-gray-500">
                                            At least one image must remain in the post.
                                        </p>
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-gray-500">
                                    Click Save Changes to apply image deletions.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <TextField
                                    label="Title"
                                    size="small"
                                    value={editPostForm.title}
                                    onChange={(event) => handleEditPostFieldChange("title", event.target.value)}
                                    disabled={isUpdatingPost}
                                    error={Boolean(editPostModerationErrors.title)}
                                    helperText={editPostModerationErrors.title}
                                    fullWidth
                                />
                                <TextField
                                    label="Topic"
                                    size="small"
                                    value={editPostForm.topic}
                                    onChange={(event) => handleEditPostFieldChange("topic", event.target.value)}
                                    disabled={isUpdatingPost}
                                    error={Boolean(editPostModerationErrors.topic)}
                                    helperText={editPostModerationErrors.topic}
                                    fullWidth
                                />
                                <TextField
                                    label="Language"
                                    size="small"
                                    value={editPostForm.language}
                                    onChange={(event) => handleEditPostFieldChange("language", event.target.value)}
                                    placeholder="Comma separated values"
                                    disabled={isUpdatingPost}
                                    fullWidth
                                />
                                <TextField
                                    label="Script"
                                    size="small"
                                    value={editPostForm.script}
                                    onChange={(event) => handleEditPostFieldChange("script", event.target.value)}
                                    placeholder="Comma separated values"
                                    disabled={isUpdatingPost}
                                    fullWidth
                                />
                                <TextField
                                    select
                                    label="Type"
                                    size="small"
                                    value={editPostForm.type}
                                    onChange={(event) => handleEditPostFieldChange("type", event.target.value)}
                                    disabled={isUpdatingPost}
                                    fullWidth
                                >
                                    <MenuItem value="Stone">Stone</MenuItem>
                                    <MenuItem value="Metal">Metal</MenuItem>
                                    <MenuItem value="Clay">Clay</MenuItem>
                                </TextField>
                                <TextField
                                    select
                                    label="Post Anonymously"
                                    size="small"
                                    value={editPostForm.postedAnonymously ? "true" : "false"}
                                    onChange={(event) =>
                                        handleEditPostFieldChange("postedAnonymously", event.target.value === "true")
                                    }
                                    disabled={isUpdatingPost}
                                    fullWidth
                                >
                                    <MenuItem value="true">Yes</MenuItem>
                                    <MenuItem value="false">No</MenuItem>
                                </TextField>
                                <div className="sm:col-span-2">
                                    <TextField
                                        label="Description"
                                        size="small"
                                        value={editPostForm.description}
                                        onChange={(event) => handleEditPostFieldChange("description", event.target.value)}
                                        disabled={isUpdatingPost}
                                        error={Boolean(editPostModerationErrors.description)}
                                        helperText={editPostModerationErrors.description}
                                        multiline
                                        minRows={3}
                                        fullWidth
                                    />
                                </div>
                            </div>
                            <div className="mt-5 flex items-center justify-end gap-2">
                                <button
                                    onClick={handleCloseEditPostModal}
                                    disabled={isUpdatingPost}
                                    className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmEditPost}
                                    disabled={isUpdatingPost}
                                    className="px-3 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 cursor-pointer"
                                >
                                    {isUpdatingPost ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeletePostModal && (
                    <motion.div
                        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeletePostModal(false)}
                    >
                        <motion.div
                            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Post</h4>
                            <p className="text-sm text-gray-700 mb-5">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => setShowDeletePostModal(false)}
                                    disabled={isDeletingPost}
                                    className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDeletePost}
                                    disabled={isDeletingPost}
                                    className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                                >
                                    {isDeletingPost ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog
                open={isReportPostModalOpen}
                onClose={handleCloseReportPostModal}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Report Post</DialogTitle>
                <DialogContent>
                    <p className="text-sm text-gray-600 mb-2">
                        Select a reason for reporting this post.
                    </p>
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={reportPostReason}
                            onChange={(event) => setReportPostReason(event.target.value)}
                        >
                            {REPORT_REASONS.map((reason) => (
                                <FormControlLabel
                                    key={reason}
                                    value={reason}
                                    control={<Radio />}
                                    label={reason}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReportPostModal} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReportPost}
                        color="error"
                        variant="contained"
                        disabled={!reportPostReason}
                    >
                        Report
                    </Button>
                </DialogActions>
            </Dialog>

            <div className="max-w-7xl mx-auto p-1 flex justify-between gap-30 sm:p-4 flex-col md:flex-row sm:justify-center sm:gap-10">
                {/* 
                <ImageCarousel
                    images={[placeholderImage1, placeholderImage2, placeholderImage3, placeholderImage4]}
                /> */}
                <div className="w-full md:w-3/5 lg:w-3/5">

                    {/* <ImageCarousel1
                        images={Array.isArray(post.images.image) ? post.images.image : [placeholderImage1]}
                    /> */}
                    <ImageCarousel1
                        images={Array.isArray(postToRender.images.image)
                            ? postToRender.images.image
                            : []}
                    />
                    <div className='card-styling-without-transition py-4 px-5'>

                        <div className='post-rating-like-share'>

                            <div className="w-full">
                                <span className="flex items-center justify-between text-[#000] text-2xl md:text-3xl font-bold">
                                    {postToRender.description.title || "Untitled Inscription"}

                                    <span className="inline-flex items-center gap-x-1.5 px-3 py-2 rounded-lg font-medium">
                                        <RatingStars rating={Number(postToRender.rating || 0)} />
                                        <span className="text-base md:text-lg">
                                            {postToRender.rating ? Number(postToRender.rating).toFixed(1) : "0.0"}
                                        </span>
                                    </span>
                                </span>                            </div>

                            <div className="flex gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center justify-between gap-2 text-[#000000] min-w-0">
                                    <div className='flex gap-3'>
                                        <MapPin className="w-5 h-5 text-[#000000] shrink-0" />
                                        {postLocationLabel}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:justify-end">
                                    <button
                                        onClick={() => setShowRatingModal(true)}
                                        className="md:px-6 md:py-2 px-3 py-1 cursor-pointer bg-orange-500 border-1 border-orange-800 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                    >
                                        Rate
                                    </button>
                                    {postToRender.description.geolocation?.lat !== undefined &&
                                        postToRender.description.geolocation?.lon !== undefined && (
                                            <Tooltip title="Locate on Google Maps">
                                                <button
                                                    onClick={() => handleClick(
                                                        postToRender.description.geolocation!.lat!,
                                                        postToRender.description.geolocation!.lon
                                                    )}
                                                    className="md:px-6 md:py-2 px-3 py-1 bg-white border-1 border-gray-400 text-white rounded-lg hover:bg-gray-200 cursor-pointer transition-colors font-medium"
                                                >
                                                    <LocationOnIcon className='w-5 h-5 text-red-500' />
                                                </button>
                                            </Tooltip>
                                        )}
                                    {canOpenPostOptions && (
                                        <>
                                            {/* <button
                                                onClick={handleOpenPostActionMenu}
                                                aria-controls={isPostActionMenuOpen ? "post-actions-menu" : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={isPostActionMenuOpen ? "true" : undefined}
                                                className="flex items-center justify-center md:px-6 md:py-2 px-3 py-1 cursor-pointer bg-blue-500 border-1 border-blue-800 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                            >
                                                <Settings className="w-6 h-6" />
                                            </button> */}
                                            <Tooltip title="Options">
                                                <div onClick={handleOpenPostActionMenu}
                                                    aria-controls={isPostActionMenuOpen ? "post-actions-menu" : undefined}
                                                    aria-haspopup="true"
                                                    aria-expanded={isPostActionMenuOpen ? "true" : undefined}
                                                    className="flex items-center justify-center md:py-2 py-1 cursor-pointer font-medium"
                                                >
                                                    <MoreVert />
                                                </div>
                                            </Tooltip>
                                            <Menu
                                                id="post-actions-menu"
                                                anchorEl={postActionAnchorEl}
                                                open={isPostActionMenuOpen}
                                                onClose={handleClosePostActionMenu}
                                                className=''
                                            >
                                                {isPostAuthor ? (
                                                    [
                                                        <MenuItem key="edit-post" onClick={handleOpenEditPostFromMenu}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Post
                                                        </MenuItem>,
                                                        <MenuItem key="delete-post" onClick={handleOpenDeletePostFromMenu} sx={{ color: "#dc2626" }}>
                                                            <Trash className="w-4 h-4 mr-2" />
                                                            Delete Post
                                                        </MenuItem>,
                                                    ]
                                                ) : (
                                                    <MenuItem onClick={handleOpenReportPostFromMenu} sx={{ color: "#dc2626" }}>
                                                        <TriangleAlert className="w-4 h-4 mr-2" />
                                                        Report Post
                                                    </MenuItem>
                                                )}
                                            </Menu>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Description Section */}
                        <div className="mb-8">
                            <h3 className="text-[#000] text-xl font-bold mb-4">User Descriptions</h3>

                            {/* Main Description */}
                            <div className="bg-secondary-background rounded-lg mb-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className='flex justify-between items-center mb-2'>

                                            <div className="flex mb-2 items-center">
                                                <h4 className=" font-semibold text-lg capitalize">Author: {postAuthorName}</h4>
                                                {/* <h4 className=" font-semibold text-lg">{post.user_name}</h4> */}
                                                {/* <span className="text-[#000000] ms-2">User rating: ({postToRender.userrating?.length})</span> */}
                                                {/* <span className="text-[#000000] ms-2">User rating: ({post.userrating?.length})</span> */}
                                            </div>
                                            {/* <div className="ml-4 flex items-center gap-1 text-blue-400">
                                                <ThumbsUp className="w-4 h-4 fill-current" />
                                                <span className="font-medium">{postToRender.description.upvote || 0}</span>
                                                <span className="font-medium">{post.description.upvote || 0}</span>
                                            </div> */}

                                        </div>


                                        <p className="text-base leading-relaxed mb-2 whitespace-pre-wrap break-words">
                                            {descriptionToDisplay}
                                            {/* {post.description.description || 'No description provided.'} */}
                                        </p>
                                        {hasDescription && shouldShowDescriptionToggle && (
                                            <button
                                                type="button"
                                                onClick={() => setIsDescriptionExpanded((previous) => !previous)}
                                                className="mb-4 text-sm font-medium text-orange-500 hover:text-orange-700 underline cursor-pointer"
                                            >
                                                {isDescriptionExpanded ? "See less" : "See more"}
                                            </button>
                                        )}

                                        {/* Metadata */}
                                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                <Languages className="w-4 h-4" />
                                                {normalizedScriptValues.length > 0 ? (
                                                    (() => {
                                                        const joined = normalizedScriptValues.join(', ');
                                                        return joined.length < 20 ? (
                                                            <span>Script: {joined.charAt(0).toUpperCase() + joined.slice(1)}</span>
                                                        ) : (
                                                            <Tooltip title={joined.charAt(0).toUpperCase() + joined.slice(1)} placement="top">
                                                                <span>Script: {joined.charAt(0).toUpperCase() + joined.slice(1, 17) + '...'}</span>
                                                            </Tooltip>
                                                        );
                                                    })()
                                                ) : (
                                                    <span>Script: N/A</span>
                                                )}
                                                {/* <span>Script: {post.description.scriptLanguage && post.description.scriptLanguage}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                <BookOpen className="w-4 h-4" />
                                                {normalizedLanguageValues.length > 0 ? (
                                                    (() => {
                                                        const joined = normalizedLanguageValues.join(', ');
                                                        return joined.length < 30 ? (
                                                            <span>Language: {joined.charAt(0).toUpperCase() + joined.slice(1)}</span>
                                                        ) : (
                                                            <Tooltip title={joined.charAt(0).toUpperCase() + joined.slice(1)} placement="top">
                                                                <span>Language: {joined.charAt(0).toUpperCase() + joined.slice(1, 17) + '...'}</span>
                                                            </Tooltip>
                                                        );
                                                    })()
                                                ) : (
                                                    <span>Language: N/A</span>
                                                )}
                                                {/* <span>Language: {post.description.language && post.description.language.join(', ')}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                {/* <span>Type: {postToRender.type ? postToRender.type.length < 20 ? postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1) : postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1, 17) + "..." : "N/A"}</span> */}
                                                {/* <span>Type: {post.type && post.type}</span> */}
                                                <div className="flex items-center gap-2 cursor-pointer">
                                                    <Calendar className="w-4 h-4" />
                                                    {postToRender.type ? (
                                                        postToRender.type.length < 30 ? (
                                                            <span>
                                                                Type: {postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1)}
                                                            </span>
                                                        ) : (
                                                            <Tooltip title={postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1)} placement="bottom">
                                                                <span>
                                                                    Type: {postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1, 17) + "..."}
                                                                </span>
                                                            </Tooltip>
                                                        )
                                                    ) : (
                                                        <span>Type: N/A</span>
                                                    )}
                                                    {/* <span>Topic: {post.topic && post.topic}</span> */}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                <MessageSquareWarning className="w-4 h-4" />
                                                {postToRender.topic ? (
                                                    postToRender.topic.length < 30 ? (
                                                        <span>
                                                            Topic: {postToRender.topic.charAt(0).toUpperCase() + postToRender.topic.slice(1)}
                                                        </span>
                                                    ) : (
                                                        <Tooltip title={postToRender.topic.charAt(0).toUpperCase() + postToRender.topic.slice(1)} placement="bottom">
                                                            <span>
                                                                Topic: {postToRender.topic.charAt(0).toUpperCase() + postToRender.topic.slice(1, 17) + "..."}
                                                            </span>
                                                        </Tooltip>
                                                    )
                                                ) : (
                                                    <span>Topic: N/A</span>
                                                )}
                                                {/* <span>Topic: {post.topic && post.topic}</span> */}
                                            </div>
                                        </div>

                                        {/* Translation */}
                                        {/* {post.description.englishTranslation && ( */}
                                        <div className="mt-4 p-3 bg-white border-1 border-solid border-yellow-400 rounded-lg">
                                            <h5 className="text-orange-400 font-medium mb-2">Transcription:</h5>
                                            <p className="text-black italic">"{postToRender.description.englishTranslation || "Transcription unavailable"}"</p>
                                            {/* <p className="text-black italic">"{post.description.englishTranslation || "this is a transation"}"</p> */}
                                        </div>
                                        {/* )} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Title and Location */}
                </div>
                {/* <ImageCarousel
                    images={Array.isArray(post.images.image) ? post.images.image : placeholderImageArray}
                /> */}
                {/* <img src={placeholderImage} /> */}


                {/* Comments Section */}
                <div className='card-styling-without-transition p-4'>

                    <div className="w-full flex justify-between gap-4">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-6 pt-2">Transcriptions</h3>
                        </div>
                        {/* Add Description Button */}
                        <div className="">
                            <button
                                onClick={handleOpen}
                                className="w-full text-sm px-2 sm:w-auto py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span className='pe-2'>
                                    Add Transcription
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="w-auto overflow-y-auto max-h-[380px] md:max-h-[960px] pr-2">
                        {/* {comments.map((comment: Comment) => (
                            <CommentCard key={comment.id ?? comment._id} comments={comment} currentUser={userDetails} />
                        ))} */}
                        {comments
                            .slice()
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((comment: Comment) => (
                                <CommentCard
                                    key={comment.id ?? comment._id}
                                    comments={comment}
                                    currentUser={userDetails}
                                    onLikeUpdated={handleCommentLikeUpdated}
                                    onCommentUpdated={handleCommentUpdated}
                                    onCommentDeleted={handleCommentDeleted}
                                    onActionSuccess={handlePostSuccess}
                                    onActionError={handlePostError}
                                    onEditDraftChange={handleCommentEditDraftChange}
                                />
                            ))}

                        <div className="text-sm text-center text-gray-500">No more transcriptions</div>
                    </div>

                </div>
            </div>

            {/* Rating Modal */}
            {/* <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                currentRating={userRating}
                onSubmitRating={handleRating}
                postId={postId as string}
            /> */}
            <RatingModal1
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                currentRating={userRating}
                onSubmitRating={handleRating}
                onRatingSubmitted={(success, message) => {
                    if (success) {
                        handleRatingSuccess("Rating submitted successfully!");
                    } else {
                        handleRatingError(message || "Failed to submit rating.");
                    }
                }}
                postId={postId as string}
            />

            <Dialog
                open={unsavedCommentEditBlocker.state === "blocked"}
                onClose={handleStayOnCommentEditPage}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Leave without saving?</DialogTitle>
                <DialogContent>
                    <p className="text-sm text-gray-600">
                        You have an unsaved comment edit. Save the comment before leaving, or leave now and discard your changes.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStayOnCommentEditPage} color="inherit">
                        Stay and Save
                    </Button>
                    <Button
                        onClick={handleLeaveCommentEditPage}
                        color="error"
                        variant="contained"
                    >
                        Leave Without Saving
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

// Demo wrapper component to show how to use it
export default InscriptionDetailsPage;

