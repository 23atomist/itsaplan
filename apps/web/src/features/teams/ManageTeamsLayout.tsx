'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { teamPath } from '@/utils/paths';
import { useTeamsQuery } from '@/services/teams.service';
import NewTeamModal from './components/NewTeamModal';
import TeamsPageView from './components/TeamsPageView';
import TeamsRail from './components/TeamsRail';
import WorkspacesRail from './components/workspace/WorkspacesRail';
import { useRouteTeam } from './hooks/useRouteTeam';
import { useRouteWorkspaceId } from './hooks/useRouteWorkspaceId';

// The teams the account belongs to, as the rail every team route is opened from, under
// the workspaces the account manages.
// The list carries each team's counters, so the section rail beside it shows them
// without a request of its own.
export default function ManageTeamsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('teams.manage');
  const { data, isPending } = useTeamsQuery();
  const router = useRouter();
  const activeId = useRouteTeam()?.id ?? null;
  const activeWorkspaceId = useRouteWorkspaceId();
  const [creating, setCreating] = useState(false);

  return (
    <TeamsPageView
      label={t('label')}
      list={
        <div className="space-y-6">
          <WorkspacesRail activeId={activeWorkspaceId} />
          <TeamsRail
            teams={data ?? []}
            isPending={isPending}
            activeId={activeId}
            onCreate={() => setCreating(true)}
          />
        </div>
      }
    >
      {children}

      {creating && (
        <NewTeamModal
          onClose={() => setCreating(false)}
          onCreated={(team) => router.push(teamPath(team.ref))}
        />
      )}
    </TeamsPageView>
  );
}
