'use client';

import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { useRolesList } from '@/lib/hooks/useRoles';
import type { SelectOption } from '@/lib/selectStyles';
import type { ApiRole } from '@/lib/types/roles.types';

interface RoleSelectProps {
  value: string;
  onChange: (roleId: string) => void;
  styles: StylesConfig<SelectOption, false>;
  instanceId: string;
  inputId?: string;
  menuPortalTarget?: HTMLElement;
  menuPosition?: 'fixed' | 'absolute';
  menuPlacement?: 'auto' | 'bottom' | 'top';
}

/** Dropdown backed by GET /roles. Each option has an info icon — hovering it shows the role's description + permissions. */
export default function RoleSelect({
  value,
  onChange,
  styles,
  instanceId,
  inputId,
  menuPortalTarget,
  menuPosition,
  menuPlacement,
}: RoleSelectProps) {
  const { data: roles = [], isLoading } = useRolesList();

  const options: SelectOption[] = useMemo(
    () => roles.map(r => ({ value: r.id, label: r.name })),
    [roles],
  );
  const roleById = useMemo(() => new Map(roles.map(r => [r.id, r] as const)), [roles]);
  const selected = options.find(o => o.value === value) ?? null;

  return (
    <Select
      inputId={inputId}
      instanceId={instanceId}
      options={options}
      value={selected}
      onChange={opt => opt && onChange(opt.value)}
      styles={styles}
      isSearchable={false}
      isLoading={isLoading}
      placeholder={isLoading ? 'Loading roles…' : 'Select role…'}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
      menuPlacement={menuPlacement}
      formatOptionLabel={(opt, { context }) => {
        if (context !== 'menu') return opt.label;
        return (
          <span className="flex items-center justify-between gap-2">
            <span className="truncate">{opt.label}</span>
            <RolePermissionsInfo role={roleById.get(opt.value)} />
          </span>
        );
      }}
    />
  );
}

// Portal-positioned so it always escapes react-select's own scrollable menu list
// (a plain CSS-absolute tooltip gets clipped by the menu's overflow, especially in
// the narrow "sm" role rows on the Create/Manage Team pages).
function RolePermissionsInfo({ role }: { role?: ApiRole }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  if (!role) return null;

  const show = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.top - 8, left: rect.left + rect.width / 2 });
  };
  const hide = () => setCoords(null);

  return (
    <button
      ref={anchorRef}
      type="button"
      aria-label={`${role.name} permissions`}
      className="shrink-0 flex items-center justify-center text-text-300 hover:text-text-100 focus:outline-none focus-visible:text-text-100 transition-colors"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <Info size={13} strokeWidth={1.5} />
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-[9999] w-56 text-left -translate-x-1/2 -translate-y-full"
          style={{ top: coords.top, left: coords.left }}
        >
          <div className="bg-bg-600 border border-border-subtle rounded-lg px-3 py-2 shadow-elevated text-2xs leading-relaxed text-text-200">
            {role.description && <p className="text-text-100 font-medium mb-1.5">{role.description}</p>}
            {!!role.permissions?.length && (
              <div className="flex flex-wrap gap-1">
                {role.permissions.map(p => (
                  <span key={p} className="px-1.5 py-0.5 rounded bg-bg-700 border border-border-subtle text-text-300">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </button>
  );
}

export function roleHasPermission(role: ApiRole | undefined | null, permission: string): boolean {
  return !!role?.permissions?.includes(permission);
}
