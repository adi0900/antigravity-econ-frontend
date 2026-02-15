import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

export function Welcome() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim() || !email.trim()) {
      setError('Please fill in both fields');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Register with backend API
      const response = await authApi.register(name.trim(), email.trim().toLowerCase());
      
      if (response.success) {
        // Navigate to dashboard
        navigate('/', { replace: true });
      } else {
        setError(response.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Floating Gradient Orbs */}
      <div className="fixed top-20 right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-200/30 to-transparent blur-[100px] animate-float-1" />
      <div className="fixed bottom-20 left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-purple-200/20 to-transparent blur-[80px] animate-float-2" />
      <div className="fixed top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-emerald-100/20 to-transparent blur-[60px] animate-float-3" />

      {/* Main Content */}
      <div 
        className={`relative z-10 max-w-md w-full transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 mb-6 shadow-xl shadow-gray-900/10">
            <span className="material-symbols-outlined text-white text-3xl">eco</span>
          </div>
          <h1 className="text-3xl font-medium text-gray-900 tracking-tight mb-2">
            Welcome to Antigravity
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Your sustainability copilot for measuring and reducing emissions
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-[20px] rounded-3xl p-8 shadow-xl shadow-gray-900/5 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Alex Johnson"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                autoFocus
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="alex@company.com"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <p className="mt-2 text-xs text-gray-400">
                We'll use this to send your emissions reports and insights
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm animate-shake">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-gray-900/10 hover:shadow-xl hover:shadow-gray-900/20 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-xs text-gray-400">
          By continuing, you agree to receive sustainability reports and insights at this email
        </p>
      </div>

      {/* Background Pattern */}
      <div 
        className="fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
