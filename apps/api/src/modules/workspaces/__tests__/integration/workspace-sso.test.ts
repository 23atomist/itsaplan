import { beforeEach, describe, expect, it } from 'bun:test';
import { authedApi } from '#tests/helpers/app';
import { signUpTestUser } from '#tests/helpers/auth';
import { resetDb } from '#tests/helpers/db';

const credentials = {
  discoveryUrl: 'https://idp.example.com/.well-known/openid-configuration',
  clientId: 'itsaplan',
  clientSecret: 'sh-secret',
};

async function setup() {
  const owner = await signUpTestUser();
  const ownerApi = authedApi(owner.cookie);
  const [workspace] = (await ownerApi.workspaces.get()).data!;
  return { ownerApi, workspaceId: workspace!.id };
}

describe('workspace single sign-on', () => {
  beforeEach(resetDb);

  describe('access', () => {
    it('refuses an admin and hides the workspace from a member', async () => {
      const { ownerApi, workspaceId } = await setup();
      const admin = await signUpTestUser();
      await ownerApi.workspaces({ workspaceId }).managers.post({ userId: admin.userId });
      const member = await signUpTestUser();

      const adminSso = authedApi(admin.cookie).workspaces({ workspaceId }).sso;
      expect((await adminSso.get()).status).toBe(403);
      expect((await adminSso.patch({ enabled: false })).status).toBe(403);
      expect((await authedApi(member.cookie).workspaces({ workspaceId }).sso.get()).status).toBe(
        404,
      );
    });
  });

  describe('GET /workspaces/:workspaceId/sso', () => {
    it('reports an unconfigured provider with the redirect URI to register', async () => {
      const { ownerApi, workspaceId } = await setup();

      const res = await ownerApi.workspaces({ workspaceId }).sso.get();

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        enabled: false,
        label: '',
        discoveryUrl: '',
        clientId: '',
        hasClientSecret: false,
        scopes: ['openid', 'profile', 'email'],
        pkce: true,
        redirectUri: 'http://localhost:3000/api/auth/oauth2/callback/oidc',
      });
    });
  });

  describe('PATCH /workspaces/:workspaceId/sso', () => {
    it('stores the credentials and never returns the secret', async () => {
      const { ownerApi, workspaceId } = await setup();

      const saved = await ownerApi
        .workspaces({ workspaceId })
        .sso.patch({ ...credentials, label: 'Acme SSO', enabled: true });

      expect(saved.status).toBe(200);
      expect(saved.data).toMatchObject({
        enabled: true,
        label: 'Acme SSO',
        discoveryUrl: credentials.discoveryUrl,
        clientId: credentials.clientId,
        hasClientSecret: true,
      });
      expect(JSON.stringify(saved.data)).not.toContain(credentials.clientSecret);
    });

    it('keeps the stored secret when the field is sent empty', async () => {
      const { ownerApi, workspaceId } = await setup();
      const sso = ownerApi.workspaces({ workspaceId }).sso;
      await sso.patch({ ...credentials, enabled: true });

      const saved = await sso.patch({ clientSecret: '' });

      expect(saved.data).toMatchObject({ hasClientSecret: true, enabled: true });
    });

    it('refuses to enable a provider with no credentials', async () => {
      const { ownerApi, workspaceId } = await setup();

      const res = await ownerApi.workspaces({ workspaceId }).sso.patch({ enabled: true });

      expect(res.status).toBe(400);
      expect(res.error!.value).toMatchObject({
        error: 'Add the discovery URL, client ID and secret first',
      });
    });

    it('refuses to enable a provider that is missing only the secret', async () => {
      const { ownerApi, workspaceId } = await setup();

      const res = await ownerApi.workspaces({ workspaceId }).sso.patch({
        discoveryUrl: credentials.discoveryUrl,
        clientId: credentials.clientId,
        enabled: true,
      });

      expect(res.status).toBe(400);
    });
  });
});
