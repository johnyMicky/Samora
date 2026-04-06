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
  HelpCircle
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Scroll to Top Component ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Components ---

const Navbar = () => {
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
    { name: 'Services', href: isHome ? '#services' : '/#services' },
    { name: 'How it Works', href: isHome ? '#how-it-works' : '/#how-it-works' },
    { name: 'Why Us', href: isHome ? '#why-us' : '/#why-us' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled || !isHome ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-linear-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">Samora Trace</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.href.startsWith('#') || (link.href.startsWith('/#')) ? (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
          <Link to="/contact" className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-sky-500/25 active:scale-95">
            Free Consultation
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-white/5 overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              {navLinks.map((link) => (
                link.href.startsWith('#') || (link.href.startsWith('/#')) ? (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-slate-300"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-slate-300"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="bg-sky-500 text-white px-5 py-3 rounded-xl text-center font-semibold">
                Free Consultation
              </Link>
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
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
              </marker>
            </defs>

            {/* Grid Lines with Flow */}
            {Array.from({ length: 10 }).map((_, i) => {
              const y = 100 + i * 100;
              return (
                <g key={`h-${i}`}>
                  <line x1="0" y1={y} x2="1000" y2={y} stroke="rgba(14, 165, 233, 0.1)" strokeWidth="1" />
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
                  <line x1={x} y1="0" x2={x} y2="1000" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="1" />
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
                    <rect x={x - 10} y={y - 10} width="20" height="20" fill="rgba(15, 23, 42, 0.8)" stroke="#0ea5e9" strokeWidth="1" />
                    <rect x={x - 6} y={y - 6} width="12" height="12" fill="#0ea5e9" opacity="0.3" />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#0ea5e9"
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
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const analysisData = [
    { network: 'Ethereum Mainnet', address: '0x71C...3f92', hash: '0x82a...e12b', status: 'Tracing Active' },
    { network: 'Bitcoin Network', address: 'bc1q...x9p4', hash: '6f8d...a2c1', status: 'Node Syncing' },
    { network: 'Solana Mainnet', address: '7v9E...m2K8', hash: '4h5j...k9L2', status: 'Analyzing Path' },
    { network: 'Polygon POS', address: '0x3A2...fE91', hash: '0x1b2...c3d4', status: 'Mapping Assets' },
    { network: 'Avalanche C-Chain', address: '0x9E1...c4A3', hash: '0x7d8...e9f0', status: 'Verifying Node' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisIndex((prev) => (prev + 1) % analysisData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
      <BlockchainChains />
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-sky-500/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Zap className="w-3 h-3" />
            Advanced Blockchain Security & Analysis
          </div>
          <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
            Secure Your <br />
            <span className="gradient-text">Digital Portfolio</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
            Samora Trace provides specialized digital asset analysis and transaction mapping. Our technical consultants utilize professional auditing tools to analyze complex blockchain activity and support informed decision-making.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact">
              <button className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-sky-500/25 flex items-center gap-2 group">
                Request Security Audit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/case-studies">
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all">
                Our Methodology
              </button>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-8">
            <div>
              <div className="text-2xl font-bold text-white">$450M+</div>
              <div className="text-sm text-slate-500">Assets Analyzed</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl font-bold text-white">94%</div>
              <div className="text-sm text-slate-500">Analysis Rate</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-slate-500">Technical Support</div>
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
              <div className="text-lg font-bold text-white">Live Analysis Node</div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Blockchain Network', value: analysisData[analysisIndex].network, icon: Globe },
                { label: 'Target Address', value: analysisData[analysisIndex].address, icon: Search },
                { label: 'Transaction Hash', value: analysisData[analysisIndex].hash, icon: History },
                { label: 'Forensic Status', value: analysisData[analysisIndex].status, icon: FileSearch, color: 'text-sky-400' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-400">{item.label}</span>
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

            <div className="mt-8 p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Security Protocol</span>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Encrypted forensic tunnel established. All tracing data is handled with military-grade encryption and strict confidentiality protocols.
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />

          {/* Floating Progress Card (from user image) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute -bottom-12 -right-6 lg:-right-12 z-20 w-80 glass-card p-6 shadow-2xl border-sky-500/30"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Endpoint Located</div>
                <div className="text-xs text-slate-400">Platform Custodial Wallet</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analysis Progress</span>
                <span className="text-xs font-bold text-emerald-500">85%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Transaction Mapping",
      description: "Detailed analysis of digital asset movements across blockchain networks using professional monitoring tools.",
      icon: Search,
      color: "from-sky-500 to-blue-600"
    },
    {
      title: "Asset Management Support",
      description: "Technical consulting focused on structured analysis, reporting, and guidance within digital asset environments.",
      icon: Lock,
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Technical Documentation",
      description: "Preparation of professional reports and structured documentation for technical and administrative use.",
      icon: Scale,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Security Auditing",
      description: "Comprehensive technical analysis of blockchain activity, including anomaly detection and risk evaluation.",
      icon: FileSearch,
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <section id="services" className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Professional Security Services</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We combine technical analysis with security strategy to provide comprehensive 
            digital asset management solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card p-8 hover:border-sky-500/30 transition-all group"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl bg-linear-to-br flex items-center justify-center mb-6 shadow-lg",
                service.color
              )}>
                <service.icon className="text-white w-7 h-7" />
              </div>
              <h3 className="text-xl mb-3 group-hover:text-sky-400 transition-colors">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const steps = [
    {
      title: "Case Assessment",
      desc: "Submit details regarding the security incident, including relevant transaction data.",
      icon: MessageSquare
    },
    {
      title: "Technical Analysis",
      desc: "Our team maps the flow of assets through the network to identify current endpoints.",
      icon: Search
    },
    {
      title: "Identification",
      desc: "We pinpoint the entities or platforms where the unaccounted assets are located.",
      icon: Shield
    },
    {
      title: "Technical Support",
      desc: "Provide structured technical documentation and coordination support based on analysis findings.",
      icon: Scale
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-6">Our Analysis <br />Methodology</h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Managing digital assets is a technical process that requires precision. 
              We've developed a professional framework to provide comprehensive technical insights.
            </p>
            
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sky-400 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-card p-1 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000" 
                alt="Blockchain visualization" 
                className="w-full h-auto rounded-2xl opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass-card p-6 bg-slate-900/80 backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Endpoint Located</div>
                      <div className="text-xs text-slate-400">Platform Custodial Wallet</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Analysis Progress</span>
                    <span className="text-[10px] text-emerald-500 font-bold">85%</span>
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

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry: 'Unauthorized Transaction',
    value: '',
    details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Security Consultation Request: ${formData.inquiry}`;
    const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0AAsset Value: ${formData.value}%0D%0A%0D%0ADetails:%0D%0A${formData.details}`;
    window.location.href = `mailto:audits@samoratrace.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  return (
    <section className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-8 md:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <div>
              <h2 className="text-4xl mb-6">Request a Security <br />Consultation</h2>
              <p className="text-slate-400 mb-10">
                Technical analysis is time-sensitive. Contact our security team for a 
                confidential assessment of your digital asset status.
              </p>
              
              <div className="space-y-6">
                <a href="mailto:audits@samoratrace.com" className="flex items-center gap-4 group w-fit">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-sky-500/10 transition-colors">
                    <Mail className="text-sky-400 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Email Us</div>
                    <div className="text-white font-medium group-hover:text-sky-400 transition-colors">audits@samoratrace.com</div>
                  </div>
                </a>
                <a href="tel:+12058278844" className="flex items-center gap-4 group w-fit">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-sky-500/10 transition-colors">
                    <Phone className="text-sky-400 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Technical Support</div>
                    <div className="text-white font-medium group-hover:text-sky-400 transition-colors">+1 (205) 827-8844</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Available for client support and consultation inquiries.</div>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <MapPin className="text-sky-400 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Global HQ</div>
                    <div className="text-white font-medium">One World Trade Center, 85th Floor, New York, NY 10007, USA</div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0" />
                <p className="text-sm text-amber-200/70 leading-relaxed">
                  <span className="text-amber-500 font-bold">Notice:</span> Ensure you are communicating 
                  through official channels. Samora Trace provides technical auditing and analysis services 
                  and will never request sensitive credentials or private keys.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Nature of Inquiry</label>
                <select 
                  value={formData.inquiry}
                  onChange={(e) => setFormData({...formData, inquiry: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors appearance-none"
                >
                  <option className="bg-slate-900">Unauthorized Transaction</option>
                  <option className="bg-slate-900">Portfolio Security Audit</option>
                  <option className="bg-slate-900">Inaccessible Assets</option>
                  <option className="bg-slate-900">Platform Dispute</option>
                  <option className="bg-slate-900">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Asset Value (USD)</label>
                <input 
                  type="text" 
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="$10,000+"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Inquiry Details</label>
                <textarea 
                  rows={4}
                  required
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="Describe the technical situation..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-500/25 active:scale-[0.98]"
              >
                Submit for Technical Review
              </button>
              <p className="text-center text-xs text-slate-500">
                All requests are reviewed as part of a technical analysis process. Results may vary depending on complexity and available data.
              </p>
              <p className="text-center text-xs text-slate-500 mt-2">
                By submitting, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
              <div className="w-8 h-8 bg-linear-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-display font-bold text-white">Samora Trace</span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-6">
              Samora Trace provides technical analysis and structured insights for digital asset activity. Our services focus on transparency, risk awareness, and data-driven evaluation within modern blockchain environments.
            </p>
            <div className="flex items-start gap-3 text-slate-400 mb-4">
              <MapPin className="w-5 h-5 text-sky-400 shrink-0" />
              <span className="text-sm">One World Trade Center, 85th Floor, New York, NY 10007, USA</span>
            </div>
            <a href="tel:+12058278844" className="flex items-start gap-3 text-slate-400 mb-6 hover:text-white transition-colors group">
              <Phone className="w-5 h-5 text-sky-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 group-hover:text-sky-400 transition-colors">Technical Support</span>
                <span className="text-sm">+1 (205) 827-8844</span>
                <span className="text-[10px] text-slate-600 mt-0.5">Available for client support and consultation inquiries.</span>
              </div>
            </a>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/samora.trace" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-sky-400 hover:bg-white/10 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-sky-400 hover:bg-white/10 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="mailto:audits@samoratrace.com" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-sky-400 hover:bg-white/10 transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-6">Company</h5>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/team" className="hover:text-white transition-colors">Our Team</Link></li>
              <li><Link to="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-6">Resources</h5>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/blog" className="hover:text-white transition-colors">Security Blog</Link></li>
              <li><Link to="/database" className="hover:text-white transition-colors">Network Database</Link></li>
              <li><Link to="/guides" className="hover:text-white transition-colors">Auditing Guides</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500 flex flex-col gap-1">
            <div>© 2026 Samora Trace Forensic Services Ltd. All rights reserved.</div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Licensing:</span>
                <span className="text-white">NYS Dept. of State License #11000349281 (Private Investigator)</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Security:</span>
                <span className="text-white">ISO/IEC 27001:2022 (IS 712843)</span>
                <span className="w-px h-3 bg-white/10 mx-1" />
                <span className="text-[10px] text-sky-400 font-bold uppercase">Certified by BSI (UKAS Accredited Body #0008)</span>
              </div>
              <a href="https://www.iafcertsearch.org/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-white underline transition-colors">
                Verify via IAF CertSearch
              </a>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/aml-kyc" className="hover:text-white transition-colors">AML / KYC Policy</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Page Components ---

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-sky-500/30">
      <Navbar />
      <main>
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <Link to="/contact">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-sky-500 text-white rounded-full shadow-2xl shadow-sky-500/40 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Chat with an Expert
          </span>
        </motion.button>
      </Link>

      <Footer />
    </div>
  );
};

const HomePage = () => {
  return (
    <>
      <Hero />
      
      {/* Certification Bar */}
      <div className="bg-slate-900/80 border-y border-white/5 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <Shield className="w-5 h-5 text-sky-400" /> Security Standards Oriented
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <Lock className="w-5 h-5 text-sky-400" /> Compliance-Focused Framework
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <Scale className="w-5 h-5 text-sky-400" /> Industry-Aligned Practices
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase">
            <CheckCircle2 className="w-5 h-5 text-sky-400" /> CBFA CERTIFIED
          </div>
        </div>
      </div>

      <Services />
      
      {/* Supported Platforms Section */}
      <section className="py-20 px-6 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Supported Platforms</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-2">
              Samora Trace operates independently and provides technical analysis across publicly accessible blockchain networks and commonly used digital asset platforms.
            </p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold max-w-2xl mx-auto">
              We are not affiliated with, endorsed by, or partnered with any third-party wallet providers, exchanges, or financial platforms listed below.
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
                className="glass-card p-4 flex items-center justify-center text-center hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group"
              >
                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                  {platform.name}
                </span>
              </a>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
              Platform names are provided for informational reference only.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Partners Section */}
      <section className="py-20 px-6 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Integrated Technology Partners</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              We utilize industry-standard remote collaboration and communication platforms to support secure technical consultation and analysis.
            </p>
            <div className="mt-6 space-y-3">
              <p className="text-slate-500 text-[11px] max-w-xl mx-auto leading-relaxed">
                For security and privacy reasons, all sessions are strictly limited to screen sharing and visual verification only. Samora Trace does not request or require remote device control, access to sensitive credentials, or installation of third-party software.
              </p>
              <p className="text-sky-400 text-[10px] uppercase tracking-[0.2em] font-bold max-w-xl mx-auto">
                Clients are advised to maintain full control of their devices at all times and avoid granting access permissions to any external party.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            {/* AnyDesk */}
            <a href="https://anydesk.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-red-500/50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-red-500" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors tracking-widest uppercase">AnyDesk</span>
            </a>

            {/* Google Meet */}
            <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z" fill="#00897B"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors tracking-widest uppercase">Google Meet</span>
            </a>

            {/* Zoom */}
            <a href="https://zoom.us" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-sky-500/50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-sky-500" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44a1.005 1.005 0 01-1.14 0l-7.9-4.44A1.01 1.01 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.18-.1.37-.15.57-.15.2 0 .39.05.57.15l7.9 4.44c.32.17.53.5.53.88v9z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors tracking-widest uppercase">Zoom</span>
            </a>

            {/* Screenleap */}
            <a href="https://www.screenleap.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-orange-500" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors tracking-widest uppercase">Screenleap</span>
            </a>
          </div>
        </div>
      </section>

      <Process />
      
      {/* Trust Section */}
      <section id="why-us" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-4xl mb-6">Why Trust <br />Samora Trace?</h2>
              <p className="text-slate-400 mb-8">
                We are a specialized technical agency focused on digital asset analysis and blockchain activity evaluation. Our approach is based on structured methodologies, professional tools, and data-driven insights.
              </p>
              <button className="text-sky-400 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                View Technical Credentials <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Security Standards Oriented",
                  desc: "Our team follows structured technical auditing standards and professional analysis protocols.",
                  icon: Shield
                },
                {
                  title: "Compliance-Focused Framework",
                  desc: "We operate within a compliance-oriented framework to support transparency in digital asset environments.",
                  icon: Zap
                },
                {
                  title: "Industry-Aligned Practices",
                  desc: "Our methodologies are aligned with industry standards for technical auditing and data-driven evaluation.",
                  icon: Globe
                },
                {
                  title: "Data-Driven Analysis",
                  desc: "We provide structured technical insights based on professional analysis tools and blockchain activity mapping.",
                  icon: CheckCircle2
                }
              ].map((item, i) => (
                <div key={i} className="glass-card p-8">
                  <item.icon className="text-sky-400 w-8 h-8 mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactForm />
    </>
  );
};

const ContentPage = ({ title, subtitle, content, icon: Icon }: { title: string, subtitle: string, content: React.ReactNode, icon: any }) => {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Icon className="text-sky-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-5xl">{title}</h1>
          </div>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed">{subtitle}</p>
          <div className="glass-card p-8 md:p-12 text-slate-300 leading-relaxed space-y-6">
            {content}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AboutPage = () => (
  <ContentPage 
    title="About Us" 
    subtitle="Leading the way in digital asset security and blockchain forensics."
    icon={Shield}
    content={
      <div className="space-y-6">
        <p>Samora Trace is a technical analysis and digital asset intelligence platform focused on providing structured insights into blockchain activity.</p>
        <p>Our team specializes in transaction mapping, technical auditing, and data-driven reporting to support transparency and risk awareness in digital asset environments.</p>
        <p>We operate with a strong emphasis on analytical accuracy, confidentiality, and professional standards. Our role is to provide clients with clear, structured information to support informed decisions.</p>
        <p>Samora Trace does not act as a financial intermediary and does not provide fund recovery services. All services are limited to technical analysis, reporting, and consultation.</p>
      </div>
    }
  />
);

const TeamPage = () => (
  <ContentPage 
    title="Our Team" 
    subtitle="Meet the experts behind our technical analysis and security protocols."
    icon={Users}
    content={
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { name: "David Samora", role: "Chief Forensic Analyst", bio: "Former cybercrime investigator with 15 years of experience in digital forensics." },
          { name: "Elena Vance", role: "Head of Security Auditing", bio: "Expert in smart contract security and DeFi protocol analysis." },
          { name: "Marcus Chen", role: "Lead Blockchain Architect", bio: "Specializes in cross-chain transaction mapping and obfuscation analysis." },
          { name: "Sarah Jenkins", role: "Technical Coordinator", bio: "Manages administrative coordination with global platforms and security networks." }
        ].map((member, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/5">
            <div className="text-white font-bold text-lg mb-1">{member.name}</div>
            <div className="text-sky-400 text-sm mb-3">{member.role}</div>
            <p className="text-slate-400 text-sm">{member.bio}</p>
          </div>
        ))}
      </div>
    }
  />
);

const CaseStudiesPage = () => (
  <ContentPage 
    title="Case Studies" 
    subtitle="Real-world examples of our technical analysis and asset mapping."
    icon={History}
    content={
      <div className="space-y-8">
        {[
          { title: "DeFi Protocol Exploit Analysis", desc: "Mapped $12M in unauthorized transfers across 4 chains, providing comprehensive technical evidence.", tag: "High Complexity" },
          { title: "Phishing Attack Mapping", desc: "Identified the endpoint of a $2.5M phishing campaign and provided structured data for platform review.", tag: "Fast Response" },
          { title: "Legacy Wallet Technical Audit", desc: "Successfully mapped access protocols for a legacy wallet through technical auditing and documentation.", tag: "Technical Audit" }
        ].map((study, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/5 group hover:border-sky-500/30 transition-all">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-white font-bold text-lg">{study.title}</h4>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-1 rounded-full uppercase font-bold tracking-widest">{study.tag}</span>
            </div>
            <p className="text-slate-400 text-sm">{study.desc}</p>
          </div>
        ))}
      </div>
    }
  />
);

const BlogPage = () => (
  <ContentPage 
    title="Security Blog" 
    subtitle="Insights, trends, and updates from the world of blockchain security."
    icon={BookOpen}
    content={
      <div className="space-y-8">
        {[
          { title: "The Evolution of Mixing Protocols", date: "Oct 12, 2025", excerpt: "How modern analysis tools are overcoming traditional obfuscation techniques." },
          { title: "Securing Your Digital Portfolio", date: "Sep 28, 2025", excerpt: "Best practices for multi-signature setups and cold storage management." },
          { title: "Understanding Zero-Knowledge Proofs", date: "Sep 15, 2025", excerpt: "A deep dive into the technology shaping the future of blockchain privacy." }
        ].map((post, i) => (
          <div key={i} className="border-b border-white/5 pb-8 last:border-0 last:pb-0">
            <div className="text-xs text-slate-500 mb-2">{post.date}</div>
            <h4 className="text-white font-bold text-xl mb-3 hover:text-sky-400 cursor-pointer transition-colors">{post.title}</h4>
            <p className="text-slate-400 text-sm mb-4">{post.excerpt}</p>
            <button className="text-sky-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">Read More <ArrowRight className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    }
  />
);

const DatabasePage = () => (
  <ContentPage 
    title="Network Database" 
    subtitle="Our proprietary database of known security threats and network endpoints."
    icon={Database}
    content={
      <>
        <p>Samora Trace maintains one of the industry's most comprehensive databases of verified security threats, malicious endpoints, and platform hot-wallets.</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Verified Endpoints", value: "12,450+" },
            { label: "Threat Patterns", value: "890+" },
            { label: "Platform Nodes", value: "45" },
            { label: "Daily Updates", value: "24/7" },
            { label: "Data Integrity", value: "99.9%" },
            { label: "Network Coverage", value: "15+ Chains" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <div className="text-sky-400 font-bold text-xl">{stat.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </>
    }
  />
);

const GuidesPage = () => (
  <ContentPage 
    title="Auditing Guides" 
    subtitle="Professional resources for digital asset management and security."
    icon={FileText}
    content={
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: "Self-Audit Checklist", type: "PDF Guide", size: "2.4 MB" },
          { title: "Incident Response Plan", type: "Template", size: "1.1 MB" },
          { title: "Exchange Security Review", type: "Whitepaper", size: "4.8 MB" },
          { title: "Cold Storage Best Practices", type: "Video Series", size: "N/A" }
        ].map((guide, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
            <div>
              <div className="text-white font-bold mb-1">{guide.title}</div>
              <div className="text-xs text-slate-500">{guide.type} • {guide.size}</div>
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-sky-400 transition-colors" />
          </div>
        ))}
      </div>
    }
  />
);

const FAQPage = () => (
  <ContentPage 
    title="FAQ" 
    subtitle="Answers to common questions about our technical analysis and auditing services."
    icon={HelpCircle}
    content={
      <div className="space-y-4">
        {[
          {
            q: "What does Samora Trace do?",
            a: "We provide technical analysis and reporting for blockchain activity."
          },
          {
            q: "Do you recover lost funds?",
            a: "No. We provide analysis and insights only. We do not perform fund recovery."
          },
          {
            q: "What information do I need to provide?",
            a: "Transaction IDs, wallet addresses, and relevant context."
          },
          {
            q: "Is my data secure?",
            a: "Yes. We follow strict confidentiality and data protection practices."
          },
          {
            q: "How long does analysis take?",
            a: "Depends on complexity. Typically 24–72 hours."
          }
        ].map((faq, i) => (
          <details key={i} className="bg-white/5 rounded-xl border border-white/5 group overflow-hidden">
            <summary className="p-6 cursor-pointer flex justify-between items-center list-none">
              <span className="font-bold text-white">{faq.q}</span>
              <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    }
  />
);

const ContactPage = () => (
  <div className="pt-20">
    <ContactForm />
  </div>
);

// --- Main App ---

export default function App() {
  return (
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
          <Route path="privacy" element={
            <ContentPage 
              title="Privacy Policy" 
              subtitle="Our commitment to data integrity and client confidentiality." 
              icon={Lock} 
              content={
                <div className="space-y-6">
                  <p>We collect basic user information such as name, email, and submitted details for the purpose of communication and technical analysis.</p>
                  <p>We do not sell or share user data with third parties. All data is stored securely and handled in accordance with modern data protection standards.</p>
                  <p>Users have the right to request access, modification, or deletion of their data.</p>
                </div>
              } 
            />
          } />
          <Route path="terms" element={
            <ContentPage 
              title="Terms of Service" 
              subtitle="Legal framework for our forensic and auditing services." 
              icon={FileText} 
              content={
                <div className="space-y-6">
                  <p>Samora Trace provides technical analysis, reporting, and consultation services only.</p>
                  <p>We do not guarantee specific outcomes and do not provide financial or legal advice.</p>
                  <p>Users are responsible for the accuracy of the information they provide.</p>
                  <p>Samora Trace is not liable for decisions made based on provided analysis.</p>
                </div>
              } 
            />
          } />
          <Route path="aml-kyc" element={
            <ContentPage 
              title="AML / KYC Policy" 
              subtitle="Our commitment to compliance and anti-money laundering principles." 
              icon={Scale} 
              content={
                <div className="space-y-6">
                  <p>Samora Trace operates within a compliance-oriented framework and supports anti-money laundering principles.</p>
                  <p>We do not engage in or support illegal activities.</p>
                  <p>We reserve the right to refuse service in cases where risk or compliance concerns are identified.</p>
                </div>
              } 
            />
          } />
          <Route path="cookies" element={
            <ContentPage 
              title="Cookie Policy" 
              subtitle="Transparency regarding our digital tracking and security protocols." 
              icon={Globe} 
              content={
                <div className="space-y-8">
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-8">Last Updated: April 5, 2026</div>
                  <section>
                    <h3 className="text-xl font-bold text-white mb-4">1. Use of Cookies</h3>
                    <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.</p>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold text-white mb-4">2. Essential Cookies</h3>
                    <p>These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences or filling in forms.</p>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold text-white mb-4">3. Security Cookies</h3>
                    <p>We use security cookies to help identify and prevent security risks. For example, we use these cookies to store information that allows us to recover your session if you are disconnected during a secure forensic data upload.</p>
                  </section>
                </div>
              } 
            />
          } />
        </Route>
      </Routes>
    </Router>
  );
}

