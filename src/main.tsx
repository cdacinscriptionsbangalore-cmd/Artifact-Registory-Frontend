import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { StyleSheetManager } from 'styled-components';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyleSheetManager disableCSSOMInjection>
      <App />
    </StyleSheetManager>
  </StrictMode>
);
