import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
  showValue?: boolean;
  totalRatings?: number;
  className?: string;
  interactive?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 20,
  showValue = false,
  totalRatings,
  className,
  interactive = true,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;
  const isInteractive = !readOnly && interactive && onChange;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFullStar = displayValue >= star;
          const isHalfStar = displayValue >= star - 0.5 && displayValue < star;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly || !onChange}
              aria-label={`Calificar ${star} estrellas`}
              onClick={() => {
                if (isInteractive) {
                  onChange(star);
                }
              }}
              onMouseEnter={() => {
                if (isInteractive) {
                  setHoverValue(star);
                }
              }}
              className={cn(
                "transition-all duration-150",
                isInteractive && "cursor-pointer hover:scale-110",
                readOnly && "cursor-default"
              )}
              style={{
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              <Star
                size={size}
                className={cn(
                  "transition-colors duration-150",
                  isFullStar
                    ? "text-yellow-400 fill-yellow-400"
                    : isHalfStar
                      ? "text-yellow-400 fill-yellow-200"
                      : "text-gray-300"
                )}
                strokeWidth={1.5}
                fill={
                  isFullStar
                    ? "#facc15"
                    : isHalfStar
                      ? "#fef08a"
                      : "none"
                }
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <div className="flex items-baseline gap-1 text-sm">
          <span className="font-semibold text-gray-900">
            {value > 0 ? value.toFixed(1) : "0.0"}
          </span>
          {totalRatings !== undefined && (
            <span className="text-xs text-gray-500">
              ({totalRatings} {totalRatings === 1 ? "valoración" : "valoraciones"})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
