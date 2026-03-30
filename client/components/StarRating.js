import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
  className = "",
  label = "Rating"
}) {
  const roundedValue = Number(rating || 0);

  return (
    <div className={`inline-flex items-center gap-1 ${className}`.trim()} aria-label={label}>
      {Array.from({ length: max }).map((_, index) => {
        const value = index + 1;
        const isFilled = value <= roundedValue;

        if (!interactive) {
          return (
            <Star
              key={value}
              size={size}
              className={isFilled ? "text-amber-500" : "text-stone-300"}
              fill={isFilled ? "currentColor" : "none"}
            />
          );
        }

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange?.(value)}
            className="rounded-full p-1 transition hover:scale-105"
            aria-label={`Set rating to ${value} star${value > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={value <= roundedValue ? "text-amber-500" : "text-stone-300"}
              fill={value <= roundedValue ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}
