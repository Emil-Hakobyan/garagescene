import { formatLabel } from '@/lib/constants/profile';
import { ROLE_BADGE_COLORS } from '@/lib/constants/projects';

interface RolesNeededBadgesProps {
  roles?: string[];
  customRole?: string;
}

export function RolesNeededBadges({
  roles = [],
  customRole,
}: RolesNeededBadgesProps) {
  if (roles.length === 0 && !customRole) {
    return (
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
        No roles listed
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <span
          key={role}
          className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            ROLE_BADGE_COLORS[role] ??
            'border-zinc-700 bg-zinc-950 text-zinc-300'
          }`}
        >
          {formatLabel(role)}
        </span>
      ))}
      {customRole && (
        <span className="border border-white/30 bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {customRole}
        </span>
      )}
    </div>
  );
}
