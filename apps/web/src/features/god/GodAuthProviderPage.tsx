'use client';

import GodAuthProviderForm from './components/auth-provider/GodAuthProviderForm';
import GodSettingsGate from './components/GodSettingsGate';
import { useInstanceGoogleSettingsQuery } from './services/god.service';

// Google sign-in. Single sign-on through OIDC belongs to the workspace and is set in
// its settings.
export default function GodAuthProviderPage() {
  const google = useInstanceGoogleSettingsQuery();

  return (
    <GodSettingsGate slug="auth-provider" data={google.data}>
      {(settings) => <GodAuthProviderForm googleSettings={settings} />}
    </GodSettingsGate>
  );
}
