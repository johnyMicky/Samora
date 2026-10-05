import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, User, Phone, Globe, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { LanguageSwitcher } from '../App';

export const RegisterPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { register, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.country.trim() || !formData.password) {
      setError(t.auth.emailPlaceholder ? 'Please fill in all required fields.' : 'Bitte alle erforderlichen Felder ausfüllen.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (!formData.agreeTerms) {
      setError(t.auth.termsRequired);
      return;
    }

    try {
      setLoading(true);
      await register(formData.email.trim(), formData.password, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        country: formData.country.trim(),
        language: (language === 'de' ? 'de' : 'en')
      });

      setSuccess(true);
      setTimeout(() => {
        // Newly registered users ALWAYS have role = 'client' and access /dashboard
        navigate('/dashboard', { replace: true });
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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

      {/* Main Register Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#F5C400] to-transparent opacity-80" />

            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,196,0,0.1)] border border-[rgba(245,196,0,0.25)] text-[#F5C400] text-[11px] font-bold uppercase tracking-wider mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>{t.auth.securityBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {t.auth.registerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#A9A9AD] mt-2 leading-relaxed">
                {t.auth.registerSubtitle}
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
                <div>{t.auth.registerSuccess}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t.auth.firstNameLabel} <span className="text-[#F5C400]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t.auth.firstNamePlaceholder}
                      disabled={loading || success}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t.auth.lastNameLabel} <span className="text-[#F5C400]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t.auth.lastNamePlaceholder}
                      disabled={loading || success}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.emailLabel} <span className="text-[#F5C400]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.auth.emailPlaceholder}
                    disabled={loading || success}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Phone & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t.auth.phoneLabel} <span className="text-[#F5C400]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+49 30 12345678"
                      disabled={loading || success}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t.auth.countryLabel} <span className="text-[#F5C400]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      placeholder={t.auth.countryPlaceholder}
                      disabled={loading || success}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t.auth.passwordLabel} <span className="text-[#F5C400]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t.auth.passwordPlaceholder}
                      disabled={loading || success}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737378] hover:text-white transition-colors cursor-pointer"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t.auth.confirmPasswordLabel} <span className="text-[#F5C400]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737378]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t.auth.confirmPasswordPlaceholder}
                      disabled={loading || success}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-[#737378] focus:outline-hidden focus:border-[#F5C400] transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737378] hover:text-white transition-colors cursor-pointer"
                      aria-label="Toggle confirm password"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    required
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded-sm border-[#29292C] bg-[#1C1C1E] text-[#F5C400] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#F5C400]"
                  />
                  <span className="text-xs text-[#A9A9AD] leading-relaxed">
                    {t.auth.agreeTerms}{' '}
                    <Link to="/terms" target="_blank" className="text-[#F5C400] hover:underline">
                      {t.auth.termsLink}
                    </Link>{' '}
                    &amp;{' '}
                    <Link to="/privacy" target="_blank" className="text-[#F5C400] hover:underline">
                      {t.auth.privacyLink}
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#F5C400]/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B0B0C] border-t-transparent rounded-full animate-spin" />
                    <span>{t.auth.registering}</span>
                  </>
                ) : (
                  <span>{t.auth.registerButton}</span>
                )}
              </button>
            </form>

            {/* Bottom Login Switch */}
            <div className="mt-8 pt-6 border-t border-[#29292C] text-center">
              <p className="text-xs sm:text-sm text-[#A9A9AD]">
                {t.auth.haveAccount}{' '}
                <Link
                  to="/login"
                  className="text-[#F5C400] hover:text-[#FFD000] font-bold transition-colors ml-1"
                >
                  {t.nav.login}
                </Link>
              </p>
            </div>
          </div>

          {/* Security Banner */}
          <div className="mt-6 text-center text-xs text-[#737378] flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#F5C400]" />
            <span>{t.auth.securityBanner}</span>
          </div>

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
