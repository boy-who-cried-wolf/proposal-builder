
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Switch to login mode after successful registration
        setMode('login');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
      />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-black text-[26px] font-bold text-center mb-8">
            {mode === 'login' ? 'Login' : 'Create Account'} 
          </h1>
          
          <div className="bg-[#F7F6F2] p-6 rounded shadow">
            <div className="flex mb-6">
              <button
                className={`flex-1 p-2 text-center ${
                  mode === 'login' ? 'text-black border-b-black border-b-2' : 'text-[rgba(0,0,0,0.5)]'
                }`}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                className={`flex-1 p-2 text-center ${
                  mode === 'register' ? 'text-black border-b-black border-b-2' : 'text-[rgba(0,0,0,0.5)]'
                }`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-black text-[10px] font-semibold tracking-[1.544px] uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1.389px] uppercase bg-white p-[11px] border-solid border-[#E1E1DC]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-black text-[10px] font-semibold tracking-[1.544px] uppercase mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1.389px] uppercase bg-white p-[11px] border-solid border-[#E1E1DC]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-[11px] rounded text-white text-[9px] font-semibold tracking-[1.389px] uppercase bg-black p-[11px] hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="text-center mt-4">
            <Link to="/" className="text-black text-[10px] font-semibold tracking-[1.544px] uppercase underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
