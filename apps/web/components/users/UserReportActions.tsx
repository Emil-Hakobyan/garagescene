'use client';

import { ReportButton } from '@/components/admin/ReportButton';

interface UserReportActionsProps {
  userId: string;
}

export function UserReportActions({ userId }: UserReportActionsProps) {
  return (
    <div className="mt-8">
      <ReportButton targetType="user" targetId={userId} />
    </div>
  );
}
