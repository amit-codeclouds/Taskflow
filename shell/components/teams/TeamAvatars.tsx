'use client';

import Image from 'next/image';
import type { ApiTeamMember } from '@/lib/types/teams.types';
import { getInitials } from '@/lib/initials';

export function TeamInitial({ color, name }: { color: string; name: string }) {
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-semibold shrink-0"
      style={{ background: color + '33', color }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function MemberAvatar({ member, size = 'md' }: { member: ApiTeamMember; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  const px = size === 'sm' ? 28 : 36;
  const initials = member.avatarInitials || getInitials(member.name);

  return (
    <div className="relative group/avatar">
      {member.avatarUrl ? (
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={px}
          height={px}
          className={`${dim} rounded-full object-cover shrink-0 border-2 border-bg-700 cursor-pointer transition-transform group-hover/avatar:scale-110`}
        />
      ) : (
        <div
          className={`
            ${dim} rounded-full flex items-center justify-center font-semibold shrink-0
            border-2 border-bg-700 cursor-pointer transition-transform group-hover/avatar:scale-110
            bg-accent-bg text-accent
          `}
        >
          {initials}
        </div>
      )}

      {/* Hover tooltip */}
      <div
        className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
          pointer-events-none
          opacity-0 group-hover/avatar:opacity-100
          scale-95 group-hover/avatar:scale-100
          transition-all duration-150
          min-w-[148px]
        "
      >
        <div className="bg-bg-600 border border-border-subtle rounded-lg px-3 py-2 shadow-elevated">
          <div className="flex items-center gap-2">
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={member.name}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0 bg-accent-bg text-accent">
                {initials}
              </div>
            )}
            <p className="text-xs font-medium text-text-100 whitespace-nowrap">{member.name}</p>
          </div>
          <p className="text-[11px] text-text-300 mt-0.5 whitespace-nowrap">{member.role}</p>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-600" />
      </div>
    </div>
  );
}
