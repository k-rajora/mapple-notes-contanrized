import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../services/api';
import { KeyRound, User, Loader2, Leaf, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling visibility
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginUser(username, password);
      } else {
        data = await signupUser(username, password);
      }
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Background: Warm Autumn Gradient (Cream -> Peach -> Soft Red)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-100 p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements (Autumn Glows) */}
      {/* Top-left: Warm Golden/Orange Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-300/40 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      {/* Bottom-right: Deep Maple Red Glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-400/30 rounded-full blur-3xl opacity-50"></div>

      {/* 2. Glassmorphic Card */}
      <div className="relative bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden z-10 ring-1 ring-white/50">
        
        {/* Card Header */}
        <div className="p-8 pb-6 text-center">
          {/* Maple Icon Container */}
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30 transform -rotate-6 transition-transform hover:rotate-0">
            <Leaf className="text-white w-9 h-9" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight font-serif">Maple Notes</h1>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-amber-900/80 uppercase tracking-wider mb-1.5 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-amber-700/50 group-focus-within:text-orange-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-white/80 rounded-xl text-gray-900 placeholder-amber-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/90 transition-all shadow-sm backdrop-blur-sm"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password Input with Toggle */}
            <div>
              <label className="block text-xs font-bold text-amber-900/80 uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <div className="relative group">
                {/* Left Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-amber-700/50 group-focus-within:text-orange-600 transition-colors" />
                </div>
                
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white/60 border border-white/80 rounded-xl text-gray-900 placeholder-amber-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/90 transition-all shadow-sm backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                />

                {/* Right Icon (Toggle Button) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-700/50 hover:text-orange-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Submit Button (Maple Gradient) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-600/20 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-amber-900/60">
              {isLogin ? "New to Maple Notes? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-orange-700 hover:text-red-700 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;