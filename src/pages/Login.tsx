import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">
            URTECH<span className="text-secondary"> DESPACHANTES</span>
          </h1>
          <p className="mt-2 text-medium-text">Acesse sua conta para continuar</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="sign_in" // Força a visualização de login
          showLinks={false} // Remove links como 'Esqueceu sua senha?' e 'Não tem uma conta? Registre-se'
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu e-mail',
                password_label: 'Sua senha',
                email_input_placeholder: 'seu@email.com',
                password_input_placeholder: 'Sua senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'Seu e-mail',
                password_label: 'Crie uma senha',
                email_input_placeholder: 'seu@email.com',
                password_input_placeholder: 'Sua senha',
                button_label: 'Registrar',
                loading_button_label: 'Registrando...',
                social_provider_text: 'Registrar com {{provider}}',
                link_text: 'Não tem uma conta? Registre-se',
              },
              forgotten_password: {
                email_label: 'Seu e-mail',
                email_input_placeholder: 'seu@email.com',
                button_label: 'Enviar instruções',
                loading_button_label: 'Enviando...',
                link_text: 'Esqueceu sua senha?',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;