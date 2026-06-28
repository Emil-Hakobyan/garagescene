'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiDelete, apiGet, apiPost } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';
import { UserProfile, PortfolioItem } from '@/lib/types/user';

const portfolioSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    url: z.string().optional(),
    type: z.enum(['link', 'upload']),
    fileUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'link' && !data.url) {
      ctx.addIssue({
        code: 'custom',
        message: 'URL is required for link items',
        path: ['url'],
      });
    }

    if (data.type === 'upload' && !data.fileUrl) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please upload a file',
        path: ['fileUrl'],
      });
    }
  });

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

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

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      type: 'link',
      fileUrl: '',
    },
  });

  const selectedType = watch('type');

  const loadPortfolio = async () => {
    const user = await apiGet<UserProfile>('/users/me', true);
    setPortfolio(user.portfolio ?? []);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    loadPortfolio()
      .then(() => setIsReady(true))
      .catch(() => {
        setError('Failed to load portfolio.');
        setIsReady(true);
      });
  }, [router]);

  const onSubmit = async (data: PortfolioFormValues) => {
    setError(null);

    try {
      await apiPost(
        '/users/me/portfolio',
        {
          title: data.title,
          description: data.description || undefined,
          url: data.type === 'link' ? data.url : undefined,
          type: data.type,
          fileUrl: data.type === 'upload' ? data.fileUrl : undefined,
        },
        true,
      );
      reset({
        title: '',
        description: '',
        url: '',
        type: 'link',
        fileUrl: '',
      });
      await loadPortfolio();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (itemId: string) => {
    setError(null);
    setDeletingId(itemId);

    try {
      await apiDelete(`/users/me/portfolio/${itemId}`, true);
      await loadPortfolio();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue('fileUrl', reader.result as string, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              GarageScene
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
              Portfolio
            </h1>
          </div>
          <Link
            href="/profile"
            className="border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
          >
            Back to Profile
          </Link>
        </div>

        <div className="mb-10 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Your Work
          </h2>

          {portfolio.length === 0 ? (
            <p className="border border-zinc-800 bg-zinc-900/40 px-6 py-8 text-zinc-500">
              No portfolio items yet. Add your first piece below.
            </p>
          ) : (
            <div className="grid gap-4">
              {portfolio.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 border border-zinc-800 bg-zinc-900/40 p-6 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                      <span className="border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                        {item.type}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-2 text-sm text-zinc-400">
                        {item.description}
                      </p>
                    )}
                    {item.type === 'link' && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-white underline underline-offset-4"
                      >
                        View link
                      </a>
                    )}
                    {item.type === 'upload' && item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-white underline underline-offset-4"
                      >
                        View upload
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="border border-red-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-300 transition-colors hover:border-red-500 hover:bg-red-950/30 disabled:opacity-50"
                  >
                    {deletingId === item._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 border border-zinc-800 bg-zinc-900/40 p-8"
        >
          <h2 className="text-xl font-bold text-white">Add New Item</h2>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Title
            </label>
            <input
              className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              {...register('title')}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              {...register('description')}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Type
            </label>
            <select
              className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              {...register('type')}
            >
              <option value="link">Link</option>
              <option value="upload">Upload</option>
            </select>
          </div>

          {selectedType === 'link' ? (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                URL
              </label>
              <input
                placeholder="https://vimeo.com/your-reel"
                className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
                {...register('url')}
              />
              {errors.url && (
                <p className="mt-2 text-sm text-red-400">{errors.url.message}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                File Upload
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-300 file:mr-4 file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:text-white"
              />
              {errors.fileUrl && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.fileUrl.message}
                </p>
              )}
            </div>
          )}

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
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
