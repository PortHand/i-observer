import { Star } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import { feedback } from "../content/profileContent";

interface RatingFieldProps {
  rating: number;
  error?: string;
  onChange: (rating: number) => void;
}

/** One to five stars as a radio group, with the chosen rating's word beside it. */
export default function RatingField({ rating, error, onChange }: RatingFieldProps) {
  return (
    <fieldset className="field rating" aria-describedby={error ? "rating-error" : undefined}>
      <legend className="field__label">{feedback.ratingLabel}</legend>
      <div className="rating__options">
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="rating__option" title={feedback.ratings[value - 1]}>
            <input type="radio" name="rating" value={value} checked={rating === value} onChange={() => onChange(value)} />
            <Star className={value <= rating ? "icon rating__star rating__star--on" : "icon rating__star"} strokeWidth={1.75} />
            <span className="sr-only">{feedback.ratings[value - 1]}</span>
          </label>
        ))}
        <span className="rating__word mono">{rating ? feedback.ratings[rating - 1] : ""}</span>
      </div>
      <FieldError id="rating-error" message={error} />
    </fieldset>
  );
}
