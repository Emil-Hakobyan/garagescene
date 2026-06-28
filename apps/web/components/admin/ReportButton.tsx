'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';

interface ReportButtonProps {
  targetType: 'user' | 'project';
  targetId: string;
  label?: string;
}

export function ReportButton({
  targetType,
  targetId,
  label = 'Report',
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated()) {
      setError('Please log in to submit a report.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await apiPost(
        '/reports',
        {
          targetType,
          targetId,
          reason: reason.trim(),
        },
        true,
      );
      setMessage('Report submitted. Thank you.');
      setReason('');
      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
      }, 1500);
    } catch {
      setError('Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="border border-red-900/60 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-red-300 transition-colors hover:border-red-500 hover:bg-red-950/30"
      >
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-lg font-bold text-white">Submit Report</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Tell us why you&apos;re reporting this {targetType}.
            </p>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              placeholder="Describe the issue..."
              className="mt-4 w-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-zinc-400"
            />

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            {message && (
              <p className="mt-3 text-sm text-emerald-400">{message}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-black disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
