import { useApp } from '../state/store.tsx';
import { navigate } from '../lib/router.ts';
import { AuthPanel } from '../components/auth.tsx';
import { ProfilePage } from './Settings.tsx';

export function AccountPage() {
  const { state } = useApp();
  if (!state.account) return <AuthPanel onDone={() => navigate('apply')} />;
  return <ProfilePage />;
}