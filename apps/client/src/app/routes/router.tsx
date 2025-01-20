import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@pages/Home';
import { LivePage } from '@pages/Live';
import { BroadcastPage } from '@pages/Broadcast';
import { AuthPage } from '@pages/Auth';
import { RecordPage } from '@pages/Record';
import { ProfilePage } from '@/pages/Profile';
import { Layout } from '@/app/layouts';
import ProtectedRoute from './ProtectedRoute';
import { routerOptions } from './config';

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
              element: <RecordPage />,
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
