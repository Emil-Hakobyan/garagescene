'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { GenreTagSelector } from '@/components/ui/GenreTagSelector';
import { RoleCheckboxes } from '@/components/ui/RoleCheckboxes';
import { apiGet, apiPut } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';
import { CREATIVE_ROLES, GENRE_TAGS } from '@/lib/constants/profile';
import { UserProfile } from '@/lib/types/user';

const profileSchema = z.object({
  bio: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
  }),
  roles: z.array(z.enum(CREATIVE_ROLES)),
  customRole: z.string().optional(),
  genreTags: z.array(z.enum(GENRE_TAGS)),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

  return 'Failed to save profile.';
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      location: { city: '', region: '', country: '' },
      roles: [],
      customRole: '',
      genreTags: [],
    },
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await apiGet<UserProfile>('/users/me', true);
        setProfile(user);
        reset({
          bio: user.bio ?? '',
          location: {
            city: user.location?.city ?? '',
            region: user.location?.region ?? '',
            country: user.location?.country ?? '',
          },
          roles: (user.roles ?? []).filter((role): role is (typeof CREATIVE_ROLES)[number] =>
            CREATIVE_ROLES.includes(role as (typeof CREATIVE_ROLES)[number]),
          ),
          customRole: user.customRole ?? '',
          genreTags: (user.genreTags ?? []).filter((tag): tag is (typeof GENRE_TAGS)[number] =>
            GENRE_TAGS.includes(tag as (typeof GENRE_TAGS)[number]),
          ),
        });
        setIsReady(true);
      } catch {
        setError('Failed to load profile.');
        setIsReady(true);
      }
    };

    loadProfile();
  }, [reset, router]);

  const onSubmit = async (data: ProfileFormValues) => {
    setError(null);
    setSuccess(null);

    try {
      const updated = await apiPut<UserProfile>(
        '/users/me',
        {
          bio: data.bio || undefined,
          location: {
            city: data.location.city || undefined,
            region: data.location.region || undefined,
            country: data.location.country || undefined,
          },
          roles: data.roles,
          customRole: data.customRole || undefined,
          genreTags: data.genreTags,
        },
        true,
      );
      setProfile(updated);
      setSuccess('Profile saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              GarageScene
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
              Edit Profile
            </h1>
          </div>
          <Link
            href="/profile/portfolio"
            className="border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
          >
            Portfolio
          </Link>
        </div>

        <div className="mb-8 flex items-center gap-5 border border-zinc-800 bg-zinc-900/40 p-6">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-20 w-20 rounded-full border border-zinc-700 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xl font-bold text-white">
              {profile ? getInitials(profile.name) : 'GS'}
            </div>
          )}
          <div>
            <p className="text-xl font-semibold text-white">{profile?.name}</p>
            <p className="text-sm text-zinc-500">{profile?.email}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 border border-zinc-800 bg-zinc-900/40 p-8"
        >
          <div>
            <label
              htmlFor="bio"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={5}
              placeholder="Tell the world what you create..."
              className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
              {...register('bio')}
            />
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Location
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                placeholder="City"
                className="border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
                {...register('location.city')}
              />
              <input
                placeholder="Region"
                className="border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
                {...register('location.region')}
              />
              <input
                placeholder="Country"
                className="border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
                {...register('location.country')}
              />
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Film Roles
            </p>
            <Controller
              name="roles"
              control={control}
              render={({ field }) => (
                <RoleCheckboxes
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.roles && (
              <p className="mt-2 text-sm text-red-400">{errors.roles.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="customRole"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
            >
              Custom Role
            </label>
            <input
              id="customRole"
              placeholder="e.g. Stunt coordinator"
              className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
              {...register('customRole')}
            />
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Genre Tags
            </p>
            <Controller
              name="genreTags"
              control={control}
              render={({ field }) => (
                <GenreTagSelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          {error && (
            <p className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
