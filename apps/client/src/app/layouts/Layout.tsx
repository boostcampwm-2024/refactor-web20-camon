import { Outlet } from 'react-router-dom';
import Header from '@/shared/components/Header';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { Toaster } from '@/shared/components/ui/toaster';
import FloatingButton from '@/shared/components/FloatingButton';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';

export function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Header />
        <main className="pt-[74px] h-full">
          <Outlet />
        </main>
        <Toaster />
        <FloatingButton />
      </ThemeProvider>
    </AuthProvider>
  );
}
