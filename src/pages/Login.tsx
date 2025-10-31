import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            URTECH<span className="text-secondary"> DESPACHANTES</span>
          </h1>
          <p className="mt-2 text-medium-text">Acesse sua conta</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
                default: {
                    colors: {
                        brand: '#0D47A1', // primary
                        brandAccent: '#0B3B84', // primary-dark
                    },
                },
            },
          }}
          theme="light"
          view="sign_in"
        />
      </div>
    </div>
  );
};

export default Login;