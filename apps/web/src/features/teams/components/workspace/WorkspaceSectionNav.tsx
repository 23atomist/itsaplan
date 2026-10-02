'use client';

import { usePathname } from 'next/navigation';
import { Info, ShieldCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { WorkspaceSummary } from '@/lib/api/endpoints/workspaces';
import { workspacePath } from '@/utils/paths';
import { useWorkspaceQuery } from '@/services/workspaces.service';
import { SectionNav, type SectionNavItem } from '@/components/common/page/SectionNav';

export default function WorkspaceSectionNav({ workspace }: { workspace: WorkspaceSummary }) {
  const t = useTranslations('teams.workspace');
  const pathname = usePathname();
  const detail = useWorkspaceQuery(workspace.id).data;

  const sections: SectionNavItem[] = [
    { id: 'info', label: t('info.title'), icon: Info, href: workspacePath(workspace.id) },
    {
      id: 'managers',
      label: t('managers.title'),
      icon: ShieldCheck,
      badge: detail && String(detail.managerCount),
      href: workspacePath(workspace.id, 'managers'),
    },
    {
      id: 'teams',
      label: t('teams.title'),
      icon: Users,
      badge: detail && String(detail.teamCount),
      href: workspacePath(workspace.id, 'teams'),
    },
  ];
  const activeId = sections.find((entry) => entry.href === pathname)?.id ?? null;

  return (
    <div className="space-y-2">
      <h2 className="truncate px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {workspace.name}
      </h2>
      <SectionNav sections={sections} activeId={activeId} label={workspace.name} />
    </div>
  );
}
