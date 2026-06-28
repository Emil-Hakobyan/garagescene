'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, removeToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsReady(true);
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-lg border border-zinc-800 bg-zinc-900/40 p-10 text-center shadow-2xl shadow-black/40">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-zinc-500">
          GarageScene
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Welcome to GarageScene
        </h1>
        <p className="mt-4 text-zinc-400">
          You&apos;re in. Time to make something worth remembering.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-10 border border-zinc-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-zinc-400 hover:bg-zinc-900"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
