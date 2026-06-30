// Rating Modal Component
import type React from "react";
import StarRating from "./StarRating";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Add `onRatingSubmitted` prop to handle success and error callbacks
interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRating: number;
  onSubmitRating: (rating: number) => Promise<void>;
  onRatingSubmitted?: (success: boolean, message?: string) => void;
  postId: string
}

// Rating Modal Component
const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  currentRating,
  onSubmitRating,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(currentRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await onSubmitRating(rating);

      onRatingSubmitted?.(
        true,
        "Rating submitted successfully."
      );

      onClose();
    } catch (error) {
      if (onRatingSubmitted) {
        onRatingSubmitted?.(
          false,
          "Failed to submit rating."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-opacity-50 bg-black/60 flex items-center justify-center p-4 z-[1000] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-black text-xl font-semibold mb-4">Rate this inscription</h3>

            <div className="flex justify-center mb-6">
              <StarRating
                rating={rating}
                size="w-8 h-8"
                interactive={!isSubmitting}
                onRate={setRating}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 cursor-pointer bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="submit-rating-btn"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 cursor-pointer bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default RatingModal;
