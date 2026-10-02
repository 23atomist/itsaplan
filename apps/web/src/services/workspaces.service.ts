import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type WorkspaceTeamListParams,
  addWorkspaceAdmin,
  getWorkspace,
  listWorkspaceManagerCandidates,
  listWorkspaceManagers,
  listWorkspaceTeams,
  listWorkspaces,
  removeWorkspaceAdmin,
  updateWorkspace,
} from '@/lib/api/endpoints/workspaces';
import { qk } from '@/services/queryKeys';

export function useWorkspacesQuery() {
  return useQuery({ queryKey: qk.workspaces, queryFn: () => listWorkspaces() });
}

export function useWorkspaceQuery(workspaceId: number) {
  return useQuery({
    queryKey: qk.workspace(workspaceId),
    queryFn: () => getWorkspace(workspaceId),
  });
}

export function useUpdateWorkspace(workspaceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => updateWorkspace(workspaceId, { name }),
    onSuccess: (workspace) => {
      qc.setQueryData(qk.workspace(workspaceId), workspace);
      void qc.invalidateQueries({ queryKey: qk.workspaces });
    },
  });
}

export function useWorkspaceManagersQuery(workspaceId: number) {
  return useQuery({
    queryKey: qk.workspaceManagers(workspaceId),
    queryFn: () => listWorkspaceManagers(workspaceId),
  });
}

export function useWorkspaceManagerCandidatesQuery(workspaceId: number, search: string) {
  return useQuery({
    queryKey: qk.workspaceManagerCandidates(workspaceId, search),
    queryFn: () => listWorkspaceManagerCandidates(workspaceId, search),
    placeholderData: keepPreviousData,
  });
}

// The manager list, the candidates and the counter on the workspace all change with it.
function useManagerMutation<T>(workspaceId: number, write: (userId: string) => Promise<T>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: write,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.workspace(workspaceId) }),
  });
}

export function useAddWorkspaceAdmin(workspaceId: number) {
  return useManagerMutation(workspaceId, (userId) => addWorkspaceAdmin(workspaceId, userId));
}

export function useRemoveWorkspaceAdmin(workspaceId: number) {
  return useManagerMutation(workspaceId, (userId) => removeWorkspaceAdmin(workspaceId, userId));
}

export function useWorkspaceTeamsQuery(workspaceId: number, params: WorkspaceTeamListParams) {
  return useQuery({
    queryKey: qk.workspaceTeams(workspaceId, params),
    queryFn: () => listWorkspaceTeams(workspaceId, params),
    placeholderData: keepPreviousData,
  });
}
