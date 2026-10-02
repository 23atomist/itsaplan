'use client';

import WorkspaceTeamsSection from '@/features/teams/components/workspace/WorkspaceTeamsSection';
import { useRouteWorkspaceId } from '@/features/teams/hooks/useRouteWorkspaceId';

export default function Page() {
  const workspaceId = useRouteWorkspaceId();
  return workspaceId !== null && <WorkspaceTeamsSection workspaceId={workspaceId} />;
}
