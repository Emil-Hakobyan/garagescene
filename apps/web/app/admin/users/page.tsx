'use client';

import { useEffect, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { apiGet, apiPut } from '@/lib/api-client';
import { AdminUser, PaginatedResponse } from '@/lib/types/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (currentPage: number) => {
    try {
      const response = await apiGet<PaginatedResponse<AdminUser>>(
        `/admin/users?page=${currentPage}&limit=20`,
        true,
      );
      setUsers(response.data);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setError(null);
    } catch {
      setError('Failed to load users.');
    }
  };

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  const handleBanToggle = async (user: AdminUser) => {
    setLoadingId(user._id);

    try {
      if (user.isActive) {
        await apiPut(`/admin/users/${user._id}/ban`, {}, true);
      } else {
        await apiPut(`/admin/users/${user._id}/unban`, {}, true);
      }

      await loadUsers(page);
    } catch {
      setError('Failed to update user status.');
    } finally {
      setLoadingId(null);
    }
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => <span className="text-white">{user.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => user.email,
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className="uppercase tracking-[0.12em]">{user.role}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span
          className={
            user.isActive ? 'text-emerald-400' : 'text-red-400'
          }
        >
          {user.isActive ? 'Active' : 'Banned'}
        </span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (user) => formatDate(user.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <button
          type="button"
          disabled={loadingId === user._id}
          onClick={() => handleBanToggle(user)}
          className={`border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50 ${
            user.isActive
              ? 'border-red-900/60 text-red-300 hover:bg-red-950/30'
              : 'border-emerald-900/60 text-emerald-300 hover:bg-emerald-950/30'
          }`}
        >
          {loadingId === user._id
            ? 'Saving...'
            : user.isActive
              ? 'Ban'
              : 'Unban'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Users</h2>
        <p className="mt-2 text-zinc-500">Manage platform members.</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <DataTable columns={columns} data={users} emptyMessage="No users found." />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
