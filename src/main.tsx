import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { StyleSheetManager } from 'styled-components';
import './index.css';
import { enablePhonetic } from "./services/inputInterceptor.ts";

enablePhonetic();
/**
 * Extract CSP nonce from meta tag injected by nginx
 * This nonce is used by styled-components to comply with CSP
 */
function getCSPNonce(): string | undefined {
  // Look for either `property` or `name` attribute since templates/nginx may use either
  const metaTag = document.querySelector(
    'meta[property="csp-nonce"], meta[name="csp-nonce"]'
  );
  const nonce = metaTag?.getAttribute('content');

  // Validate nonce (ignore common placeholder/template tokens)
  if (
    nonce &&
    nonce !== '__CSP_NONCE__' &&
    !nonce.startsWith('${')
  ) {
    return nonce;
  }
  
  // Fallback: try to find nonce from existing script tags
  const scriptWithNonce = document.querySelector('script[nonce]');
  if (scriptWithNonce) {
    return scriptWithNonce.getAttribute('nonce') || undefined;
  }
  
  return undefined;
}

const nonce = getCSPNonce();

// Log nonce status in development
if (import.meta.env.DEV) {
  console.log('🔐 CSP Nonce:', nonce || 'NOT FOUND (this is OK in development)');
}

// In production, warn if nonce is missing
if (import.meta.env.PROD && !nonce) {
  console.warn('⚠️ CSP nonce not found. styled-components may be blocked by CSP.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyleSheetManager disableCSSOMInjection>
      <App />
    </StyleSheetManager>
  </StrictMode>
);