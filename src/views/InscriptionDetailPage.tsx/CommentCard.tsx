import { Check, Pencil, ThumbsUp, Trash2, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Comment } from "./InscriptionDetailPage1";
import type { User } from "@/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@mui/material";
import { authStore } from "@/store/authStore";
import { apiClient } from "@/utils/http/clients/backendApiClientGeneral";
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";

interface CommentCardProps {
  comments: Comment;
  currentUser?: User; // Pass user from parent to avoid redundant fetches
  onLikeUpdated?: (commentId: string, updates: Partial<Comment>) => void;
  onCommentUpdated?: (commentId: string, updates: Partial<Comment>) => void;
  onCommentDeleted?: (commentId: string) => void;
  onActionSuccess?: (message: string) => void;
  onActionError?: (message: string) => void;
  onEditDraftChange?: (commentId: string, hasUnsavedDraft: boolean) => void;
}

const toComparableId = (rawId: unknown): string => {
  if (typeof rawId === "string") return rawId;
  if (typeof rawId === "number" || typeof rawId === "bigint") return String(rawId);

  if (rawId && typeof rawId === "object") {
    const obj = rawId as Record<string, unknown>;
    const nestedId =
      obj.$oid ?? obj.oid ?? obj._id ?? obj.id ?? obj.userId ?? obj.user_id ?? "";
    if (nestedId && nestedId !== rawId) {
      return toComparableId(nestedId);
    }
  }

  return "";
};

const getVoteUserIds = (rawVote: unknown): string[] => {
  if (!Array.isArray(rawVote)) return [];

  const normalized = rawVote
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const vote = entry as Record<string, unknown>;
        const candidate = vote.userId ?? vote.user_id ?? vote._id ?? vote.id;
        return toComparableId(candidate);
      }
      return "";
    })
    .filter((userId): userId is string => Boolean(userId));

  return Array.from(new Set(normalized));
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
  if (typeof body?.error_message === "string" && body.error_message.trim()) {
    return body.error_message;
  }
  if (typeof payload?.error_message === "string" && payload.error_message.trim()) {
    return payload.error_message;
  }
  return fallback;
};

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

type ReportReasonOption = {
  label: string;
  value: string;
};

const REPORT_REASONS: ReportReasonOption[] = [
  { label: "Misinformation", value: "MISINFORMATION" },
  { label: "Bullying or harassment", value: "HARASSMENT" },
  { label: "Hate symbols or hate speech", value: "HATE_SPEECH" },
  { label: "Spam or misleading", value: "SPAM" },
  { label: "Explicit content", value: "EXPLICIT_CONTENT" },
  { label: "Other", value: "OTHER" },
];

const getReportReasonLabel = (reasonValue: string): string =>
  REPORT_REASONS.find((reasonOption) => reasonOption.value === reasonValue)?.label ?? reasonValue;

const CommentCard: React.FC<CommentCardProps> = ({
  comments,
  currentUser,
  onLikeUpdated,
  onCommentUpdated,
  onCommentDeleted,
  onActionSuccess,
  onActionError,
  onEditDraftChange,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState<number>(comments.upvote ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comments.description ?? "");
  const [editErrorMsg, setEditErrorMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const commentId = useMemo(() => toComparableId(comments._id ?? comments.id), [comments._id, comments.id]);
  const currentUserId = useMemo(() => toComparableId(currentUser?._id), [currentUser?._id]);
  const commentUserId = useMemo(() => toComparableId(comments.userId), [comments.userId]);
  const isAuthor = useMemo(
    () => Boolean(currentUserId && commentUserId && currentUserId === commentUserId),
    [currentUserId, commentUserId]
  );
  const hasUnsavedEditDraft = useMemo(
    () => isEditing && (editValue ?? "").trim() !== (comments.description ?? "").trim(),
    [comments.description, editValue, isEditing]
  );

  // Initialize isLiked based on userVote (guard against undefined)
  useEffect(() => {
    setLikes(comments.upvote ?? 0);
    if (!currentUserId) {
      setIsLiked(false);
      return;
    }
    const userVote = getVoteUserIds(comments.userVote);
    const liked = userVote.includes(currentUserId);
    setIsLiked(liked);
  }, [currentUserId, comments.userVote, comments.upvote]);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(comments.description ?? "");
      setEditErrorMsg("");
    }
  }, [comments.description, isEditing]);

  useEffect(() => {
    if (!onEditDraftChange) return;
    const draftTrackingId = commentId || String(comments.id ?? comments._id ?? "");
    if (!draftTrackingId) return;

    onEditDraftChange(draftTrackingId, hasUnsavedEditDraft);
  }, [commentId, comments.id, comments._id, hasUnsavedEditDraft, onEditDraftChange]);

  useEffect(() => {
    if (!onEditDraftChange) return;
    const draftTrackingId = commentId || String(comments.id ?? comments._id ?? "");
    if (!draftTrackingId) return;

    return () => {
      onEditDraftChange(draftTrackingId, false);
    };
  }, [commentId, comments.id, comments._id, onEditDraftChange]);

  // Like/Dislike API
  const likeDislikeAPI = async () => {
    if (!currentUserId) {
      console.error("User profile is missing. Unable to submit vote.");
      return;
    }
    if (isLiking) {
      return;
    }
    if (!commentId) {
      console.error("Comment id is missing. Unable to submit vote.");
      return;
    }

    const urlencoded = new URLSearchParams();
    urlencoded.append("descriptionId", commentId);

    // Save current state for rollback
    const previousLiked = isLiked;
    const previousLikes = likes;

    // Optimistically update UI
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikes(prevLikes => prevLikes + (newLikedState ? 1 : -1));
    setIsLiking(true);


    try {
      const response = await coreBackendClient.post(
        "post/addVote",
        urlencoded,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const body = response.data;
      const payload = extractApiPayload(body);
      const ok = resolveApiOk(body, payload);

      if (!ok) {
        throw new Error(resolveApiMessage(body, payload, `Request failed with status ${response.status}`));
      }

      const serverUpvote =
        typeof payload?.upvote === "number"
          ? payload.upvote
          : typeof body?.upvote === "number"
            ? body.upvote
            : undefined;

      const serverVotes = getVoteUserIds(
        payload?.userVote ?? payload?.user_vote ?? body?.userVote ?? body?.user_vote
      );

      const fallbackVotes = (() => {
        const existingVotes = getVoteUserIds(comments.userVote);
        if (newLikedState) {
          return Array.from(new Set([...existingVotes, currentUserId]));
        }
        return existingVotes.filter((userId) => userId !== currentUserId);
      })();

      const nextVotes = serverVotes.length > 0 ? serverVotes : fallbackVotes;
      const resolvedLikes =
        typeof serverUpvote === "number"
          ? serverUpvote
          : previousLikes + (newLikedState ? 1 : -1);
      const resolvedLiked =
        nextVotes.includes(currentUserId);

      setLikes(resolvedLikes);
      setIsLiked(resolvedLiked);
      if (onLikeUpdated) {
        onLikeUpdated(commentId, {
          upvote: resolvedLikes,
          userVote: nextVotes,
        });
      }
    } catch (error) {
      // Revert UI on error
      console.error('Failed to update vote:', error);
      setIsLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleStartEdit = () => {
    if (!isAuthor || isDeleting || isUpdating) return;
    setEditValue(comments.description ?? "");
    setEditErrorMsg("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isUpdating) return;
    setEditValue(comments.description ?? "");
    setEditErrorMsg("");
    setIsEditing(false);
  };

  const handleEditValueChange = (value: string) => {
    if (editErrorMsg) {
      setEditErrorMsg("");
    }
    setEditValue(value);
  };

  const handleUpdateComment = async () => {
    if (!isAuthor) {
      onActionError?.("Only comment author can edit this comment.");
      return;
    }
    if (!commentId) {
      onActionError?.("Comment id missing. Unable to edit.");
      return;
    }

    const trimmed = (editValue ?? "").trim();
    if (!trimmed) {
      setEditErrorMsg("Description cannot be empty.");
      return;
    }
    if (trimmed.length > 200) {
      setEditErrorMsg("Maximum 200 characters allowed.");
      return;
    }
    if (trimmed === (comments.description ?? "").trim()) {
      setEditErrorMsg("");
      setIsEditing(false);
      return;
    }

    setEditErrorMsg("");
    setIsUpdating(true);
    try {
      const urlencoded = new URLSearchParams();
      urlencoded.append("discriptionId", commentId);
      urlencoded.append("discription", trimmed);
      // Also send canonical key name for moderation consumers expecting "description".
      urlencoded.append("description", trimmed);

      const response = await coreBackendClient.post(
        "post/updatePostDiscription",
        urlencoded,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const body = response.data;
      const payload = extractApiPayload(body);
      const ok = resolveApiOk(body, payload);

      if (!ok) {
        throw new Error(resolveApiMessage(body, payload, `Request failed with status ${response.status}`));
      }

      onCommentUpdated?.(commentId, {
        description: trimmed,
        updatedAt: new Date(),
      });
      onActionSuccess?.("Description updated successfully!");
      setIsEditing(false);
    } catch (error) {
      const message = resolveRequestErrorMessage(error, "Failed to update description.");
      const moderationReason = extractModerationReason(message);
      console.error("Failed to update description:", error);
      if (moderationReason) {
        setEditErrorMsg(moderationReason);
      } else {
        onActionError?.(message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteModal = () => {
    if (!isAuthor || isDeleting || isUpdating) return;
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDeleteComment = async () => {
    if (!isAuthor) {
      onActionError?.("Only comment author can delete this comment.");
      return;
    }
    if (!commentId) {
      onActionError?.("Comment id missing. Unable to delete.");
      return;
    }

    setIsDeleting(true);
    try {
      const urlencoded = new URLSearchParams();
      urlencoded.append("descriptionId", commentId);

      const response = await coreBackendClient.post(
        "post/discriptionDelete",
        urlencoded,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const body = response.data;
      const payload = extractApiPayload(body);
      const ok = resolveApiOk(body, payload);

      if (!ok) {
        throw new Error(resolveApiMessage(body, payload, `Request failed with status ${response.status}`));
      }

      setIsDeleteModalOpen(false);
      onCommentDeleted?.(commentId);
      onActionSuccess?.("Comment deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete comment.";
      console.error("Failed to delete comment:", error);
      onActionError?.(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenReportModal = () => {
    if (isAuthor || isDeleting || isUpdating || isReporting) return;
    setReportReason("");
    setReportDetails("");
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    if (isReporting) return;
    setIsReportModalOpen(false);
    setReportReason("");
    setReportDetails("");
  };

  const handleReportComment = async () => {
    if (!reportReason) return;
    if (!commentId) {
      onActionError?.("Comment id missing. Unable to report.");
      return;
    }

    const trimmedDetails = reportDetails.trim();
    const reasonLabel = getReportReasonLabel(reportReason);

    setIsReporting(true);
    try {
      const accessToken = authStore.getToken();
      const response = await apiClient.post("/report", {
        targetType: "COMMENT",
        targetId: commentId,
        reason: reportReason,
        details: trimmedDetails || reasonLabel,
      }, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      const body = response.data;
      const payload = extractApiPayload(body);
      const ok = resolveApiOk(body, payload);

      if (!ok) {
        throw new Error(resolveApiMessage(body, payload, `Request failed with status ${response.status}`));
      }

      const successMessage = resolveApiMessage(body, payload, "Report submitted for AI moderation.");
      setIsReportModalOpen(false);
      setReportReason("");
      setReportDetails("");
      onActionSuccess?.(successMessage);
    } catch (error) {
      const message = resolveRequestErrorMessage(error, "Failed to report comment.");
      onActionError?.(message);
    } finally {
      setIsReporting(false);
    }
  };



  if (!currentUser) {
    return (
      <div className="border-1 border-solid border-yellow-400 rounded-lg bg-white mb-6 p-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-orange-400 font-semibold text-lg mb-1 capitalize">{comments.username}ssss</h4>
            <p className="text-black text-base leading-relaxed">
              {comments.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border border-yellow-400 rounded-lg bg-white mb-6 p-3 w-full max-w-xs">
        <div className="flex items-start justify-between ">
          <div className="flex flex-col min-h-[100px] w-100" >
            <div className="flex-1 ">
              <div className="flex w-full items-start justify-between mb-3 ">
                <h4 className="text-orange-400 font-semibold text-lg mb-1 capitalize" >{comments.username}</h4>
                <div className="ml-4 flex items-center gap-2">
                  <Tooltip title="Like">
                    {/* <p></p> */}
                    <button
                      type="button"
                      onClick={likeDislikeAPI}
                      disabled={isLiking || isUpdating || isDeleting}
                      className={`flex cursor-pointer items-center gap-1 px-3 py-1 rounded-full transition-colors ${isLiked
                        ? 'text-blue-400 bg-blue-900/30'
                        : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20'
                        } ${(isLiking || isUpdating || isDeleting) ? 'opacity-60 cursor-not-allowed' : ''}`}
                      aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="font-medium">{likes}</span>
                    </button>
                  </Tooltip>
                </div>

              </div>
              {isEditing ? (
                <div className="mb-2" >
                  <TextField
                    value={editValue}
                    onChange={(event) => handleEditValueChange(event.target.value)}
                    size="small"
                    multiline
                    minRows={3}
                    fullWidth
                    disabled={isUpdating || isDeleting}
                    error={Boolean(editErrorMsg)}
                    helperText={editErrorMsg || `${editValue.length}/200`}
                    inputProps={{ maxLength: 200 }}
                    FormHelperTextProps={{
                      sx: {
                        marginLeft: 0,
                        marginRight: 0,
                        textAlign: editErrorMsg ? "left" : "right",
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-black text-base leading-relaxed">
                  {comments.description}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-500 mt-2 gap-4">

              {/* Date */}
              <span>
                {new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
                  .format(new Date(comments.createdAt))
                  .replace(",", "")
                }
              </span>

              {/* Edit/Delete/Report */}
              {isAuthor ? (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateComment}
                        disabled={isUpdating || isDeleting}
                        className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isUpdating || isDeleting}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        disabled={isDeleting || isUpdating}
                        className="text-gray-500 hover:text-blue-600 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenDeleteModal}
                        disabled={isDeleting || isUpdating}
                        className="text-gray-500 hover:text-red-600 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={handleOpenReportModal}
                    disabled={isDeleting || isUpdating || isReporting}
                    className="text-gray-500 hover:text-red-600 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    <TriangleAlert className="w-3 h-3" />
                    Report
                  </button>
                </div>
              )}

            </div>        </div>
        </div>
      </div>

      <Dialog
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="inherit" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteComment}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isReportModalOpen}
        onClose={handleCloseReportModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Report Comment</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600 mb-2">
            Select a reason for reporting this comment.
          </p>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              {REPORT_REASONS.map((reason) => (
                <FormControlLabel
                  key={reason.value}
                  value={reason.value}
                  control={<Radio />}
                  label={reason.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <TextField
            margin="dense"
            fullWidth
            multiline
            minRows={3}
            label="Additional details (optional)"
            placeholder="Share extra context to help moderation."
            value={reportDetails}
            onChange={(event) => setReportDetails(event.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${reportDetails.length}/500`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportModal} color="inherit" disabled={isReporting}>
            Cancel
          </Button>
          <Button
            onClick={handleReportComment}
            color="error"
            variant="contained"
            disabled={!reportReason || isReporting}
          >
            {isReporting ? "Reporting..." : "Report"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommentCard;
