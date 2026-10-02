import { t } from 'elysia';
import { pageQueryFields, pageResponse } from '#shared/pagination';

export const workspaceParams = t.Object({ workspaceId: t.Numeric() });

export const workspaceManagerParams = t.Object({ workspaceId: t.Numeric(), userId: t.String() });

export const updateWorkspaceBody = t.Object({ name: t.String({ minLength: 1, maxLength: 60 }) });

export const addManagerBody = t.Object({ userId: t.String() });

export const searchQuery = t.Object({
  search: t.Optional(t.String({ description: 'Matches the name or the address.' })),
});

export const workspaceTeamListQuery = t.Object({
  search: t.Optional(t.String({ description: 'Matches the name or the slug.' })),
  ...pageQueryFields,
});

const workspaceRole = t.Union([t.Literal('owner'), t.Literal('admin')]);

export const WorkspaceListResponse = t.Array(
  t.Object({
    id: t.Number(),
    name: t.String(),
    role: t.Nullable(workspaceRole, {
      description: 'Your standing in the workspace; null when you are only in a team of it.',
    }),
  }),
);

export const WorkspaceResponse = t.Object({
  id: t.Number(),
  name: t.String(),
  role: workspaceRole,
  teamCount: t.Number(),
  managerCount: t.Number(),
});

const person = {
  userId: t.String(),
  name: t.String(),
  email: t.String(),
  image: t.Nullable(t.String()),
};

export const WorkspaceManagerListResponse = t.Array(t.Object({ ...person, role: workspaceRole }));

export const WorkspaceCandidateListResponse = t.Array(t.Object(person));

export const WorkspaceTeamPageResponse = pageResponse(
  t.Object({
    id: t.Number(),
    name: t.String(),
    ref: t.String({ description: 'How web URLs name the team: its slug, or its id without one.' }),
    memberCount: t.Number({ description: 'People in the team; agents are not counted.' }),
    projectCount: t.Number(),
    createdAt: t.String(),
  }),
);
