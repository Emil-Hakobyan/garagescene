'use client';

import { CREATIVE_ROLES, formatLabel } from '@/lib/constants/profile';

interface RoleCheckboxesProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function RoleCheckboxes({
  value,
  onChange,
  disabled = false,
}: RoleCheckboxesProps) {
  const toggleRole = (role: string) => {
    if (value.includes(role)) {
      onChange(value.filter((item) => item !== role));
      return;
    }

    onChange([...value, role]);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CREATIVE_ROLES.map((role) => (
        <label
          key={role}
          className="flex cursor-pointer items-center gap-3 border border-zinc-800 bg-zinc-950/60 px-4 py-3 transition-colors hover:border-zinc-600 has-[:checked]:border-white has-[:checked]:bg-zinc-900"
        >
          <input
            type="checkbox"
            checked={value.includes(role)}
            disabled={disabled}
            onChange={() => toggleRole(role)}
            className="h-4 w-4 accent-white"
          />
          <span className="text-sm text-zinc-200">{formatLabel(role)}</span>
        </label>
      ))}
    </div>
  );
}
