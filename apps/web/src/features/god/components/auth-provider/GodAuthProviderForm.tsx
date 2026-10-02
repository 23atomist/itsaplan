'use client';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { InstanceGoogleSettings } from '@/lib/api/endpoints/god';
import { Button } from '@/components/ui/button';
import GodSectionPage from '../GodSectionPage';
import GodGoogleSettings from './GodGoogleSettings';
import { useGodGoogleForm } from '../../hooks/useGodGoogleForm';

export default function GodAuthProviderForm({
  googleSettings,
}: {
  googleSettings: InstanceGoogleSettings;
}) {
  const t = useTranslations('god.authProvider');
  const tCommon = useTranslations('common');
  const google = useGodGoogleForm(googleSettings);

  async function save() {
    try {
      await google.save();
      toast.success(t('saved'));
    } catch {
      // The failure already surfaced through the global mutation error toast.
    }
  }

  return (
    <GodSectionPage
      slug="auth-provider"
      actions={
        <Button size="sm" onClick={() => void save()} disabled={!google.dirty || google.saving}>
          {google.saving ? tCommon('saving') : tCommon('save')}
        </Button>
      }
    >
      <GodGoogleSettings form={google} />
    </GodSectionPage>
  );
}
