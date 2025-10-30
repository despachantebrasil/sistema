import React, { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { LoaderIcon } from '../components/Icons';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      // Redirecionamento handled by App.tsx
    } else {
      setError('Falha na autenticação simulada. Tente novamente.');
    }
    setLoading(false);
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">
            URTECH<span className="text-secondary"> DESPACHANTES</span>
          </h1>
          <p className="mt-2 text-medium-text">Acesse sua conta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className={inputClasses} 
              disabled={loading}
              placeholder={'Use qualquer valor'}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className={inputClasses} 
              disabled={loading}
              placeholder={'Use qualquer valor'}
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button 
            type="submit" 
            className="btn-hover w-full flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderIcon className="w-5 h-5 mr-2" />
                Entrando...
              </>
            ) : (
              'Entrar (Modo Demo)'
            )}
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-500 pt-4 border-t">
            Modo de Demonstração Ativo.
        </p>
      </div>
    </div>
  );
};

export default Login;