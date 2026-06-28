'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CREATIVE_ROLES, formatLabel, GENRE_TAGS } from '@/lib/constants/profile';
import { PROJECT_STAGES } from '@/lib/constants/projects';

export function ProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/projects?${params.toString()}`);
  };

  const selectClassName =
    'border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-zinc-400';

  return (
    <div className="grid gap-4 border border-zinc-800 bg-zinc-900/40 p-6 sm:grid-cols-3">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Genre
        </label>
        <select
          value={searchParams.get('genre') ?? ''}
          onChange={(event) => updateFilter('genre', event.target.value)}
          className={`w-full ${selectClassName}`}
        >
          <option value="">All genres</option>
          {GENRE_TAGS.map((genre) => (
            <option key={genre} value={genre}>
              {formatLabel(genre)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Stage
        </label>
        <select
          value={searchParams.get('stage') ?? ''}
          onChange={(event) => updateFilter('stage', event.target.value)}
          className={`w-full ${selectClassName}`}
        >
          <option value="">All stages</option>
          {PROJECT_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {formatLabel(stage)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Role Needed
        </label>
        <select
          value={searchParams.get('roleNeeded') ?? ''}
          onChange={(event) => updateFilter('roleNeeded', event.target.value)}
          className={`w-full ${selectClassName}`}
        >
          <option value="">All roles</option>
          {CREATIVE_ROLES.map((role) => (
            <option key={role} value={role}>
              {formatLabel(role)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
