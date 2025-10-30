import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { supabase } from './integrations/supabase/client';
import { SessionProvider } from './components/SessionProvider';

// Limpa qualquer sessão persistente do Supabase para garantir que o modo de demonstração seja limpo.
// Isso é importante para remover tokens JWT antigos do cache do navegador.
supabase.auth.signOut();
localStorage.clear();
sessionStorage.clear();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
);