import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@pages/Home';
import { ProfilePage } from '@pages/Profile';
import { LivePage } from '@pages/Live';
import { BroadcastPage } from '@pages/Broadcast';
import { AuthPage } from '@pages/Auth';
import Record from '@pages/Record';
import { Layout } from '@/app/layouts';
import ProtectedRoute from './ProtectedRoute';

const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
};

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '',
          element: <HomePage />,
        },
        {
          path: 'live/:liveId',
          element: <LivePage />,
        },
        {
          path: 'auth',
          element: <AuthPage />,
        },
        {
          path: '',
          element: <ProtectedRoute />,
          children: [
            {
              path: 'profile',
              element: <ProfilePage />,
            },

            {
              path: 'record/:attendanceId',
              element: <Record />,
            },
          ],
        },
      ],
    },
    {
      path: 'broadcast',
      element: <ProtectedRoute />,
      children: [
        {
          path: '',
          element: <BroadcastPage />,
        },
      ],
    },
  ],
  routerOptions,
);
