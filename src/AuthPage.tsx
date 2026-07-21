import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import { ensureAuthRecords } from './lib/auth-records';
import {
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  Hash,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Shield,
  LogOut,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  COUNTRIES,
  getPasswordStrength,
  mapSupabaseAuthErrorToMessage,
  looksLikeEmail,
  normalizeEmail,
  normalizeUsername,
  passwordPolicyCheck,
  usernameMinLengthOk,
} from './lib/auth-utils';



interface AuthPageProps {
  initialMode?: 'login' | 'register';
  setCurrentPage: (page: string) => void;
  setSession: (session: any) => void;
}

export default function AuthPage({ initialMode = 'login', setCurrentPage, setSession }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  useEffect(() => {
    setAuthMode(initialMode);
    setAuthError(null);
  }, [initialMode]);

  // Login State
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '', rememberMe: false });
  // Register State
  const [registerForm, setRegisterForm] = useState({ username: '', fullName: '', email: '', phone: '', password: '', confirmPassword: '', country: '', referral: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNoticeType, setAuthNoticeType] = useState<'error' | 'success'>('error');

  const authIdentifierAsEmail = useMemo(() => loginForm.identifier.trim(), [loginForm.identifier]);
  const passwordStrength = useMemo(() => getPasswordStrength(registerForm.password), [registerForm.password]);

  const routeAuthenticatedUser = async (
    user: Parameters<typeof ensureAuthRecords>[0],
    fallback?: Parameters<typeof ensureAuthRecords>[1],
  ) => {
    const profile = await ensureAuthRecords(user, fallback);

    if (profile.account_status && profile.account_status !== 'active') {
      await supabase.auth.signOut();
      setAuthError('Your account is inactive. Please contact support.');
      return;
    }

    const verificationStatus = (profile.verification_status ?? '').toLowerCase();

    if (
      verificationStatus &&
      verificationStatus !== 'verified' &&
      profile.role !== 'admin'
    ) {
      setAuthError(
        'Your account verification is pending. Please wait for approval before signing in.'
      );
      return;
    }

    setCurrentPage(profile.role === 'admin' ? 'admin_dashboard' : 'dashboard');
    window.scrollTo(0, 0);
  };


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthNoticeType('error');
    setAuthError(null);

    if (!authIdentifierAsEmail) {
      setAuthError('Please enter your email address.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const identifier = loginForm.identifier.trim();
      if (!looksLikeEmail(identifier)) {
        setAuthError('Please sign in with the email address connected to your account.');
        return;
      }

      const email = normalizeEmail(identifier);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: loginForm.password,
      });

      if (error) {
        setAuthError(mapSupabaseAuthErrorToMessage(error.message));
        return;
      }

      if (data.session) {
        setSession(data.session);
      }

      const user = data.user;
      if (!user) {
        setAuthError('Login succeeded, but we could not load your user account. Please try again.');
        return;
      }

      await routeAuthenticatedUser(user, { email });
    } catch (err) {
      await supabase.auth.signOut();
      setAuthError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };


  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthNoticeType('error');
    setAuthError(null);

    const username = normalizeUsername(registerForm.username);
    const password = registerForm.password;

    if (!usernameMinLengthOk(username)) {
      setAuthError('Username must be at least 4 characters.');
      return;
    }

    const policy = passwordPolicyCheck(password);
    if (!policy.ok) {
      setAuthError(policy.issues[0] ?? 'Invalid password.');
      return;
    }

    if (password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizeEmail(registerForm.email),
        password: password,
        options: {
          data: {
            full_name: registerForm.fullName,
            username,
            phone: registerForm.phone,
            country: registerForm.country,
            referral: registerForm.referral || null,
          },
        },
      });

      if (error) {
        setAuthError(mapSupabaseAuthErrorToMessage(error.message));
        return;
      }

      if (!data.session) {
        setAuthNoticeType('success');
        setAuthError(
          'Account created successfully. Please check your email to confirm your account before signing in.'
        );
        setCurrentPage('login');
        return;
      }

      setSession(data.session);

      if (!data.user) {
        setAuthNoticeType('success');
        setAuthError('Account created, but we could not load your user account. Please sign in.');
        setCurrentPage('login');
        return;
      }

      try {
        await routeAuthenticatedUser(data.user, {
          email: registerForm.email,
          username,
          fullName: registerForm.fullName,
          phone: registerForm.phone,
          country: registerForm.country,
          referral: registerForm.referral || null,
        });
      } catch (err) {
        console.error('Account created, but post-registration verification failed:', err);
        await supabase.auth.signOut();
        setAuthNoticeType('success');
        setAuthError('Account created successfully. Please sign in after your account is approved.');
        setAuthMode('login');
        setCurrentPage('login');
        window.scrollTo(0, 0);
      }
    } catch (err) {
      await supabase.auth.signOut();
      setAuthError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };


  const handleLogout = async () => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message);
        return;
      }
      setCurrentPage('login');
      window.scrollTo(0, 0);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Logout failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex w-full font-sans">
      {/* Left Panel (Marketing Sidebar) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#f1f5f9] flex-col justify-center items-center overflow-hidden">
        {/* Dot background pattern */}
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Logo at the top left */}
        <div className="absolute top-8 left-8 z-20 flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentPage('home'); window.scrollTo(0,0); }}>
          <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#E53E3E] fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,15 C20,15 5,25 5,25 L10,33 C10,33 25,25 50,25 C75,25 90,33 90,33 L95,25 C95,25 80,15 50,15 Z M50,38 C35,38 25,41 25,41 L29,48 C29,48 40,46 50,46 C60,46 71,48 71,48 L75,41 C75,41 65,38 50,38 Z M43,50 L57,50 L53,90 L47,90 Z" />
          </svg>
          <span className="text-[#E53E3E] font-bold text-xl tracking-[0.25em] font-sans">TESLA</span>
        </div>

        {/* Centered Content */}
        <div className="relative z-10 w-full max-w-md px-8 text-center mt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Welcome to Quantum Ai Capital</h1>
          <p className="text-gray-600 mb-12 text-sm leading-relaxed max-w-[320px] mx-auto">
            Our platform offers secure trading, real-time market data, and expert insights to help you achieve your financial goals.
          </p>

          <div className="space-y-8 text-left inline-block w-full pl-4">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Secure Trading</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">State-of-the-art security features to protect your investments</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Real-Time Analytics</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">Up-to-the-minute market data to inform your decisions</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Expert Support</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">24/7 customer support from our team of specialists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (Form Wrapper) */}
      <div className="w-full lg:w-[55%] bg-[#F7FAFC] flex flex-col justify-center items-center p-6 md:p-12 relative min-h-screen lg:min-h-0">
        {/* Mobile Header Logo */}
        <div className="absolute top-8 left-6 lg:hidden flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentPage('home'); window.scrollTo(0,0); }}>
          <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#E53E3E] fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,15 C20,15 5,25 5,25 L10,33 C10,33 25,25 50,25 C75,25 90,33 90,33 L95,25 C95,25 80,15 50,15 Z M50,38 C35,38 25,41 25,41 L29,48 C29,48 40,46 50,46 C60,46 71,48 71,48 L75,41 C75,41 65,38 50,38 Z M43,50 L57,50 L53,90 L47,90 Z" />
          </svg>
          <span className="text-[#E53E3E] font-bold text-xl tracking-[0.25em] font-sans">TESLA</span>
        </div>

        <motion.div 
          key={authMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px] bg-white rounded-[1rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden mt-16 lg:mt-0"
        >
          {authMode === 'login' ? (
            <div className="p-8 md:p-10">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User Login</h2>
                <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="you@example.com or username"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 stroke-[1.5]" /> : <Eye className="w-5 h-5 stroke-[1.5]" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-[#B85845] focus:ring-[#B85845]"
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm({...loginForm, rememberMe: e.target.checked})}
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-[#B85845] hover:text-[#A34B3B] font-medium transition-colors"
                    onClick={async (e) => {
                      e.preventDefault();
                      setAuthError(null);

                      const identifier = loginForm.identifier.trim();
                      if (!identifier) {
                        setAuthError('Please enter your email address.');
                        return;
                      }

                      if (!looksLikeEmail(identifier)) {
                        setAuthError('Please enter a valid email address.');
                        return;
                      }

                      setIsAuthLoading(true);
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(
                          normalizeEmail(identifier)
                        );

                        if (error) {
                          setAuthError(mapSupabaseAuthErrorToMessage(error.message));
                          return;
                        }

                        setAuthError(
                          'Password reset email sent. Please check your inbox.'
                        );
                      } catch (err) {
                        setAuthError(err instanceof Error ? err.message : 'Request failed.');
                      } finally {
                        setIsAuthLoading(false);
                      }
                    }}
                  >
                    Forgot password?
                  </a>

                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3.5 px-4 bg-[#B85845] hover:bg-[#A34B3B] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#B85845]/20 mt-4"
                >
                  <ArrowRight className="w-5 h-5 stroke-[2]" /> {isAuthLoading ? 'Signing in...' : 'Sign In'}
                </button>

                {authError && (
                  <p className={`text-sm ${authNoticeType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{authError}</p>
                )}
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button onClick={() => { setAuthMode('register'); setCurrentPage('register'); }} className="text-[#B85845] font-medium hover:underline focus:outline-none">
                    Sign up now
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an Account</h2>
                <p className="text-gray-500 text-sm">Fill in your details to get started</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter unique username"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Enter your phone number"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create password"
                      className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Password strength: <span className="font-semibold">{passwordStrength}</span>
                  </div>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Confirm password"
                        className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Globe className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <select
                      required
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm appearance-none text-gray-700"
                      value={registerForm.country}
                      onChange={(e) => setRegisterForm({ ...registerForm, country: e.target.value })}
                    >
                      <option value="" disabled>Select your country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Referral ID (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Hash className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter referral code"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 focus:border-[#3182CE] transition-all duration-200 text-sm"
                      value={registerForm.referral}
                      onChange={(e) => setRegisterForm({ ...registerForm, referral: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-3 px-4 bg-[#B85845] hover:bg-[#A34B3B] text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center shadow-md shadow-[#B85845]/20"
                  >
                    {isAuthLoading ? 'Creating account...' : 'Create Account'}
                  </button>

                  {authError && (
                    <p className={`text-sm ${authNoticeType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{authError}</p>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button onClick={() => { setAuthMode('login'); setCurrentPage('login'); }} className="text-[#B85845] font-medium hover:underline focus:outline-none">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-10 mb-6 lg:mb-0 flex items-center gap-2 text-gray-400 text-xs">
          <Shield className="w-3.5 h-3.5" /> Secure login - Your data is protected
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isAuthLoading}
          className="hidden"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
