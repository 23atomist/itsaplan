import { request } from '@/lib/api/core/client';

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

// The workspace's OIDC provider. The client secret is never returned, only a
// `hasClientSecret` flag. redirectUri is derived from the API origin and has to be
// registered with the identity provider.
export interface WorkspaceSsoSettings {
  enabled: boolean;
  label: string;
  discoveryUrl: string;
  clientId: string;
  hasClientSecret: boolean;
  scopes: string[];
  pkce: boolean;
  redirectUri: string;
}

export interface WorkspaceSsoSettingsPatch {
  enabled?: boolean;
  label?: string;
  discoveryUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  pkce?: boolean;
}

// SCIM provisioning. The token is never returned, only its prefix; a new one is
// generated with createWorkspaceScimToken and shown once.
export interface WorkspaceScimSettings {
  enabled: boolean;
  hasToken: boolean;
  tokenPrefix: string;
  baseUrl: string;
}

// What a provisioned group grants: membership in a project, at a role. The group and
// its members come from the identity provider; the mappings are set here.
export interface WorkspaceScimGroupMapping {
  projectId: number;
  projectKey: string;
  projectName: string;
  role: 'owner' | 'member';
  roleId: number | null;
}

export interface WorkspaceScimGroup {
  id: string;
  displayName: string;
  externalId: string | null;
  memberCount: number;
  mappings: WorkspaceScimGroupMapping[];
}

// A project of the workspace as the group mapping form picks it, with the roles of
// the team that owns it.
export interface WorkspaceProjectOption {
  id: number;
  key: string;
  name: string;
  roles: { id: number; name: string }[];
}

export const getWorkspaceSso = (workspaceId: number) =>
  request<WorkspaceSsoSettings>(`/workspaces/${workspaceId}/sso`);

export const updateWorkspaceSso = (workspaceId: number, patch: WorkspaceSsoSettingsPatch) =>
  request<WorkspaceSsoSettings>(`/workspaces/${workspaceId}/sso`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

export const getWorkspaceScim = (workspaceId: number) =>
  request<WorkspaceScimSettings>(`/workspaces/${workspaceId}/scim`);

export const updateWorkspaceScim = (workspaceId: number, patch: { enabled: boolean }) =>
  request<WorkspaceScimSettings>(`/workspaces/${workspaceId}/scim`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

// Returns the new token in the clear. It is shown once and cannot be read back.
export const createWorkspaceScimToken = (workspaceId: number) =>
  request<{ token: string }>(`/workspaces/${workspaceId}/scim/token`, { method: 'POST' });

export const listWorkspaceScimGroups = (workspaceId: number) =>
  request<WorkspaceScimGroup[]>(`/workspaces/${workspaceId}/scim/groups`);

export const setWorkspaceScimGroupMappings = (
  workspaceId: number,
  groupId: string,
  mappings: { projectId: number; role: 'owner' | 'member'; roleId: number | null }[],
) =>
  request<WorkspaceScimGroup>(`/workspaces/${workspaceId}/scim/groups/${groupId}/mappings`, {
    method: 'PUT',
    body: JSON.stringify({ mappings }),
  });

export const listWorkspaceProjectOptions = (workspaceId: number) =>
  request<WorkspaceProjectOption[]>(`/workspaces/${workspaceId}/projects/options`);
