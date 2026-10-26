import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AssistantPage } from './pages/AssistantPage';
import { HelpPage } from './pages/HelpPage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { QuizPage } from './pages/QuizPage';
import { VisualizerPage } from './pages/VisualizerPage';
import { DevelopedByPage } from './pages/DevelopedByPage';
import { TableStudioPage } from './pages/TableStudioPage';
import { CompetitiveExamPage } from './pages/CompetitiveExamPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'table-studio', element: <TableStudioPage /> },
      { path: 'visualizer', element: <VisualizerPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'assistant', element: <AssistantPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'developed-by', element: <DevelopedByPage /> },
      { path: '*', element: <NotFoundPage /> },
      { path: 'competitive-exam', element: <CompetitiveExamPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
