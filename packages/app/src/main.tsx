import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './ui/tokens.css';
import './ui/base.css';
import { AppRoutes } from './app/routes/AppRoutes';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('root element missing');
}

createRoot(container).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
);
