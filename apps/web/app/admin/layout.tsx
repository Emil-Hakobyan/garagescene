'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';
import { UserProfile } from '@/lib/types/user';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/reports', label: 'Reports' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const verifyAdmin = async () => {
      try {
        const user = await apiGet<UserProfile>('/users/me', true);

        if (user.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }

        setIsReady(true);
      } catch {
        router.replace('/dashboard');
      }
    };

    verifyAdmin();
  }, [router]);

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
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/40">
        <div className="border-b border-zinc-800 px-6 py-6">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.35em] text-zinc-500"
          >
            GarageScene
          </Link>
          <h1 className="mt-2 text-xl font-bold text-white">Admin</h1>
        </div>

        <nav className="flex-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 block px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 px-6 py-4">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.15em] text-zinc-500 hover:text-zinc-300"
          >
            ← Back to app
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
