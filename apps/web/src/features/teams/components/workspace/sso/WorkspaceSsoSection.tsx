'use client';

import { useWorkspaceSsoQuery } from '@/services/workspaces.service';
import SectionPageSkeleton from '@/components/common/skeleton/SectionPageSkeleton';
import WorkspaceSsoForm from './WorkspaceSsoForm';

export default function WorkspaceSsoSection({ workspaceId }: { workspaceId: number }) {
  const settings = useWorkspaceSsoQuery(workspaceId).data;

  if (!settings) return <SectionPageSkeleton rows={5} />;

  // Keyed on the loaded state: a save replaces the cache entry, so the form remounts
  // with fresh initial values instead of a stale "dirty" comparison.
  return (
    <WorkspaceSsoForm
      key={JSON.stringify(settings)}
      workspaceId={workspaceId}
      settings={settings}
    />
  );
}
