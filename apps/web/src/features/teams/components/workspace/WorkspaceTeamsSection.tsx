'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/utils/dates';
import { teamPath } from '@/utils/paths';
import { usePaging } from '@/hooks/usePaging';
import { useSearchTerm } from '@/hooks/useSearchTerm';
import { useTeamsQuery } from '@/services/teams.service';
import { useWorkspaceTeamsQuery } from '@/services/workspaces.service';
import ListPager from '@/components/common/ListPager';
import SearchInput from '@/components/common/SearchInput';
import SectionPageView from '@/components/common/page/SectionPageView';
import ListSkeleton from '@/components/common/skeleton/ListSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Every team of the workspace, a page at a time. A team the reader is in links to its
// settings; the rest are listed by name only.
export default function WorkspaceTeamsSection({ workspaceId }: { workspaceId: number }) {
  const t = useTranslations('teams.workspace.teams');
  const { search, setSearch, term } = useSearchTerm();
  const paging = usePaging();
  const teamsQuery = useWorkspaceTeamsQuery(workspaceId, { search: term, ...paging.params });
  const teams = teamsQuery.data?.items ?? [];
  const total = teamsQuery.data?.total ?? 0;
  const mine = new Set((useTeamsQuery().data ?? []).map((team) => team.id));

  return (
    <SectionPageView title={t('title')} description={t('description')} wide>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <SearchInput
          value={search}
          onChange={(next) => {
            setSearch(next);
            paging.reset();
          }}
          placeholder={t('search')}
          className="w-60 self-end"
        />

        {teamsQuery.isPending ? (
          <ListSkeleton rows={4} rowClassName="h-12" />
        ) : teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[560px] table-fixed">
              <colgroup>
                <col className="w-[46%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    {t('name')}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    {t('members')}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    {t('projects')}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    {t('created')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id} className="hover:bg-transparent">
                    <TableCell className="truncate px-3 py-3 text-sm font-medium">
                      {mine.has(team.id) ? (
                        <Link href={teamPath(team.ref)} className="hover:underline">
                          {team.name}
                        </Link>
                      ) : (
                        team.name
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm tabular-nums">
                      {team.memberCount}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm tabular-nums">
                      {team.projectCount}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-muted-foreground">
                      {formatDate(team.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {total > 0 && <ListPager paging={paging} total={total} />}
      </div>
    </SectionPageView>
  );
}
