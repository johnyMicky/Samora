import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { LanguageSwitcher } from '../App';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { login, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t.auth.emailPlaceholder ? 'Please fill in all required fields.' : 'Bitte alle Felder ausfüllen.');
      return;
    }

    // Basic email pattern check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(trimmedEmail, password);
      setSuccess(true);
      setTimeout(() => {
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate(from && from !== '/dashboard' ? from : '/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-between text-white selection:bg-[#F5C400] selection:text-[#0B0B0C]">
      {/* Top Header */}
      <header className="px-6 py-5 border-b border-[#29292C] bg-[#0E0E10]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-linear-to-br from-[#F5C400] to-[#B89100] rounded-xl flex items-center justify-center shadow-lg shadow-[#F5C400]/20 group-hover:scale-105 transition-transform">
              <Shield className="text-[#0B0B0C] w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">Bafin Solution</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to="/"
              className="text-xs font-semibold text-[#A9A9AD] hover:text-[#F5C400] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card Box */}
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#F5C400] to-transparent opacity-80" />

            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,196,0,0.1)] border border-[rgba(245,196,0,0.25)] text-[#F5C400] text-[11px] font-bold uppercase tracking-wider mb-4">
                <Lock className="w-3.5 h-3.5" />
                <span>{t.auth.securityBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {t.auth.loginTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#A9A9AD] mt-2 leading-relaxed">
                {t.auth.loginSubtitle}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>{t.auth.loginSuccess}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    disabled={loading || success}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t.auth.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(true)}
                    className="text-xs text-[#F5C400] hover:text-[#FFD000] font-medium transition-colors cursor-pointer"
                  >
                    {t.auth.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    disabled={loading || success}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737378] hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-[#A9A9AD]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-[#29292C] bg-[#1C1C1E] text-[#F5C400] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#F5C400]"
                  />
                  <span>{t.auth.rememberMe}</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#F5C400]/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B0B0C] border-t-transparent rounded-full animate-spin" />
                    <span>{t.auth.loggingIn}</span>
                  </>
                ) : (
                  <span>{t.auth.loginButton}</span>
                )}
              </button>
            </form>

            {/* Forgot Password Alert Modal / Notice */}
            {showForgotNotice && (
              <div className="mt-5 p-4 bg-[#1C1C1E] border border-[#F5C400]/30 rounded-xl text-xs text-[#A9A9AD] leading-relaxed relative">
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(false)}
                  className="absolute top-2 right-2.5 text-[#737378] hover:text-white text-base font-bold"
                >
                  &times;
                </button>
                <div className="text-[#F5C400] font-bold mb-1">Passwort-Sicherheit / Security</div>
                <p>{t.auth.forgotPasswordAlert}</p>
                <div className="mt-2 text-white font-mono font-bold">
                  Tel: +49 30 12345678
                </div>
              </div>
            )}

            {/* Bottom Register Switch */}
            <div className="mt-8 pt-6 border-t border-[#29292C] text-center">
              <p className="text-xs sm:text-sm text-[#A9A9AD]">
                {t.auth.noAccount}{' '}
                <Link
                  to="/register"
                  className="text-[#F5C400] hover:text-[#FFD000] font-bold transition-colors ml-1"
                >
                  {t.nav.register}
                </Link>
              </p>
            </div>
          </div>

          {/* Security Notice below card */}
          <div className="mt-6 text-center text-xs text-[#737378] flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#F5C400]" />
            <span>{t.auth.securityBanner}</span>
          </div>

          {/* Environmental fallback hint */}
          {!isFirebaseConfigured && (
            <div className="mt-3 text-center text-[11px] text-[#555558]">
              {t.auth.demoNote}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#29292C] text-center text-xs text-[#737378]">
        © {new Date().getFullYear()} Bafin Solution. All rights reserved. • Hotline: +49 30 12345678
      </footer>
    </div>
  );
};
