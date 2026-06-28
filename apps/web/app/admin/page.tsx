'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/StatCard';
import { apiGet } from '@/lib/api-client';
import {
  AdminReport,
  AdminStats,
  PaginatedResponse,
} from '@/lib/types/admin';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingReports, setPendingReports] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, reportsData] = await Promise.all([
          apiGet<AdminStats>('/admin/stats', true),
          apiGet<PaginatedResponse<AdminReport>>(
            '/admin/reports?page=1&limit=100',
            true,
          ),
        ]);

        setStats(statsData);
        setPendingReports(
          reportsData.data.filter((report) => report.status === 'pending')
            .length,
        );
      } catch {
        setError('Failed to load dashboard stats.');
      }
    };

    load();
  }, []);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!stats) {
    return (
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Loading dashboard...
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="mt-2 text-zinc-500">Platform overview and activity.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Projects" value={stats.totalProjects} />
        <StatCard
          title="Total Conversations"
          value={stats.totalConversations}
        />
        <StatCard title="Pending Reports" value={pendingReports} />
      </div>
    </div>
  );
}
