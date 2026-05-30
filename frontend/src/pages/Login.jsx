import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, User, Phone, LogIn, HeartPulse, ShieldCheck, Zap, Lock, Shield, Award, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'Patient', otp: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        const res = await axios.post('/api/auth/register', formData);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate(res.data.role === 'Doctor' ? '/doctor' : '/patient');
      } else {
        if (step === 1) {
          await axios.post('/api/auth/login', { email: formData.email, password: formData.password });
          setStep(2);
        } else {
          const res = await axios.post('/api/auth/verify-otp', { email: formData.email, otp: formData.otp });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data));
          navigate(res.data.role === 'Doctor' ? '/doctor' : '/patient');
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060B14] text-[#F9FAFB] font-inter overflow-hidden selection:bg-indigo-500/30 grid-bg flex justify-center items-center p-4 md:p-8">
      
      {/* Background Radial Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] orb-pulse pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] orb-pulse pointer-events-none z-0" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-[30%] right-[20%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[130px] orb-pulse pointer-events-none z-0" style={{ animationDelay: '1.5s' }}></div>

      {/* Main Two-Column Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        
        {/* LEFT PANEL - AUTHENTICATION (420px fixed on desktop) */}
        <div className="w-full lg:w-[450px] shrink-0">
          
          {/* Glassmorphism Card Wrapper */}
          <div className="relative bg-white/[0.03] backdrop-blur-[20px] border border-white/[0.08] rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col z-20">
            
            {/* Top Glow Edge Line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-t-3xl z-20"></div>

            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-60 scale-110"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg">
                  <HeartPulse size={36} className="text-white" />
                </div>
              </div>
              
              {/* Brand Name */}
              <div className="flex items-center gap-0.5">
                <span className="text-3xl font-jakarta font-extrabold text-white tracking-tight">Medi</span>
                <span className="text-3xl font-jakarta font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text tracking-tight">pass</span>
              </div>
              
              {/* Tagline */}
              <p className="text-[10px] tracking-[0.2em] font-extrabold text-indigo-300/50 uppercase mt-1">
                HEALTH PASSPORT &middot; EMR SYSTEM
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

            {/* Welcome Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-jakarta font-extrabold text-white tracking-tight">
                {isRegistering ? 'Create Account' : (step === 2 ? 'Verify OTP' : 'Welcome Back 👋')}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {isRegistering ? 'Join the future of decentralized medical records.' : (step === 2 ? 'Enter the security code to access your portal.' : 'Securely access your medical passport.')}
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-full w-fit mx-auto mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                256-bit encrypted connection
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-gray-500 transition-all duration-300" />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-gray-500 transition-all duration-300" />
                  </div>
                  <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
                    <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5 rounded-lg font-medium transition-all duration-300 ${formData.role === 'Patient' ? 'bg-primary-gradient text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <input type="radio" name="role" value="Patient" checked={formData.role === 'Patient'} onChange={handleChange} className="hidden" /> Patient
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5 rounded-lg font-medium transition-all duration-300 ${formData.role === 'Doctor' ? 'bg-primary-gradient text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <input type="radio" name="role" value="Doctor" checked={formData.role === 'Doctor'} onChange={handleChange} className="hidden" /> Provider
                    </label>
                  </div>
                </motion.div>
              )}

              {(!isRegistering && step === 2) ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative mb-4 group">
                  <KeyRound className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input type="text" name="otp" placeholder="Enter OTP (See Backend Console)" value={formData.otp} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-gray-500 transition-all font-mono tracking-widest text-lg text-center duration-300" />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-gray-500 transition-all duration-300" />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-gray-500 transition-all duration-300" />
                  </div>
                </motion.div>
              )}

              <motion.button 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit" 
                className="w-full bg-primary-gradient py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-8 shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_25px_rgba(79,70,229,0.5)] transition-all btn-shimmer text-white relative"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isRegistering ? 'Create Secure Account' : (step === 2 ? 'Verify & Enter' : 'Secure Login')}</span>
                    <LogIn size={18} className="ml-1" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer Links */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs font-semibold uppercase tracking-wider">
              <button 
                type="button" 
                onClick={() => { setIsRegistering(!isRegistering); setStep(1); }} 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                {isRegistering ? 'Already registered? Log in' : "Sign up"}
              </button>
              {!isRegistering && (
                <button 
                  type="button" 
                  onClick={() => alert("Please contact system administrator to reset password.")} 
                  className="text-gray-500 hover:text-indigo-400 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-[9px] text-gray-500 font-bold tracking-wider uppercase mt-8 border-t border-white/5 pt-4">
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-indigo-400/60" />
                <span>HIPAA Compliant</span>
              </div>
              <span>&middot;</span>
              <div className="flex items-center gap-1">
                <Award size={12} className="text-purple-400/60" />
                <span>ISO 27001</span>
              </div>
              <span>&middot;</span>
              <div className="flex items-center gap-1">
                <Zap size={12} className="text-cyan-400/60" />
                <span>2FA Ready</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL - SHOWCASE (flex remaining, hidden on tablet/mobile) */}
        <div className="hidden lg:flex flex-1 flex-col relative py-8">
          
          {/* Floating Notification Card */}
          <div className="absolute top-0 right-0 glass-panel py-3.5 px-5 rounded-2xl border border-emerald-500/20 flex items-center gap-3 shadow-[0_10px_35px_rgba(16,185,129,0.15)] float-anim bg-[#060B14]/80 backdrop-blur-md z-30">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-white font-jakarta font-bold text-xs">Token Generated</p>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Expires 10:00 &middot; QR Ready</p>
            </div>
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-6 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            The Future of EMR
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl xl:text-6xl font-jakarta font-extrabold leading-[1.15] mb-6 text-white tracking-tight">
            Your Medical History, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              Absolutely Secure.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#94A3B8] text-[15px] font-medium leading-[1.7] max-w-xl mb-8">
            Health Passport empowers you to carry your entire medical history in your pocket. Share specific records with doctors instantly via cryptographic Smart Consent QR tokens.
          </p>

          {/* 3 Feature Cards */}
          <div className="grid gap-4 max-w-xl mb-10">
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-white font-jakarta font-bold text-base">Privacy First</h4>
                <p className="text-[#94A3B8] text-sm">Granular Record Sharing</p>
              </div>
            </div>
            
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="text-white font-jakarta font-bold text-base">Lightning Fast</h4>
                <p className="text-[#94A3B8] text-sm">Instant QR Decryption</p>
              </div>
            </div>
            
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="text-white font-jakarta font-bold text-base">Smart Vitals</h4>
                <p className="text-[#94A3B8] text-sm">AI-Powered Health Insights</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 max-w-xl border-t border-white/10 pt-8">
            <div className="glass-panel p-4 rounded-2xl text-center border border-white/5 hover:border-indigo-500/10 transition-colors">
              <p className="text-2xl font-jakarta font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">2.4M+</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Records Protected</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center border border-white/5 hover:border-cyan-500/10 transition-colors">
              <p className="text-2xl font-jakarta font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">98%</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Uptime SLA</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center border border-white/5 hover:border-emerald-500/10 transition-colors">
              <p className="text-2xl font-jakarta font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">140+</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Hospitals</p>
            </div>
          </div>

        </div>

      </div>
      
      {/* Required styles for backgrounds and animations */}
      <style>{`
        .grid-bg {
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
        }
        @keyframes pulse-orb {
          0%, 100% {
            transform: scale(1.0);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.6;
          }
        }
        .orb-pulse {
          animation: pulse-orb 8s ease-in-out infinite;
        }
        @keyframes float-card {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .float-anim {
          animation: float-card 4s ease-in-out infinite;
        }
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transform: skewX(-20deg);
        }
        .btn-shimmer:hover::after {
          left: 150%;
          transition: 0.75s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
