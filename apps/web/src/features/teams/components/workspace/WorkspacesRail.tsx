'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { workspacePath } from '@/utils/paths';
import { useWorkspacesQuery } from '@/services/workspaces.service';

// The workspaces the caller manages, above the teams. Nothing for everyone else.
export default function WorkspacesRail({ activeId }: { activeId: number | null }) {
  const t = useTranslations('teams.workspace');
  const managed = (useWorkspacesQuery().data ?? []).flatMap(({ role, ...entry }) =>
    role ? [{ ...entry, role }] : [],
  );
  if (managed.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t('rail')}
      </h2>
      <ul className="space-y-0.5">
        {managed.map((workspace) => {
          const active = workspace.id === activeId;
          return (
            <li key={workspace.id}>
              <Link
                href={workspacePath(workspace.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-8 w-full items-center gap-2 rounded-md px-2 text-start text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                  active
                    ? 'bg-secondary font-medium text-secondary-foreground'
                    : 'text-foreground/85 hover:bg-accent/60 hover:text-foreground',
                )}
              >
                <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t(`roles.${workspace.role}`)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
