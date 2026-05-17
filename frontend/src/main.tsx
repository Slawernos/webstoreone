import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import App from './App';
import './styles/globals.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY hiányzik a .env fájlból');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
