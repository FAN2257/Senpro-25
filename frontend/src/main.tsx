import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { App } from './App';
import { registerServiceWorker } from './lib/registerServiceWorker';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2800,
            style: {
              borderRadius: '14px',
              border: '1px solid rgba(15,23,42,0.1)',
              boxShadow: '0 14px 35px rgba(15, 23, 42, 0.15)',
              color: '#0f172a'
            }
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
