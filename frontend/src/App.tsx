import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell';
import { AssistantPage } from './pages/AssistantPage';
import { HelpPage } from './pages/HelpPage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { VisualizerPage } from './pages/VisualizerPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'visualizer', element: <VisualizerPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'assistant', element: <AssistantPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
