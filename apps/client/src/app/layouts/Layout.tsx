import { Outlet } from 'react-router-dom';
import Header from '@/shared/ui/Header';
import { Toaster } from '@/shared/ui/shadcn/toaster';
import FloatingButton from '@/shared/ui/FloatingButton';
import { Providers } from '../providers';

export function Layout() {
  return (
    <Providers>
      <Header />
      <main className="pt-[74px] h-full">
        <Outlet />
      </main>
      <Toaster />
      <FloatingButton />
    </Providers>
  );
}
