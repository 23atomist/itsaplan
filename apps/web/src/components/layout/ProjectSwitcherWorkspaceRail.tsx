import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { WorkspaceSummary } from '@/lib/api/endpoints/workspaces';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const workspaceTileClass = (active: boolean) =>
  cn(
    'flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
    active
      ? 'bg-secondary text-secondary-foreground ring-2 ring-foreground/80 ring-offset-2 ring-offset-sidebar'
      : 'bg-muted/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  );

export const workspaceInitial = (name: string) => [...name.trim()][0]?.toUpperCase();

export default function ProjectSwitcherWorkspaceRail({
  workspaces,
  activeId,
  onPick,
}: {
  workspaces: WorkspaceSummary[];
  activeId: number;
  onPick: (workspaceId: number) => void;
}) {
  const t = useTranslations('nav');

  return (
    <div
      role="group"
      aria-label={t('projectPicker.workspaces')}
      className="flex w-14 shrink-0 flex-col items-center gap-2 overflow-y-auto border-e bg-sidebar/60 py-3"
    >
      {workspaces.map((workspace) => {
        const active = workspace.id === activeId;
        return (
          <Tooltip key={workspace.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={workspace.name}
                aria-pressed={active}
                onClick={() => onPick(workspace.id)}
                className={workspaceTileClass(active)}
              >
                {workspaceInitial(workspace.name)}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{workspace.name}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
