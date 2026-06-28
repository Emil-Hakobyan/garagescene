'use client';

import { useEffect, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { formatLabel } from '@/lib/constants/profile';
import { apiDelete, apiGet } from '@/lib/api-client';
import { AdminProject, PaginatedResponse } from '@/lib/types/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getOwnerName(owner: AdminProject['owner']): string {
  return typeof owner === 'string' ? owner : owner.name;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async (currentPage: number) => {
    try {
      const response = await apiGet<PaginatedResponse<AdminProject>>(
        `/admin/projects?page=${currentPage}&limit=20`,
        true,
      );
      setProjects(response.data);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setError(null);
    } catch {
      setError('Failed to load projects.');
    }
  };

  useEffect(() => {
    loadProjects(page);
  }, [page]);

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Delete this project permanently?')) {
      return;
    }

    setDeletingId(projectId);

    try {
      await apiDelete(`/admin/projects/${projectId}`, true);
      await loadProjects(page);
    } catch {
      setError('Failed to delete project.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns: DataTableColumn<AdminProject>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (project) => (
        <span className="font-medium text-white">{project.title}</span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (project) => getOwnerName(project.owner),
    },
    {
      key: 'genre',
      header: 'Genre',
      render: (project) => formatLabel(project.genre),
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (project) => formatLabel(project.stage),
    },
    {
      key: 'created',
      header: 'Created',
      render: (project) => formatDate(project.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (project) => (
        <button
          type="button"
          disabled={deletingId === project._id}
          onClick={() => handleDelete(project._id)}
          className="border border-red-900/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300 hover:bg-red-950/30 disabled:opacity-50"
        >
          {deletingId === project._id ? 'Deleting...' : 'Delete'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Projects</h2>
        <p className="mt-2 text-zinc-500">Review and remove projects.</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <DataTable
        columns={columns}
        data={projects}
        emptyMessage="No projects found."
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
