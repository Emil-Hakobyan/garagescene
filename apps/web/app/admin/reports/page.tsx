'use client';

import { useEffect, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { apiGet, apiPut } from '@/lib/api-client';
import { AdminReport, PaginatedResponse } from '@/lib/types/admin';

function getReporterName(
  reporter: AdminReport['reporter'],
): string {
  return typeof reporter === 'string' ? reporter : reporter.name;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async (currentPage: number) => {
    try {
      const response = await apiGet<PaginatedResponse<AdminReport>>(
        `/admin/reports?page=${currentPage}&limit=20`,
        true,
      );
      setReports(response.data);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setError(null);
    } catch {
      setError('Failed to load reports.');
    }
  };

  useEffect(() => {
    loadReports(page);
  }, [page]);

  const handleResolve = async (reportId: string) => {
    setResolvingId(reportId);

    try {
      await apiPut(`/admin/reports/${reportId}/resolve`, {}, true);
      await loadReports(page);
    } catch {
      setError('Failed to resolve report.');
    } finally {
      setResolvingId(null);
    }
  };

  const columns: DataTableColumn<AdminReport>[] = [
    {
      key: 'reporter',
      header: 'Reporter',
      render: (report) => getReporterName(report.reporter),
    },
    {
      key: 'targetType',
      header: 'Target Type',
      render: (report) => (
        <span className="uppercase tracking-[0.12em]">{report.targetType}</span>
      ),
    },
    {
      key: 'targetId',
      header: 'Target ID',
      render: (report) => (
        <span className="font-mono text-xs text-zinc-400">{report.targetId}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (report) => (
        <span className="max-w-xs truncate block">{report.reason}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (report) => (
        <span
          className={
            report.status === 'pending' ? 'text-amber-400' : 'text-emerald-400'
          }
        >
          {report.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (report) =>
        report.status === 'pending' ? (
          <button
            type="button"
            disabled={resolvingId === report._id}
            onClick={() => handleResolve(report._id)}
            className="border border-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-white hover:text-black disabled:opacity-50"
          >
            {resolvingId === report._id ? 'Saving...' : 'Resolve'}
          </button>
        ) : (
          <span className="text-zinc-600">—</span>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Reports</h2>
        <p className="mt-2 text-zinc-500">Review and resolve user reports.</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <DataTable
        columns={columns}
        data={reports}
        emptyMessage="No reports found."
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
