import { request } from '@/lib/api/core/client';
import { pageQuery, type Page, type PageParams } from '@/lib/api/core/paging';

export type WorkspaceRole = 'owner' | 'admin';

// A workspace the caller sees. `role` is null for somebody who is only in a team of it.
export interface WorkspaceSummary {
  id: number;
  name: string;
  role: WorkspaceRole | null;
}

export interface Workspace {
  id: number;
  name: string;
  role: WorkspaceRole;
  teamCount: number;
  managerCount: number;
}

export interface WorkspacePerson {
  userId: string;
  name: string;
  email: string;
  image: string | null;
}

export interface WorkspaceManager extends WorkspacePerson {
  role: WorkspaceRole;
}

export interface WorkspaceTeam {
  id: number;
  name: string;
  ref: string;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

export interface WorkspaceTeamListParams extends PageParams {
  search?: string;
}

export const listWorkspaces = () => request<WorkspaceSummary[]>('/workspaces');

export const getWorkspace = (workspaceId: number) =>
  request<Workspace>(`/workspaces/${workspaceId}`);

export const updateWorkspace = (workspaceId: number, input: { name: string }) =>
  request<Workspace>(`/workspaces/${workspaceId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const listWorkspaceManagers = (workspaceId: number) =>
  request<WorkspaceManager[]>(`/workspaces/${workspaceId}/managers`);

export const listWorkspaceManagerCandidates = (workspaceId: number, search: string) =>
  request<WorkspacePerson[]>(
    `/workspaces/${workspaceId}/managers/candidates?${new URLSearchParams({ search })}`,
  );

export const addWorkspaceAdmin = (workspaceId: number, userId: string) =>
  request<WorkspaceManager[]>(`/workspaces/${workspaceId}/managers`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });

export const removeWorkspaceAdmin = (workspaceId: number, userId: string) =>
  request<void>(`/workspaces/${workspaceId}/managers/${userId}`, { method: 'DELETE' });

export const listWorkspaceTeams = (workspaceId: number, params: WorkspaceTeamListParams) =>
  request<Page<WorkspaceTeam>>(
    `/workspaces/${workspaceId}/teams${pageQuery(params, { search: params.search })}`,
  );
