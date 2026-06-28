interface StarRatingProps {
  rating: number;
  max?: number;
}

export function StarRating({ rating, max = 5 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => {
        const filled = rating >= index + 1;
        const half = !filled && rating > index && rating < index + 1;

        return (
          <span
            key={index}
            className={`text-xl ${
              filled
                ? 'text-amber-400'
                : half
                  ? 'text-amber-400/50'
                  : 'text-zinc-700'
            }`}
          >
            ★
          </span>
        );
      })}
      <span className="ml-2 text-sm text-zinc-400">
        {rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
      </span>
    </div>
  );
}
