interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <p className="text-sm text-zinc-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
