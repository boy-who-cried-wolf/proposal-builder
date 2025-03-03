
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, requestPasswordReset } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        await requestPasswordReset(email);
        // Reset form to login after password reset request
        setIsForgotPassword(false);
        setIsLogin(true);
      } else if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, firstName, lastName);
        // After signup, switch to login view
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-black">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {isForgotPassword 
            ? 'Reset Password' 
            : isLogin 
              ? 'Sign In' 
              : 'Create Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && !isForgotPassword && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold mb-2">
                  First Name
                </label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border border-black rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold mb-2">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border border-black rounded"
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-black rounded"
              required
            />
          </div>
          
          {!isForgotPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-black rounded"
                required
                minLength={6}
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded font-semibold"
          >
            {loading 
              ? 'Loading...' 
              : isForgotPassword 
                ? 'Send Reset Instructions' 
                : isLogin 
                  ? 'Sign In' 
                  : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-2">
          {isLogin && !isForgotPassword && (
            <button 
              onClick={() => setIsForgotPassword(true)} 
              className="text-sm font-semibold hover:underline"
            >
              Forgot password?
            </button>
          )}
          
          {isForgotPassword && (
            <button 
              onClick={() => setIsForgotPassword(false)} 
              className="text-sm font-semibold hover:underline"
            >
              Back to Sign In
            </button>
          )}
          
          {!isForgotPassword && (
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-sm font-semibold hover:underline block w-full"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
