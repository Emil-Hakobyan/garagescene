'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { RoleCheckboxes } from '@/components/ui/RoleCheckboxes';
import {
  CREATIVE_ROLES,
  formatLabel,
  GENRE_TAGS,
} from '@/lib/constants/profile';
import {
  MEDIA_SNIPPET_TYPES,
  PROJECT_STAGES,
} from '@/lib/constants/projects';
import { Project } from '@/lib/types/project';

const mediaSnippetSchema = z.object({
  url: z.url('Enter a valid URL'),
  type: z.enum(MEDIA_SNIPPET_TYPES),
});

const projectFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  teaser: z.string().min(1, 'Teaser is required').max(300, 'Max 300 characters'),
  fullDocument: z.string().optional(),
  genre: z.enum(GENRE_TAGS),
  stage: z.enum(PROJECT_STAGES),
  rolesNeeded: z.array(z.enum(CREATIVE_ROLES)),
  customRoleNeeded: z.string().optional(),
  mediaSnippets: z.array(mediaSnippetSchema),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }

    if (typeof data?.message === 'string') {
      return data.message;
    }
  }

  return 'Something went wrong.';
}

export function projectToFormValues(project: Project): ProjectFormValues {
  return {
    title: project.title,
    teaser: project.teaser,
    fullDocument: project.fullDocument ?? '',
    genre: project.genre as ProjectFormValues['genre'],
    stage: project.stage as ProjectFormValues['stage'],
    rolesNeeded: (project.rolesNeeded ?? []).filter(
      (role): role is (typeof CREATIVE_ROLES)[number] =>
        CREATIVE_ROLES.includes(role as (typeof CREATIVE_ROLES)[number]),
    ),
    customRoleNeeded: project.customRoleNeeded ?? '',
    mediaSnippets: project.mediaSnippets ?? [],
  };
}

export function ProjectForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: ProjectFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      teaser: '',
      fullDocument: '',
      genre: 'drama',
      stage: 'idea',
      rolesNeeded: [],
      customRoleNeeded: '',
      mediaSnippets: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mediaSnippets',
  });

  const teaserValue = watch('teaser') ?? '';

  const handleFormSubmit = async (values: ProjectFormValues) => {
    setError(null);

    try {
      await onSubmit(values);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const inputClassName =
    'w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Title
        </label>
        <input className={inputClassName} {...register('title')} />
        {errors.title && (
          <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Teaser
          </label>
          <span className="text-xs text-zinc-500">{teaserValue.length}/300</span>
        </div>
        <textarea
          rows={3}
          maxLength={300}
          className={inputClassName}
          {...register('teaser')}
        />
        {errors.teaser && (
          <p className="mt-2 text-sm text-red-400">{errors.teaser.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Full Idea / Script - only shared with people you approve
        </label>
        <textarea
          rows={8}
          className={inputClassName}
          placeholder="Your full treatment, script, or pitch deck content..."
          {...register('fullDocument')}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Genre
          </label>
          <select className={inputClassName} {...register('genre')}>
            {GENRE_TAGS.map((genre) => (
              <option key={genre} value={genre}>
                {formatLabel(genre)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Stage
          </label>
          <select className={inputClassName} {...register('stage')}>
            {PROJECT_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {formatLabel(stage)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Roles Needed
        </p>
        <Controller
          name="rolesNeeded"
          control={control}
          render={({ field }) => (
            <RoleCheckboxes
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Custom Role Needed
        </label>
        <input
          className={inputClassName}
          placeholder="e.g. Stunt coordinator"
          {...register('customRoleNeeded')}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Media Snippets
          </p>
          <button
            type="button"
            onClick={() => append({ url: '', type: 'link' })}
            className="border border-zinc-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
          >
            Add Link
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 border border-zinc-800 bg-zinc-950/60 p-4 sm:grid-cols-[1fr_auto_auto]"
            >
              <input
                placeholder="https://vimeo.com/example"
                className={inputClassName}
                {...register(`mediaSnippets.${index}.url`)}
              />
              <select
                className={inputClassName}
                {...register(`mediaSnippets.${index}.type`)}
              >
                {MEDIA_SNIPPET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(index)}
                className="border border-red-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-300 hover:bg-red-950/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200 disabled:opacity-60"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
