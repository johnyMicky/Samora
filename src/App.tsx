import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  ChevronRight, 
  Globe, 
  Zap, 
  Scale,
  FileSearch,
  History,
  MessageSquare,
  Mail,
  Facebook,
  Instagram,
  Phone,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Users,
  BookOpen,
  Database,
  FileText,
  HelpCircle,
  ShieldAlert,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { LanguageProvider, useLanguage } from './translations';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoDataProvider } from './context/DemoDataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LiveChatWidget } from './components/LiveChatWidget';

// --- Scroll to Top Component ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Language Switcher Component ---
export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex items-center bg-[#1C1C1E] border border-[#29292C] rounded-full p-0.5 text-xs font-semibold shrink-0", className)}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer",
          language === 'en'
            ? "bg-[#F5C400] text-[#0B0B0C] shadow-sm font-bold"
            : "text-[#A9A9AD] hover:text-white"
        )}
        aria-label="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('de')}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer",
          language === 'de'
            ? "bg-[#F5C400] text-[#0B0B0C] shadow-sm font-bold"
            : "text-[#A9A9AD] hover:text-white"
        )}
        aria-label="Deutsch"
      >
        <span>🇩🇪</span>
        <span>DE</span>
      </button>
    </div>
  );
};

// --- Components ---

const Navbar = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.services, href: isHome ? '#services' : '/#services' },
    { name: t.nav.howItWorks, href: isHome ? '#how-it-works' : '/#how-it-works' },
    { name: t.nav.whyUs, href: isHome ? '#why-us' : '/#why-us' },
    { name: t.nav.faq, href: '/faq' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-4",
      isScrolled || !isHome ? "bg-[#0B0B0C]/90 backdrop-blur-md border-b border-[#29292C] py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-linear-to-br from-[#F5C400] to-[#B89100] rounded-xl flex items-center justify-center shadow-lg shadow-[#F5C400]/20 group-hover:scale-105 transition-transform">
            <Shield className="text-[#0B0B0C] w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">Bafin Solution</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            link.href.startsWith('#') || (link.href.startsWith('/#')) ? (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-slate-300 hover:text-[#F5C400] transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-sm font-medium text-slate-300 hover:text-[#F5C400] transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
          <LanguageSwitcher />

          {/* Header Buttons: LOGIN / REGISTER (or DASHBOARD / LOGOUT) */}
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 border border-[#F5C400] active:scale-95 flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{user.role === 'admin' ? t.nav.admin : t.nav.dashboard}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="bg-[#1C1C1E] hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-[#29292C] hover:border-red-500/30 px-3 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{t.nav.logout}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="bg-[#1C1C1E] hover:bg-[#252528] text-white hover:text-[#F5C400] border border-[#29292C] hover:border-[#F5C400]/50 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 border border-[#F5C400] active:scale-95 cursor-pointer"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle. Language selector remains inside the opened menu
            so the hamburger always stays visible on narrow phones. */}
        <div className="flex items-center md:hidden shrink-0">
          <button 
            type="button"
            className="text-white p-2 -mr-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute left-0 right-0 top-full bg-[#111112]/98 backdrop-blur-md border-b border-[#29292C] overflow-y-auto shadow-2xl max-h-[calc(100vh-72px)]"
          >
            <div className="flex flex-col gap-4 px-5 py-5 sm:p-6">
              {navLinks.map((link) => (
                link.href.startsWith('#') || (link.href.startsWith('/#')) ? (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-slate-300 hover:text-[#F5C400]"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-slate-300 hover:text-[#F5C400]"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <div className="pt-2 flex justify-start">
                <LanguageSwitcher />
              </div>

              {/* Mobile Auth Buttons */}
              {user ? (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-3 rounded-xl text-center font-bold border border-[#F5C400] flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{user.role === 'admin' ? t.nav.admin : t.nav.dashboard}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-[#1C1C1E] text-red-400 hover:bg-red-500/10 border border-[#29292C] px-5 py-3 rounded-xl text-center font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.nav.logout}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#1C1C1E] hover:bg-[#252528] text-white border border-[#29292C] px-4 py-3 rounded-xl text-center font-bold transition-all text-sm"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-4 py-3 rounded-xl text-center font-bold border border-[#F5C400] transition-all text-sm shadow-md shadow-[#F5C400]/20"
                  >
                    {t.nav.register}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


const BlockchainChains = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-30" style={{ perspective: '1000px' }}>
        <motion.div 
          initial={{ rotateX: 20, rotateY: -10 }}
          animate={{ rotateX: 25, rotateY: -15 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="w-full h-full"
        >
          <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#F5C400" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#F5C400" />
              </marker>
            </defs>

            {/* Grid Lines with Flow */}
            {Array.from({ length: 10 }).map((_, i) => {
              const y = 100 + i * 100;
              return (
                <g key={`h-${i}`}>
                  <line x1="0" y1={y} x2="1000" y2={y} stroke="rgba(245, 196, 0, 0.12)" strokeWidth="1" />
                  <motion.path
                    d={`M 0 ${y} L 1000 ${y}`}
                    stroke="url(#flowGradient)"
                    strokeWidth="2"
                    strokeDasharray="20, 100"
                    animate={{ strokeDashoffset: [-120, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
                  />
                </g>
              );
            })}

            {Array.from({ length: 10 }).map((_, i) => {
              const x = 100 + i * 100;
              return (
                <g key={`v-${i}`}>
                  <line x1={x} y1="0" x2={x} y2="1000" stroke="rgba(245, 196, 0, 0.12)" strokeWidth="1" />
                  <motion.path
                    d={`M ${x} 0 L ${x} 1000`}
                    stroke="url(#flowGradient)"
                    strokeWidth="2"
                    strokeDasharray="20, 100"
                    animate={{ strokeDashoffset: [-120, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                  />
                </g>
              );
            })}

            {/* Nodes (Cubes) */}
            {Array.from({ length: 6 }).map((_, i) => (
              Array.from({ length: 6 }).map((_, j) => {
                const x = 200 + i * 150;
                const y = 200 + j * 150;
                return (
                  <motion.g key={`${i}-${j}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i + j) * 0.1 }}>
                    {/* Simple Cube representation */}
                    <rect x={x - 10} y={y - 10} width="20" height="20" fill="rgba(22, 22, 23, 0.8)" stroke="#F5C400" strokeWidth="1" />
                    <rect x={x - 6} y={y - 6} width="12" height="12" fill="#F5C400" opacity="0.3" />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#F5C400"
                      animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: (i + j) * 0.2 }}
                    />
                  </motion.g>
                );
              })
            ))}
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

const Hero = () => {
  const { t } = useLanguage();
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const analysisData = [
    { network: 'Ethereum Mainnet', address: '0x71C...3f92', hash: '0x82a...e12b', status: t.hero.statusTracingActive },
    { network: 'Bitcoin Network', address: 'bc1q...x9p4', hash: '6f8d...a2c1', status: t.hero.statusNodeSyncing },
    { network: 'Solana Mainnet', address: '7v9E...m2K8', hash: '4h5j...k9L2', status: t.hero.statusAnalyzingPath },
    { network: 'Polygon POS', address: '0x3A2...fE91', hash: '0x1b2...c3d4', status: t.hero.statusMappingAssets },
    { network: 'Avalanche C-Chain', address: '0x9E1...c4A3', hash: '0x7d8...e9f0', status: t.hero.statusVerifyingNode }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisIndex((prev) => (prev + 1) % analysisData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [analysisData.length]);

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
      <BlockchainChains />
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#F5C400]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#B89100]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] text-[#F5C400] text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldAlert className="w-3.5 h-3.5" />
            {t.hero.badge}
          </div>
          <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
            {t.hero.titlePart1} <br />
            <span className="gradient-text">{t.hero.titlePart2}</span>
          </h1>
          <p className="text-lg text-[#A9A9AD] mb-8 max-w-xl leading-relaxed">
            {t.hero.description}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link to="/contact">
              <button className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-[#F5C400]/20 flex items-center gap-2 group border border-[#F5C400]">
                {t.hero.primaryCta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#services">
              <button className="bg-[#161617] hover:bg-[#1C1C1E] text-[#F5F5F5] border border-[rgba(245,196,0,0.30)] hover:border-[#F5C400] px-8 py-4 rounded-full font-bold text-lg transition-all">
                {t.hero.secondaryCta}
              </button>
            </a>
          </div>
          
          <div className="mt-4 p-3 bg-[#161617] border border-[#29292C] rounded-xl inline-flex items-center gap-2.5 max-w-xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-[#A9A9AD] font-medium">
              {t.hero.alertNotice}
            </p>
          </div>
          
          <div className="mt-10 flex flex-wrap items-center gap-6 pt-6 border-t border-[#29292C]">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#F5C400]" />
              <span className="text-sm font-semibold text-white">{t.hero.independentReview}</span>
            </div>
            <div className="w-px h-5 bg-[#29292C] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#F5C400]" />
              <span className="text-sm font-semibold text-white">{t.hero.confidentialHandling}</span>
            </div>
            <div className="w-px h-5 bg-[#29292C] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-[#F5C400]" />
              <span className="text-sm font-semibold text-white">{t.hero.noGuarantees}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="glass-card p-8 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="text-lg font-bold text-white">{t.hero.analysisNodeTitle}</div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { label: t.hero.networkTracing, value: analysisData[analysisIndex].network, icon: Globe },
                { label: t.hero.referenceAddress, value: analysisData[analysisIndex].address, icon: Search },
                { label: t.hero.txHash, value: analysisData[analysisIndex].hash, icon: History },
                { label: t.hero.technicalStatus, value: analysisData[analysisIndex].status, icon: FileSearch, color: 'text-[#F5C400]' },
              ].map((item, i) => (
                <div key={i} className="bg-[#1C1C1E] rounded-xl p-4 flex items-center justify-between border border-[#29292C]">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-[#A9A9AD]" />
                    <span className="text-sm text-[#A9A9AD]">{item.label}</span>
                  </div>
                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                    <motion.span
                      key={item.value}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={cn("text-sm font-mono font-medium", item.color || "text-white")}
                    >
                      {item.value}
                    </motion.span>
                  </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-[#F5C400]" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">{t.hero.protocolTitle}</span>
              </div>
              <div className="text-xs text-[#A9A9AD] leading-relaxed">
                {t.hero.protocolDesc}
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#F5C400]/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#B89100]/10 rounded-full blur-2xl" />

          {/* Floating Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute -bottom-12 -right-6 lg:-right-12 z-20 w-80 glass-card p-6 shadow-2xl border-[rgba(245,196,0,0.30)]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{t.hero.txTracedTitle}</div>
                <div className="text-xs text-[#A9A9AD]">{t.hero.txTracedSub}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-[#1C1C1E] rounded-full overflow-hidden border border-[#29292C]">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                  className="h-full bg-[#F5C400] shadow-[0_0_10px_rgba(245,196,0,0.5)]"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#737378] uppercase tracking-widest">{t.hero.evidenceOrganized}</span>
                <span className="text-xs font-bold text-[#F5C400]">{t.hero.documentedBadge}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const WhoWeHelp = () => {
  const { t } = useLanguage();
  const cards = [
    {
      title: t.whoWeHelp.card1Title,
      text: t.whoWeHelp.card1Desc,
      icon: Scale,
    },
    {
      title: t.whoWeHelp.card2Title,
      text: t.whoWeHelp.card2Desc,
      icon: Globe,
    },
    {
      title: t.whoWeHelp.card3Title,
      text: t.whoWeHelp.card3Desc,
      icon: Users,
    },
    {
      title: t.whoWeHelp.card4Title,
      text: t.whoWeHelp.card4Desc,
      icon: ShieldAlert,
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#111112]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] text-[#F5C400] text-xs font-bold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" />
            {t.whoWeHelp.scopeBadge}
          </div>
          <h2 className="text-4xl md:text-5xl mb-4">{t.whoWeHelp.title}</h2>
          <p className="text-[#A9A9AD] max-w-2xl mx-auto text-base">
            {t.whoWeHelp.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card p-8 hover:border-[rgba(245,196,0,0.30)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] flex items-center justify-center mb-6 shadow-md shadow-[#F5C400]/5">
                  <card.icon className="text-[#F5C400] w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-[#A9A9AD] text-sm leading-relaxed">{card.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const { t } = useLanguage();
  const services = [
    {
      title: t.services.s1Title,
      description: t.services.s1Desc,
      icon: FileSearch,
    },
    {
      title: t.services.s2Title,
      description: t.services.s2Desc,
      icon: Search,
    },
    {
      title: t.services.s3Title,
      description: t.services.s3Desc,
      icon: FileText,
    },
    {
      title: t.services.s4Title,
      description: t.services.s4Desc,
      icon: Scale,
    },
    {
      title: t.services.s5Title,
      description: t.services.s5Desc,
      icon: Lock,
    },
    {
      title: t.services.s6Title,
      description: t.services.s6Desc,
      icon: ShieldAlert,
    }
  ];

  return (
    <section id="services" className="py-24 px-6 bg-[#0B0B0C]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] text-[#F5C400] text-xs font-bold uppercase tracking-wider mb-4">
            <FileText className="w-3.5 h-3.5" />
            {t.services.badge}
          </div>
          <h2 className="text-4xl md:text-5xl mb-4">{t.services.title}</h2>
          <p className="text-[#A9A9AD] max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card p-8 hover:border-[rgba(245,196,0,0.40)] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] flex items-center justify-center mb-6 shadow-lg shadow-[#F5C400]/5">
                  <service.icon className="text-[#F5C400] w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#F5C400] transition-colors">{service.title}</h3>
                <p className="text-[#A9A9AD] text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const GermanySupport = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6 bg-[#111112] border-t border-[#29292C]">
      <div className="max-w-5xl mx-auto">
        <div className="glass-card p-8 md:p-12 relative overflow-hidden border-[rgba(245,196,0,0.30)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#F5C400]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t.germanySupport.title}</h2>
          </div>
          
          <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
            <p>
              {t.germanySupport.p1}
            </p>
            <p>
              {t.germanySupport.p2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const { t } = useLanguage();
  const steps = [
    {
      num: "01",
      title: t.process.step1Title,
      desc: t.process.step1Desc,
      icon: MessageSquare
    },
    {
      num: "02",
      title: t.process.step2Title,
      desc: t.process.step2Desc,
      icon: FileSearch
    },
    {
      num: "03",
      title: t.process.step3Title,
      desc: t.process.step3Desc,
      icon: Search
    },
    {
      num: "04",
      title: t.process.step4Title,
      desc: t.process.step4Desc,
      icon: CheckCircle2
    },
    {
      num: "05",
      title: t.process.step5Title,
      desc: t.process.step5Desc,
      icon: Shield
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#0B0B0C]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] text-[#F5C400] text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3" />
              {t.process.badge}
            </div>
            <h2 className="text-4xl md:text-5xl mb-6">{t.process.title}</h2>
            <p className="text-[#A9A9AD] mb-10 leading-relaxed">
              {t.process.subtitle}
            </p>
            
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5 glass-card p-4 border-[#29292C] hover:border-[rgba(245,196,0,0.30)] transition-all">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center text-[#F5C400] font-bold font-mono text-sm">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{step.title}</h4>
                    <p className="text-[#A9A9AD] text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-card p-1 overflow-hidden border-[#29292C]">
              <img 
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000" 
                alt="Technical analysis visualization" 
                className="w-full h-auto rounded-2xl opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0B0B0C] via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass-card p-6 bg-[#161617]/90 backdrop-blur-xl border-[#29292C]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] flex items-center justify-center">
                      <FileText className="text-[#F5C400] w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-white font-bold">{t.process.activeAssessment}</div>
                      <div className="text-xs text-[#A9A9AD]">{t.process.structuredEvidence}</div>
                    </div>
                  </div>
                  <div className="w-full bg-[#1C1C1E] h-2 rounded-full overflow-hidden border border-[#29292C]">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[#F5C400]"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-[#737378] uppercase font-bold tracking-widest">{t.process.verification}</span>
                    <span className="text-[10px] text-[#F5C400] font-bold">{t.process.verifiedBadge}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LegalSupport = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6 bg-[#111112] border-t border-[#29292C]">
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 border-[rgba(245,196,0,0.30)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] flex items-center justify-center">
            <Scale className="w-5 h-5 text-[#F5C400]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t.legalSupport.title}</h2>
        </div>
        <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
          <p>
            {t.legalSupport.p1}
          </p>
          <p>
            {t.legalSupport.p2}
          </p>
        </div>
      </div>
    </section>
  );
};

const AntiScamSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-6 bg-[#0B0B0C] border-t border-[#29292C]">
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{t.antiScam.tag}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t.antiScam.title}</h2>
          </div>
        </div>

        <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
          <p>
            {t.antiScam.p1}
          </p>
          <p className="font-semibold text-amber-300">
            {t.antiScam.guaranteeWarning}
          </p>
          
          <div className="pt-2">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">{t.antiScam.neverDiscloseTitle}</div>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-300">
              {t.antiScam.sensitiveItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="pt-2 text-slate-300">
            {t.antiScam.advanceFeeWarning}
          </p>
          <p className="text-[#F5C400] font-semibold">
            {t.antiScam.deviceControlWarning}
          </p>
        </div>
      </div>
    </section>
  );
};

const WhyTrust = () => {
  const { t } = useLanguage();
  const cards = [
    {
      title: t.whyTrust.card1Title,
      desc: t.whyTrust.card1Desc,
      icon: Shield
    },
    {
      title: t.whyTrust.card2Title,
      desc: t.whyTrust.card2Desc,
      icon: Search
    },
    {
      title: t.whyTrust.card3Title,
      desc: t.whyTrust.card3Desc,
      icon: Lock
    },
    {
      title: t.whyTrust.card4Title,
      desc: t.whyTrust.card4Desc,
      icon: CheckCircle2
    }
  ];

  return (
    <section id="why-us" className="py-24 px-6 bg-[#111112] border-t border-[#29292C]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-4xl mb-6">{t.whyTrust.title}</h2>
            <p className="text-[#A9A9AD] mb-8 leading-relaxed">
              {t.whyTrust.subtitle}
            </p>
            <a href="#services" className="text-[#F5C400] hover:text-[#FFD000] font-bold flex items-center gap-2 hover:gap-3 transition-all">
              {t.whyTrust.exploreServices} <ChevronRight className="w-5 h-5" />
            </a>
          </div>
          
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {cards.map((item, i) => (
              <div key={i} className="glass-card p-8 hover:border-[rgba(245,196,0,0.30)] transition-all">
                <item.icon className="text-[#F5C400] w-8 h-8 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-[#A9A9AD] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ImportantNotice = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 px-6 bg-[#0B0B0C] border-t border-[#29292C]">
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-10 border-[#29292C]">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-[#F5C400] w-6 h-6 shrink-0" />
          <h3 className="text-xl font-bold text-white">{t.importantNotice.title}</h3>
        </div>
        <div className="space-y-3 text-[#A9A9AD] text-sm leading-relaxed">
          <p>
            {t.importantNotice.p1}
          </p>
          <p>
            {t.importantNotice.p2}
          </p>
          <p className="text-slate-300 font-medium">
            {t.importantNotice.p3}
          </p>
        </div>
      </div>
    </section>
  );
};

const ContactForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    incidentType: '',
    lossAmount: '',
    incidentDate: '',
    paymentMethod: '',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const currentIncidentType = formData.incidentType || t.form.incidentOptions.trading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const subject = `Case Assessment Request: ${currentIncidentType}`;
    const body = `Full Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0APhone: ${formData.phone}%0D%0ACountry: ${formData.country}%0D%0AIncident Type: ${currentIncidentType}%0D%0AApproximate Loss: ${formData.lossAmount}%0D%0AApproximate Date: ${formData.incidentDate}%0D%0APayment Method: ${formData.paymentMethod}%0D%0A%0D%0ACase Details:%0D%0A${formData.details}`;
    window.location.href = `mailto:support@bafinsolution.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  return (
    <section className="py-24 px-6 bg-[#111112]">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-8 md:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5C400]/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] text-[#F5C400] text-xs font-bold uppercase tracking-wider mb-4">
                <FileText className="w-3.5 h-3.5" />
                {t.form.badge}
              </div>
              <h2 className="text-4xl mb-6">{t.form.title}</h2>
              <p className="text-[#A9A9AD] mb-8 leading-relaxed">
                {t.form.description}
              </p>
              
              <div className="space-y-6">
                <a href="mailto:support@bafinsolution.com" className="flex items-center gap-4 group w-fit">
                  <div className="w-12 h-12 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center group-hover:border-[rgba(245,196,0,0.30)] group-hover:bg-[rgba(245,196,0,0.08)] transition-colors">
                    <Mail className="text-[#F5C400] w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-[#737378]">{t.form.emailLabel}</div>
                    <div className="text-[#F5F5F5] font-medium group-hover:text-[#F5C400] transition-colors">support@bafinsolution.com</div>
                  </div>
                </a>
                <a href="tel:+493012345678" className="flex items-center gap-4 group w-fit">
                  <div className="w-12 h-12 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center group-hover:border-[rgba(245,196,0,0.30)] group-hover:bg-[rgba(245,196,0,0.08)] transition-colors">
                    <Phone className="text-[#F5C400] w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-[#737378]">{t.form.techSupportLabel}</div>
                    <div className="text-[#F5F5F5] font-medium group-hover:text-[#F5C400] transition-colors">+49 30 12345678</div>
                    <div className="text-[10px] text-[#737378] mt-0.5">{t.form.techSupportHours}</div>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center">
                    <MapPin className="text-[#F5C400] w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-[#737378]">{t.form.hqLabel}</div>
                    <div className="text-[#F5F5F5] font-medium">Walther-von-Cronberg-Platz 16, 60594 Frankfurt am Main, Deutschland</div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-[rgba(245,196,0,0.05)] border border-[rgba(245,196,0,0.30)] rounded-2xl flex gap-4">
                <AlertTriangle className="text-[#F5C400] w-6 h-6 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="text-[#F5C400] font-bold">{t.form.noticeBoxTitle}</span> {t.form.noticeBoxText}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitted && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  {t.form.successMessage}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A9A9AD]">{t.form.fullName}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={t.form.fullNamePlaceholder}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A9A9AD]">{t.form.emailAddress}</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder={t.form.emailPlaceholder}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A9A9AD]">{t.form.phoneNumber}</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder={t.form.phonePlaceholder}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A9A9AD]">{t.form.country}</label>
                  <input 
                    type="text" 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    placeholder={t.form.countryPlaceholder}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A9A9AD]">{t.form.incidentType}</label>
                <select 
                  value={currentIncidentType}
                  onChange={(e) => setFormData({...formData, incidentType: e.target.value})}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors appearance-none"
                >
                  <option className="bg-[#1C1C1E] text-[#F5F5F5]">{t.form.incidentOptions.trading}</option>
                  <option className="bg-[#1C1C1E] text-[#F5F5F5]">{t.form.incidentOptions.crypto}</option>
                  <option className="bg-[#1C1C1E] text-[#F5F5F5]">{t.form.incidentOptions.impersonation}</option>
                  <option className="bg-[#1C1C1E] text-[#F5F5F5]">{t.form.incidentOptions.unauthorized}</option>
                  <option className="bg-[#1C1C1E] text-[#F5F5F5]">{t.form.incidentOptions.recoveryService}</option>
                  <option className="bg-[#1C1C1E] text-[#F5F5F5]">{t.form.incidentOptions.other}</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A9A9AD]">{t.form.lossAmount}</label>
                  <input 
                    type="text" 
                    value={formData.lossAmount}
                    onChange={(e) => setFormData({...formData, lossAmount: e.target.value})}
                    placeholder={t.form.lossAmountPlaceholder}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A9A9AD]">{t.form.incidentDate}</label>
                  <input 
                    type="text" 
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                    placeholder={t.form.incidentDatePlaceholder}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A9A9AD]">{t.form.paymentMethod}</label>
                <input 
                  type="text" 
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  placeholder={t.form.paymentMethodPlaceholder}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A9A9AD]">{t.form.details}</label>
                <textarea 
                  rows={4}
                  required
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder={t.form.detailsPlaceholder}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] text-[#F5F5F5] placeholder-[#737378] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400]/30 transition-colors resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] border border-[#F5C400] font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#F5C400]/20 active:scale-[0.98]"
              >
                {t.form.submitButton}
              </button>
              
              <div className="text-center pt-2">
                <p className="text-xs text-[#A9A9AD] font-medium">
                  {t.form.disclaimer}
                </p>
                <p className="text-xs text-[#737378] mt-2">
                  {t.form.termsAgreement}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-12 px-6 border-t border-[#29292C] bg-[#0B0B0C]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
              <div className="w-8 h-8 bg-linear-to-br from-[#F5C400] to-[#B89100] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="text-[#0B0B0C] w-5 h-5" />
              </div>
              <span className="text-lg font-display font-bold text-white">Bafin Solution</span>
            </Link>
            <p className="text-[#A9A9AD] max-w-sm mb-2">
              {t.footer.aboutText}
            </p>
            <p className="text-xs text-[#F5C400] font-semibold mb-6">
              {t.footer.noGuaranteeNote}
            </p>
            <div className="flex items-start gap-3 text-[#A9A9AD] mb-4">
              <MapPin className="w-5 h-5 text-[#F5C400] shrink-0" />
              <span className="text-sm">Walther-von-Cronberg-Platz 16, 60594 Frankfurt am Main, Deutschland</span>
            </div>
            <a href="tel:+493012345678" className="flex items-start gap-3 text-[#A9A9AD] mb-6 hover:text-white transition-colors group">
              <Phone className="w-5 h-5 text-[#F5C400] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#737378] group-hover:text-[#F5C400] transition-colors">{t.form.techSupportLabel}</span>
                <span className="text-sm">+49 30 12345678</span>
                <span className="text-[10px] text-[#737378] mt-0.5">{t.form.techSupportHours}</span>
              </div>
            </a>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/samora.trace" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#161617] border border-[#29292C] flex items-center justify-center text-[#737378] hover:text-[#F5C400] hover:border-[rgba(245,196,0,0.30)] hover:bg-[rgba(245,196,0,0.08)] transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#161617] border border-[#29292C] flex items-center justify-center text-[#737378] hover:text-[#F5C400] hover:border-[rgba(245,196,0,0.30)] hover:bg-[rgba(245,196,0,0.08)] transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="mailto:support@bafinsolution.com" className="w-10 h-10 rounded-lg bg-[#161617] border border-[#29292C] flex items-center justify-center text-[#737378] hover:text-[#F5C400] hover:border-[rgba(245,196,0,0.30)] hover:bg-[rgba(245,196,0,0.08)] transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-6">{t.footer.companyHeading}</h5>
            <ul className="space-y-4 text-sm text-[#A9A9AD]">
              <li><Link to="/about" className="hover:text-[#F5C400] transition-colors">{t.footer.aboutUs}</Link></li>
              <li><Link to="/team" className="hover:text-[#F5C400] transition-colors">{t.footer.ourTeam}</Link></li>
              <li><Link to="/case-studies" className="hover:text-[#F5C400] transition-colors">{t.footer.caseStudies}</Link></li>
              <li><Link to="/contact" className="hover:text-[#F5C400] transition-colors">{t.footer.contact}</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-6">{t.footer.resourcesHeading}</h5>
            <ul className="space-y-4 text-sm text-[#A9A9AD]">
              <li><Link to="/blog" className="hover:text-[#F5C400] transition-colors">{t.footer.securityBlog}</Link></li>
              <li><Link to="/database" className="hover:text-[#F5C400] transition-colors">{t.footer.networkDatabase}</Link></li>
              <li><Link to="/guides" className="hover:text-[#F5C400] transition-colors">{t.footer.auditingGuides}</Link></li>
              <li><Link to="/faq" className="hover:text-[#F5C400] transition-colors">{t.footer.faq}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#29292C] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-[#737378] flex flex-col gap-2">
            <div>{t.footer.copyright}</div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#161617] rounded border border-[#29292C]">
                <span className="text-[10px] text-[#A9A9AD] font-bold uppercase tracking-wider">{t.footer.badge1}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#161617] rounded border border-[#29292C]">
                <span className="text-[10px] text-[#A9A9AD] font-bold uppercase tracking-wider">{t.footer.badge2}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#161617] rounded border border-[#29292C]">
                <span className="text-[10px] text-[#A9A9AD] font-bold uppercase tracking-wider">{t.footer.badge3}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-[#737378]">
            <Link to="/privacy" className="hover:text-[#F5C400] transition-colors">{t.footer.privacy}</Link>
            <Link to="/terms" className="hover:text-[#F5C400] transition-colors">{t.footer.terms}</Link>
            <Link to="/aml-kyc" className="hover:text-[#F5C400] transition-colors">{t.footer.amlKyc}</Link>
            <Link to="/cookies" className="hover:text-[#F5C400] transition-colors">{t.footer.cookies}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Page Components ---

const Layout = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#0B0B0C] selection:bg-[#F5C400]/30 selection:text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>

      {/* First-party Firebase live chat */}
      <LiveChatWidget />

      <Footer />
    </div>
  );
};

const HomePage = () => {
  const { t } = useLanguage();
  return (
    <>
      <Hero />
      
      {/* Trust Principles Bar */}
      <div className="bg-[#111112] border-y border-[#29292C] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-75 hover:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <Shield className="w-5 h-5 text-[#F5C400]" /> {t.trustPrinciples.confidential}
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <FileText className="w-5 h-5 text-[#F5C400]" /> {t.trustPrinciples.documentation}
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <Lock className="w-5 h-5 text-[#F5C400]" /> {t.trustPrinciples.security}
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <CheckCircle2 className="w-5 h-5 text-[#F5C400]" /> {t.trustPrinciples.individual}
          </div>
        </div>
      </div>

      <WhoWeHelp />
      <Services />
      <GermanySupport />
      
      {/* Supported Platforms Section */}
      <section className="py-20 px-6 bg-[#0B0B0C] border-t border-[#29292C]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.platforms.title}</h2>
            <p className="text-[#A9A9AD] text-sm max-w-2xl mx-auto mb-2">
              {t.platforms.subtitle}
            </p>
            <p className="text-[#737378] text-[10px] uppercase tracking-widest font-bold max-w-2xl mx-auto">
              {t.platforms.disclaimer}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: "Axcel Wallet", url: "https://axcelci.com" },
              { name: "Coinbase", url: "https://www.coinbase.com" },
              { name: "Kraken", url: "https://www.kraken.com" },
              { name: "Crypto.com", url: "https://crypto.com" },
              { name: "Atomic Wallet", url: "https://atomicwallet.io" },
              { name: "Revolut", url: "https://www.revolut.com" },
              { name: "Paybis", url: "https://paybis.com" },
              { name: "Exodus", url: "https://www.exodus.com" },
              { name: "Ledger", url: "https://www.ledger.com" },
              { name: "Trezor", url: "https://trezor.io" }
            ].map((platform, i) => (
              <a 
                key={i}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 flex items-center justify-center text-center hover:border-[rgba(245,196,0,0.40)] hover:bg-[rgba(245,196,0,0.05)] transition-all group"
              >
                <span className="text-sm font-bold text-[#A9A9AD] group-hover:text-white transition-colors">
                  {platform.name}
                </span>
              </a>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-[10px] text-[#737378] uppercase tracking-widest font-bold">
              {t.platforms.footnote}
            </p>
          </div>
        </div>
      </section>

      {/* Remote Collaboration Section */}
      <section className="py-20 px-6 bg-[#111112] border-y border-[#29292C]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.remoteConsultation.title}</h2>
            <p className="text-[#A9A9AD] text-sm max-w-2xl mx-auto">
              {t.remoteConsultation.subtitle}
            </p>
            <div className="mt-6 space-y-3">
              <p className="text-[#737378] text-[11px] max-w-xl mx-auto leading-relaxed">
                {t.remoteConsultation.notice}
              </p>
              <p className="text-[#F5C400] text-[10px] uppercase tracking-[0.2em] font-bold max-w-xl mx-auto">
                {t.remoteConsultation.warningLine}
              </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest font-bold text-[#737378]">
              {t.remoteConsultation.toolsTitle}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            {/* AnyDesk */}
            <a href="https://anydesk.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-[#161617] rounded-2xl flex items-center justify-center border border-[#29292C] group-hover:border-red-500/50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-red-500" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#737378] group-hover:text-white transition-colors tracking-widest uppercase">AnyDesk</span>
            </a>

            {/* Google Meet */}
            <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-[#161617] rounded-2xl flex items-center justify-center border border-[#29292C] group-hover:border-[rgba(245,196,0,0.50)] transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z" fill="#00897B"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-[#737378] group-hover:text-white transition-colors tracking-widest uppercase">Google Meet</span>
            </a>

            {/* Zoom */}
            <a href="https://zoom.us" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-[#161617] rounded-2xl flex items-center justify-center border border-[#29292C] group-hover:border-[rgba(245,196,0,0.50)] transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#F5C400]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44a1.005 1.005 0 01-1.14 0l-7.9-4.44A1.01 1.01 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.18-.1.37-.15.57-.15.2 0 .39.05.57.15l7.9 4.44c.32.17.53.5.53.88v9z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#737378] group-hover:text-white transition-colors tracking-widest uppercase">Zoom</span>
            </a>

            {/* Screenleap */}
            <a href="https://www.screenleap.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-[#161617] rounded-2xl flex items-center justify-center border border-[#29292C] group-hover:border-orange-500/50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-orange-500" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#737378] group-hover:text-white transition-colors tracking-widest uppercase">Screenleap</span>
            </a>
          </div>
        </div>
      </section>

      <Process />
      <LegalSupport />
      <AntiScamSection />
      <WhyTrust />
      <ImportantNotice />
      <ContactForm />
    </>
  );
};

const ContentPage = ({ title, subtitle, content, icon: Icon }: { title: string, subtitle: string, content: React.ReactNode, icon: any }) => {
  return (
    <div className="pt-32 pb-24 px-6 bg-[#0B0B0C]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(245,196,0,0.08)] border border-[rgba(245,196,0,0.30)] flex items-center justify-center">
              <Icon className="text-[#F5C400] w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-5xl">{title}</h1>
          </div>
          <p className="text-xl text-[#A9A9AD] mb-12 leading-relaxed">{subtitle}</p>
          <div className="glass-card p-8 md:p-12 text-[#F5F5F5] leading-relaxed space-y-6 border-[#29292C]">
            {content}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.about.title} 
      subtitle={t.pages.about.subtitle}
      icon={Shield}
      content={
        <div className="space-y-6">
          <p>{t.pages.about.p1}</p>
          <p>{t.pages.about.p2}</p>
          <p>{t.pages.about.p3}</p>
          <div className="p-4 bg-[rgba(245,196,0,0.05)] border border-[rgba(245,196,0,0.30)] rounded-xl text-slate-300 text-sm">
            {t.pages.about.notice}
          </div>
        </div>
      }
    />
  );
};

const TeamPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.team.title} 
      subtitle={t.pages.team.subtitle}
      icon={Users}
      content={
        <div className="grid md:grid-cols-2 gap-8">
          {t.pages.team.members.map((member, i) => (
            <div key={i} className="bg-[#1C1C1E] rounded-xl p-6 border border-[#29292C]">
              <div className="text-white font-bold text-lg mb-1">{member.name}</div>
              <div className="text-[#F5C400] text-sm mb-3 font-medium">{member.role}</div>
              <p className="text-[#A9A9AD] text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      }
    />
  );
};

const CaseStudiesPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.caseStudies.title} 
      subtitle={t.pages.caseStudies.subtitle}
      icon={History}
      content={
        <div className="space-y-8">
          {t.pages.caseStudies.studies.map((study, i) => (
            <div key={i} className="bg-[#1C1C1E] rounded-xl p-6 border border-[#29292C] group hover:border-[rgba(245,196,0,0.30)] transition-all">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-white font-bold text-lg">{study.title}</h4>
                <span className="text-[10px] bg-[rgba(245,196,0,0.10)] text-[#F5C400] border border-[rgba(245,196,0,0.25)] px-2 py-1 rounded-full uppercase font-bold tracking-widest">{study.tag}</span>
              </div>
              <p className="text-[#A9A9AD] text-sm">{study.desc}</p>
            </div>
          ))}
        </div>
      }
    />
  );
};

const BlogPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.blog.title} 
      subtitle={t.pages.blog.subtitle}
      icon={BookOpen}
      content={
        <div className="space-y-8">
          {t.pages.blog.posts.map((post, i) => (
            <div key={i} className="border-b border-[#29292C] pb-8 last:border-0 last:pb-0">
              <div className="text-xs text-[#737378] mb-2">{post.date}</div>
              <h4 className="text-white font-bold text-xl mb-3 hover:text-[#F5C400] cursor-pointer transition-colors">{post.title}</h4>
              <p className="text-[#A9A9AD] text-sm mb-4">{post.excerpt}</p>
              <button className="text-[#F5C400] text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer">{t.pages.blog.readMore} <ArrowRight className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      }
    />
  );
};

const DatabasePage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.database.title} 
      subtitle={t.pages.database.subtitle}
      icon={Database}
      content={
        <>
          <p>{t.pages.database.intro}</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {t.pages.database.stats.map((stat, i) => (
              <div key={i} className="bg-[#1C1C1E] rounded-xl p-4 text-center border border-[#29292C]">
                <div className="text-[#F5C400] font-bold text-xl">{stat.value}</div>
                <div className="text-[10px] text-[#737378] uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </>
      }
    />
  );
};

const GuidesPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.guides.title} 
      subtitle={t.pages.guides.subtitle}
      icon={FileText}
      content={
        <div className="grid md:grid-cols-2 gap-6">
          {t.pages.guides.items.map((guide, i) => (
            <div key={i} className="bg-[#1C1C1E] rounded-xl p-6 border border-[#29292C] flex items-center justify-between group cursor-pointer hover:border-[rgba(245,196,0,0.30)] hover:bg-[#1C1C1E]/80 transition-all">
              <div>
                <div className="text-white font-bold mb-1">{guide.title}</div>
                <div className="text-xs text-[#737378]">{guide.type} • {guide.size}</div>
              </div>
              <ArrowRight className="text-[#737378] group-hover:text-[#F5C400] transition-colors" />
            </div>
          ))}
        </div>
      }
    />
  );
};

const FAQPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.faq.title} 
      subtitle={t.pages.faq.subtitle}
      icon={HelpCircle}
      content={
        <div className="space-y-4">
          {t.pages.faq.items.map((faq, i) => (
            <details key={i} className="bg-[#1C1C1E] rounded-xl border border-[#29292C] group overflow-hidden">
              <summary className="p-6 cursor-pointer flex justify-between items-center list-none hover:text-[#F5C400] transition-colors">
                <span className="font-bold text-white">{faq.q}</span>
                <ChevronRight className="w-5 h-5 text-[#737378] group-open:rotate-90 group-open:text-[#F5C400] transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-[#A9A9AD] text-sm leading-relaxed border-t border-[#29292C] pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      }
    />
  );
};

const PrivacyPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.privacy.title} 
      subtitle={t.pages.privacy.subtitle} 
      icon={Lock} 
      content={
        <div className="space-y-6">
          <p>{t.pages.privacy.p1}</p>
          <div className="p-4 bg-[rgba(245,196,0,0.05)] border border-[rgba(245,196,0,0.30)] rounded-xl text-slate-300 text-sm">
            <strong className="text-[#F5C400]">{t.pages.privacy.noticeTitle}</strong> {t.pages.privacy.noticeText}
          </div>
          <p>{t.pages.privacy.p2}</p>
          <p>{t.pages.privacy.p3}</p>
        </div>
      } 
    />
  );
};

const TermsPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.terms.title} 
      subtitle={t.pages.terms.subtitle} 
      icon={FileText} 
      content={
        <div className="space-y-6">
          <p>{t.pages.terms.p1}</p>
          <p className="font-semibold text-white">{t.pages.terms.highlight}</p>
          <p>{t.pages.terms.p2}</p>
          <p>{t.pages.terms.p3}</p>
        </div>
      } 
    />
  );
};

const AmlKycPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.amlKyc.title} 
      subtitle={t.pages.amlKyc.subtitle} 
      icon={Scale} 
      content={
        <div className="space-y-6">
          <p>{t.pages.amlKyc.p1}</p>
          <p>{t.pages.amlKyc.p2}</p>
          <p>{t.pages.amlKyc.p3}</p>
        </div>
      } 
    />
  );
};

const CookiesPage = () => {
  const { t } = useLanguage();
  return (
    <ContentPage 
      title={t.pages.cookies.title} 
      subtitle={t.pages.cookies.subtitle} 
      icon={Globe} 
      content={
        <div className="space-y-8">
          <div className="text-xs text-[#737378] uppercase tracking-widest font-bold mb-8">{t.pages.cookies.lastUpdated}</div>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">{t.pages.cookies.s1Title}</h3>
            <p>{t.pages.cookies.s1Text}</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">{t.pages.cookies.s2Title}</h3>
            <p>{t.pages.cookies.s2Text}</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">{t.pages.cookies.s3Title}</h3>
            <p>{t.pages.cookies.s3Text}</p>
          </section>
        </div>
      } 
    />
  );
};

const ContactPage = () => (
  <div className="pt-20">
    <ContactForm />
  </div>
);

// --- Main App ---

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DemoDataProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="case-studies" element={<CaseStudiesPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="database" element={<DatabasePage />} />
                <Route path="guides" element={<GuidesPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="aml-kyc" element={<AmlKycPage />} />
                <Route path="cookies" element={<CookiesPage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredRole="client">
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </DemoDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

