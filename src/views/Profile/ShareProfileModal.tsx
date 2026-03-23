import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaLink } from "react-icons/fa";
import { Share, Share2, X } from "lucide-react";
import { Alert, Slide, Snackbar, Tooltip } from "@mui/material";
import { createPortal } from "react-dom";

const ShareProfileModal: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl);
            setSnackbarMessage("Link copied to clipboard!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err) {
            console.error("Failed to copy: ", err);
            setSnackbarMessage("Failed to copy link.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const shareLinks = [
        { name: "Facebook", icon: <FaFacebookF />, url: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, color: "bg-blue-600", tooltipText: "Share to Facebook" },
        { name: "Twitter", icon: <FaTwitter />, url: `https://twitter.com/intent/tweet?url=${pageUrl}`, color: "bg-sky-500", tooltipText: "Share to Twitter" },
        { name: "LinkedIn", icon: <FaLinkedinIn />, url: `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}`, color: "bg-blue-700", tooltipText: "Share to LinkedIn" },
        { name: "WhatsApp", icon: <FaWhatsapp />, url: `https://wa.me/?text=${pageUrl}`, color: "bg-green-500", tooltipText: "Share to Whatsapp" },
    ];

    return (
        <div className="flex justify-center items-center cursor-auto">
            {typeof document !== "undefined" &&
                createPortal(
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleSnackbarClose}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        TransitionComponent={Slide}
                        sx={{ zIndex: 20000 }}
                    >
                        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>,
                    document.body
                )}

            {/* Share Button */}
            <Tooltip title="Share" className="cursor-pointer">
                <button onClick={() => setOpen(true)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer">
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
            </Tooltip>


            {/* Modal */}
            {createPortal(
                <AnimatePresence style={{ position: "absolute", zIndex: 9999, width: "100vw", height: "100vh" }}>
                    {open && (
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center bg-none bg-opacity-40 backdrop-brightness-40 z-50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        >
                            <motion.div
                                className="bg-white relative rounded-2xl p-6 w-80 sm:w-96 shadow-xl relative"
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                transition={{ duration: 0.25 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Share this profile</h2>

                                <div className="flex justify-center flex-wrap gap-3">
                                    {shareLinks.map((link) => (
                                        <Tooltip key={link.name} title={link.tooltipText}>
                                            <a
                                                key={link.name}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center justify-center ${link.color} text-white p-3 rounded-full w-12 h-12 hover:scale-110 transition-transform`}
                                            >
                                                {link.icon}
                                            </a>
                                        </Tooltip>
                                    ))}
                                    <Tooltip title="Copy link to clipboard" className="cursor-pointer">
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex items-center justify-center bg-gray-200 text-gray-700 p-3 rounded-full w-12 h-12 hover:bg-gray-300 transition-transform hover:scale-110"
                                        >
                                            <FaLink />
                                        </button>
                                    </Tooltip>
                                </div>

                                <button
                                    onClick={() => setOpen(false)}
                                    className="absolute left-70 bottom-40 md:bottom-25 md:left-88 mt-6 w-full text-black py-2 rounded-xl hover:text-gray-900 cursor-pointer transition-all"
                                >
                                    <X />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default ShareProfileModal;
