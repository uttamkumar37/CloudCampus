import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { configureCloudCampusApiFetch } from './shared/api/apiBase';
import './shared/styles/global.css';

configureCloudCampusApiFetch();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('CloudCampus root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
