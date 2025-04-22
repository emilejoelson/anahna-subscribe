// Components
import ConfigHeader from '@/lib/ui/screen-components/protected/super-admin/configuration/view/header';
import ConfigMain from '@/lib/ui/screen-components/protected/super-admin/configuration/view/main';

// Hooks
import { useTranslations } from 'next-intl';

export default function ConfigurationsScreen() {
  // Hooks
  const t = useTranslations();
  return (
    <div className="screen-container">
      <ConfigHeader />
      <ConfigMain />
    </div>
  );
}