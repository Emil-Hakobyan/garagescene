'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { setToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[]; error?: string }
      | string
      | undefined;

    if (typeof data === 'string') {
      return data;
    }

    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }

    if (typeof data?.error === 'string') {
      return data.error;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
    const body = { email: data.email, password: data.password };

    try {
      const response = await axios.post<{ access_token: string }>(
        loginUrl,
        body,
      );
      setToken(response.data.access_token);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Login error response:', {
          url: loginUrl,
          requestBody: body,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
        });
      } else {
        console.error('Login error:', err);
      }

      setError(getErrorMessage(err));
    }
  };

  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

  return (
    <div className="border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl shadow-black/40">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Get back to building something raw.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <p className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">
          or
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <a
        href={googleAuthUrl}
        className="flex w-full items-center justify-center border border-zinc-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:border-zinc-400 hover:bg-zinc-900"
      >
        Continue with Google
      </a>

      <p className="mt-8 text-center text-sm text-zinc-500">
        No account yet?{' '}
        <Link
          href="/register"
          className="font-medium text-white underline underline-offset-4 transition-colors hover:text-zinc-300"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
