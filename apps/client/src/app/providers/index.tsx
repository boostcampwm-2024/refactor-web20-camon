import { ThemeProvider } from '@/app/providers/theme/ThemeProvider';
import { AuthProvider } from '@/app/providers/auth/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}
