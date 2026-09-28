import { beforeEach, describe, expect, it } from 'bun:test';
import { db, team, workspaceManager } from '@repo/db';
import { signUpTestUser } from '#tests/helpers/auth';
import { resetDb } from '#tests/helpers/db';

describe('instance workspace', () => {
  beforeEach(resetDb);

  it('makes the first account its owner and nobody else a manager', async () => {
    const first = await signUpTestUser({ team: false });
    await signUpTestUser({ team: false });

    const managers = await db.select().from(workspaceManager);
    expect(managers).toHaveLength(1);
    expect(managers[0]).toMatchObject({ userId: first.userId, role: 'owner' });
  });

  it('puts every new team in it', async () => {
    await signUpTestUser();
    await signUpTestUser();
    const [managed] = await db.select().from(workspaceManager);

    const teams = await db.select({ workspaceId: team.workspaceId }).from(team);
    expect(teams).toEqual([
      { workspaceId: managed!.workspaceId },
      { workspaceId: managed!.workspaceId },
    ]);
  });
});
