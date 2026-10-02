'use client';

import WorkspaceSsoSection from '@/features/teams/components/workspace/sso/WorkspaceSsoSection';
import { useRouteWorkspaceId } from '@/features/teams/hooks/useRouteWorkspaceId';

export default function Page() {
  const workspaceId = useRouteWorkspaceId();
  return workspaceId !== null && <WorkspaceSsoSection workspaceId={workspaceId} />;
}
