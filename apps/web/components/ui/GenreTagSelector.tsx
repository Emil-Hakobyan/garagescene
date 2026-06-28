'use client';

import { formatLabel, GENRE_TAGS } from '@/lib/constants/profile';

interface GenreTagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function GenreTagSelector({
  value,
  onChange,
  disabled = false,
}: GenreTagSelectorProps) {
  const toggleGenre = (genre: string) => {
    if (value.includes(genre)) {
      onChange(value.filter((item) => item !== genre));
      return;
    }

    onChange([...value, genre]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {GENRE_TAGS.map((genre) => {
        const selected = value.includes(genre);

        return (
          <button
            key={genre}
            type="button"
            disabled={disabled}
            onClick={() => toggleGenre(genre)}
            className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? 'border-white bg-white text-black'
                : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {formatLabel(genre)}
          </button>
        );
      })}
    </div>
  );
}
