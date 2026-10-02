import { Elysia, t } from 'elysia';
import { requireUser } from '#shared/access';
import { authContext } from '#shared/auth-context';
import { guards } from '#shared/guards';
import { noContent } from '#shared/http';
import { paginate } from '#shared/pagination';
import { errors } from '#shared/responses';
import {
  WorkspaceCandidateListResponse,
  WorkspaceListResponse,
  WorkspaceManagerListResponse,
  WorkspaceResponse,
  WorkspaceTeamPageResponse,
  addManagerBody,
  searchQuery,
  updateWorkspaceBody,
  workspaceManagerParams,
  workspaceParams,
  workspaceTeamListQuery,
} from './model';
import {
  addAdmin,
  getWorkspace,
  listManagerCandidates,
  listManagers,
  listWorkspaceTeams,
  listWorkspaces,
  removeAdmin,
  renameWorkspace,
} from './service';

// A workspace owns teams. Only its owner and admins manage it; everyone else sees it
// through the teams they are in.
export const workspaceRoutes = new Elysia({ name: 'workspaces', detail: { tags: ['Workspaces'] } })
  .use(authContext)
  .use(guards)

  .get('/workspaces', ({ user }) => listWorkspaces(requireUser(user).id), {
    response: { 200: WorkspaceListResponse, ...errors(401) },
    detail: {
      summary: 'List workspaces',
      description: 'The workspaces you manage or hold a team in, with your standing in each.',
    },
  })

  .get(
    '/workspaces/:workspaceId',
    ({ standing }) => getWorkspace(standing.workspaceId, standing.role),
    {
      workspaceManager: true,
      params: workspaceParams,
      response: { 200: WorkspaceResponse, ...errors(401, 404) },
      detail: { summary: 'Get a workspace', description: 'A workspace you manage.' },
    },
  )

  .patch(
    '/workspaces/:workspaceId',
    async ({ standing, body }) => {
      await renameWorkspace(standing.workspaceId, body.name);
      return getWorkspace(standing.workspaceId, standing.role);
    },
    {
      workspaceManager: true,
      params: workspaceParams,
      body: updateWorkspaceBody,
      response: { 200: WorkspaceResponse, ...errors(400, 401, 404) },
      detail: { summary: 'Rename a workspace', description: 'Rename a workspace you manage.' },
    },
  )

  .get('/workspaces/:workspaceId/managers', ({ standing }) => listManagers(standing.workspaceId), {
    workspaceManager: true,
    params: workspaceParams,
    response: { 200: WorkspaceManagerListResponse, ...errors(401, 404) },
    detail: { summary: 'List workspace managers', description: 'The owner, then the admins.' },
  })

  .get(
    '/workspaces/:workspaceId/managers/candidates',
    ({ standing, query }) => listManagerCandidates(standing.workspaceId, query.search),
    {
      workspaceManager: true,
      params: workspaceParams,
      query: searchQuery,
      response: { 200: WorkspaceCandidateListResponse, ...errors(401, 404) },
      detail: {
        summary: 'List workspace admin candidates',
        description:
          'Up to 20 people in a team of the workspace who do not manage it yet, by name.',
      },
    },
  )

  .post(
    '/workspaces/:workspaceId/managers',
    async ({ standing, body, set }) => {
      await addAdmin(standing.workspaceId, body.userId);
      set.status = 201;
      return listManagers(standing.workspaceId);
    },
    {
      workspaceOwner: true,
      params: workspaceParams,
      body: addManagerBody,
      response: { 201: WorkspaceManagerListResponse, ...errors(400, 401, 403, 404, 409) },
      detail: {
        summary: 'Add a workspace admin',
        description: 'Make a person in a team of the workspace its admin. Owner only.',
      },
    },
  )

  .delete(
    '/workspaces/:workspaceId/managers/:userId',
    async ({ standing, params }) => {
      await removeAdmin(standing.workspaceId, params.userId);
      return noContent();
    },
    {
      workspaceOwner: true,
      params: workspaceManagerParams,
      response: { 204: t.Void(), ...errors(401, 403, 404, 409) },
      detail: {
        summary: 'Remove a workspace admin',
        description: 'Take the admin standing from a person. The owner cannot be removed.',
      },
    },
  )

  .get(
    '/workspaces/:workspaceId/teams',
    ({ standing, query }) =>
      paginate(query, (window) =>
        listWorkspaceTeams(standing.workspaceId, { search: query.search, ...window }),
      ),
    {
      workspaceManager: true,
      params: workspaceParams,
      query: workspaceTeamListQuery,
      response: { 200: WorkspaceTeamPageResponse, ...errors(401, 404) },
      detail: {
        summary: 'List workspace teams',
        description: 'One page of the teams the workspace owns, by name.',
      },
    },
  );
