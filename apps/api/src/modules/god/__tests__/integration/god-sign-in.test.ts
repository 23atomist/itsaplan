import { describe, expect, it, beforeEach } from 'bun:test';
import { app } from '#tests/helpers/app';
import { resetDb } from '#tests/helpers/db';
import { addUser, setup, type Actor } from '../helpers';

// The password endpoints live behind the better-auth catch-all, which Eden Treaty
// does not model, so they are driven through the app handler directly.
function signInWithPassword(email: string, password: string) {
  return app.handle(
    new Request('http://localhost/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
}

const credentials = {
  discoveryUrl: 'https://idp.example.com/.well-known/openid-configuration',
  clientId: 'itsaplan',
  clientSecret: 'sh-secret',
};

// The sign-in screen offers the OIDC provider of the instance workspace, which the
// first account owns. Wrapped in an object: an Eden route is thenable, so an async
// function cannot return one bare.
async function instanceSso(god: Actor) {
  const [workspace] = (await god.api.workspaces.get()).data!;
  return { sso: god.api.workspaces({ workspaceId: workspace!.id }).sso };
}

const googleCredentials = {
  clientId: 'google-client',
  clientSecret: 'google-secret',
};

describe('god sign-in settings', () => {
  beforeEach(resetDb);

  describe('trusting provider emails', () => {
    it('is off by default and round-trips', async () => {
      const { god } = await setup();

      expect((await god.api.god['auth-settings'].get()).data).toMatchObject({
        trustProviderEmails: false,
      });

      const res = await god.api.god['auth-settings'].put({ trustProviderEmails: true });

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({ trustProviderEmails: true });
      expect((await god.api.god['auth-settings'].get()).data).toMatchObject({
        trustProviderEmails: true,
      });
    });
  });

  describe('turning off password sign-in', () => {
    it('refuses while no single sign-on provider is configured', async () => {
      const { god } = await setup();

      const before = await god.api.god['auth-settings'].get();
      expect(before.data).toMatchObject({ emailPassword: true, hasSsoProvider: false });

      const res = await god.api.god['auth-settings'].put({ emailPassword: false });

      expect(res.status).toBe(400);
      expect(res.error!.value).toMatchObject({
        error: 'Configure a single sign-on provider first',
      });
    });

    it('allows it once OIDC is usable, and reports it publicly', async () => {
      const { god } = await setup();
      await (
        await instanceSso(god)
      ).sso.patch({ ...credentials, label: 'Acme SSO', enabled: true });

      const res = await god.api.god['auth-settings'].put({ emailPassword: false });

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({ emailPassword: false, hasSsoProvider: true });

      const config = await god.api['auth-config'].get();
      expect(config.data).toMatchObject({
        emailPassword: false,
        oidc: true,
        oidcLabel: 'Acme SSO',
      });
    });

    it('accepts a password sign-in while it is on and refuses it once it is off', async () => {
      const { god } = await setup();
      const user = await addUser({ email: 'member@example.com' });
      await (await instanceSso(god)).sso.patch({ ...credentials, enabled: true });
      expect((await signInWithPassword(user.email, 'test-password-123')).status).toBe(200);
      await god.api.god['auth-settings'].put({ emailPassword: false });

      const res = await signInWithPassword(user.email, 'test-password-123');

      expect(res.status).toBe(403);
    });

    it('stops offering OIDC once the provider is disabled again', async () => {
      const { god } = await setup();
      await (await instanceSso(god)).sso.patch({ ...credentials, enabled: true });
      await god.api.god['auth-settings'].put({ emailPassword: false });

      // Password sign-in has to come back first, or the instance would be left
      // with no way in at all.
      await god.api.god['auth-settings'].put({ emailPassword: true });
      await (await instanceSso(god)).sso.patch({ enabled: false });

      const config = await god.api['auth-config'].get();
      expect(config.data).toMatchObject({ oidc: false, oidcLabel: '', emailPassword: true });
    });

    it('refuses to disable the only usable OIDC provider', async () => {
      const { god } = await setup();
      const { sso } = await instanceSso(god);
      await sso.patch({ ...credentials, enabled: true });
      await god.api.god['auth-settings'].put({ emailPassword: false });

      const res = await sso.patch({ enabled: false });

      expect(res.status).toBe(400);
      expect(res.error!.value).toMatchObject({
        error: 'Enable password sign-in or another single sign-on provider first',
      });
      expect((await sso.get()).data).toMatchObject({ enabled: true });
    });

    it('refuses to disable the only usable Google provider', async () => {
      const { god } = await setup();
      await god.api.god['google-settings'].put({ ...googleCredentials, enabled: true });
      await god.api.god['auth-settings'].put({ emailPassword: false });

      const res = await god.api.god['google-settings'].put({ enabled: false });

      expect(res.status).toBe(400);
      expect(res.error!.value).toMatchObject({
        error: 'Enable password sign-in or another single sign-on provider first',
      });
      expect((await god.api.god['google-settings'].get()).data).toMatchObject({ enabled: true });
    });
  });
});
