import ReactDOM from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { DemonstratorPage, DisplayEventsPage, SampleSelectorPage } from './pages';

const ROUTER_FACTORY = createMemoryRouter;
const ROUTES = [
  {
    path: '/',
    element: <SampleSelectorPage />,
  },
  {
    path: '/demonstrator',
    element: <DemonstratorPage />,
  },
  {
    path: '/display-events',
    element: <DisplayEventsPage />,
  }
];

function render() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<RouterProvider router={ROUTER_FACTORY(ROUTES)} />);
}

render();
