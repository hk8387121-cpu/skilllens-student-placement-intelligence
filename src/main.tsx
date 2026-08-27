import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Restore a deep link after GitHub Pages serves the SPA fallback.
const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  const url = new URL(redirect);
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
