import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import PasswordInput from '../components/ui/PasswordInput';
import { LoaderIcon } from '../components/Icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Tradução simples de erros comuns
      if (error.message.includes('Invalid login credentials')) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else {
        setError(`Erro ao fazer login: ${error.message}`);
      }
      setLoading(false);
    }
    // Se for bem-sucedido, o App.tsx detectará a mudança de estado e redirecionará.
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">
            ONEKER<span className="text-secondary"> DESPACHANTES</span>
          </h1>
          <p className="mt-2 text-medium-text">Acesse sua conta para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Seu e-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className={inputClasses}
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Sua senha</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full btn-scale bg-green-500 hover:bg-green-600 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderIcon className="w-5 h-5 mr-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;