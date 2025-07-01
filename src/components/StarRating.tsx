import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 28,
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          aria-label={`Calificar ${star} estrellas`}
          onClick={() => !readOnly && onChange?.(star)}
          style={{
            cursor: readOnly ? "default" : "pointer",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <Star
            size={size}
            className={
              star <= value
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }
            strokeWidth={1.5}
            fill={star <= value ? "#facc15" : "none"}
          />
        </button>
      ))}
    </div>
  );
};
