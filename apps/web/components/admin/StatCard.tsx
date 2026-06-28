interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}
    </div>
  );
}
