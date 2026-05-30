import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ShieldAlert, Pill, Activity, Share2, LogOut, Loader2, 
  LayoutDashboard, FolderOpen, HeartPulse, Stethoscope, Settings, 
  Bell, Search, Lock, ShieldCheck, ChevronUp, Calendar, AlertTriangle, UserCheck, TrendingUp, User, Phone, KeyRound, Save, Bot, Send, MessageSquare
} from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  // New State for Notifications & Logs
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [accessLogs, setAccessLogs] = useState([]);
  const [revoking, setRevoking] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const notifRef = useRef(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({ name: user.name || '', phone: user.phone || '', password: '' });
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // AI Assistant State
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am your Medipass AI Assistant. I can help you understand your medical records, lab results, and prescriptions. How can I help you today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'AI Assistant' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch everything in parallel
        const [recordsRes, notifRes, logsRes] = await Promise.all([
          axios.get('/api/records', config),
          axios.get('/api/notifications', config).catch(() => ({ data: [] })),
          axios.get('/api/consent/logs', config).catch(() => ({ data: [] }))
        ]);
        
        setRecords(recordsRes.data);
        setNotifications(notifRes.data);
        setAccessLogs(logsRes.data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Handle outside click for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markNotificationRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm("Are you sure you want to revoke all active tokens? Medical staff will instantly lose access.")) return;
    try {
      setRevoking(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/consent/revoke', {}, { headers: { Authorization: `Bearer ${token}` } });
      setQrToken(null);
      alert("All active tokens revoked securely.");
    } catch (error) {
      console.error(error);
      alert("Failed to revoke tokens");
    } finally {
      setRevoking(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setUpdatingSettings(true);
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/auth/profile', settingsForm, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem('user', JSON.stringify(res.data));
      alert("Profile updated successfully");
      setSettingsForm(prev => ({ ...prev, password: '' }));
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleSendMessage = (e, presetText = null) => {
    if (e) e.preventDefault();
    const textToSend = presetText || currentMessage;
    if (!textToSend.trim()) return;

    // Add user message
    const newHistory = [...chatHistory, { role: 'user', text: textToSend }];
    setChatHistory(newHistory);
    setCurrentMessage('');
    setIsAiTyping(true);

    // Mock AI Response after delay
    setTimeout(() => {
      let aiResponse = "I can analyze your medical records or answer general health questions. How can I assist you further?";
      
      const userText = textToSend.toLowerCase();
      
      // Personal Medical Record Queries
      if (userText.includes("blood") || userText.includes("pressure") || userText.includes("lab")) {
        aiResponse = "Looking at your recent Lab Results, your blood pressure was 120/80 which is perfectly normal. Your cholesterol is also within the healthy range.";
      } else if (userText.includes("allergy") || userText.includes("allergies")) {
        aiResponse = "I see you have a documented allergy to Penicillin. I will make sure any new prescriptions take this into account.";
      } else if (userText.includes("appointment")) {
        aiResponse = "You have an upcoming Cardiology Checkup with Dr. Sarah Jenkins on Oct 18 at 10:30 AM.";
      } 
      // General Health Queries
      else if (userText.includes("diet") || userText.includes("food") || userText.includes("eat")) {
        aiResponse = "A heart-healthy diet typically includes plenty of fruits, vegetables, whole grains, and lean proteins while minimizing saturated fats and sodium. Given your recent labs, you're on the right track!";
      } else if (userText.includes("exercise") || userText.includes("workout")) {
        aiResponse = "The American Heart Association recommends at least 150 minutes of moderate-intensity aerobic activity per week. Walking, swimming, and cycling are excellent options.";
      } else if (userText.includes("headache") || userText.includes("pain")) {
        aiResponse = "For mild headaches, resting in a quiet, dark room and staying hydrated can help. If the pain is severe or persistent, please consult Dr. Jenkins during your next appointment.";
      } else if (userText.includes("sleep")) {
        aiResponse = "Adults generally need 7-9 hours of sleep per night. Maintaining a consistent sleep schedule and avoiding screens before bed can improve sleep quality.";
      } else if (userText.includes("hello") || userText.includes("hi") || userText.includes("hey")) {
        aiResponse = "Hello! I am your MediBot. I can securely check your medical history or answer general health questions. What's on your mind?";
      }

      setChatHistory([...newHistory, { role: 'ai', text: aiResponse }]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleSeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/records/seed', {}, config);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateQR = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        allowedFields: selectedRecords.length > 0 ? selectedRecords : ['All'],
        expiresInMinutes: 10
      };
      const res = await axios.post('/api/consent/generate', payload, config);
      setQrToken(res.data.token);
    } catch (error) {
      console.error(error);
      alert('Failed to generate token');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedRecords(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getRecordStyle = (type) => {
    switch (type) {
      case 'Prescription': return { border: 'border-l-indigo-500', iconBg: 'bg-indigo-500/20', iconColor: 'text-indigo-400', label: 'Medication', badge: 'bg-indigo-500/10 text-indigo-300' };
      case 'Allergy': return { border: 'border-l-red-500', iconBg: 'bg-red-500/20', iconColor: 'text-red-400', label: 'Allergy', badge: 'bg-red-500/10 text-red-300' };
      case 'Report': return { border: 'border-l-emerald-500', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400', label: 'Lab Test', badge: 'bg-emerald-500/10 text-emerald-300' };
      default: return { border: 'border-l-gray-500', iconBg: 'bg-gray-500/20', iconColor: 'text-gray-400', label: 'Record', badge: 'bg-gray-500/10 text-gray-300' };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Report': return <Activity size={24} />;
      case 'Prescription': return <Pill size={24} />;
      case 'Allergy': return <ShieldAlert size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const StatCounter = ({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const duration = 1000;
      if (value === 0) return setCount(0);
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [value]);
    return <span>{count}</span>;
  };

  const filteredRecords = records.filter(record => {
    if (activeTab === 'Dashboard' || activeTab === 'Medical Records') return true;
    if (activeTab === 'Medications') return record.resourceType === 'Prescription';
    if (activeTab === 'Lab Results') return record.resourceType === 'Report';
    if (activeTab === 'Allergies') return record.resourceType === 'Allergy';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex h-screen bg-[#0D1117] text-[#F9FAFB] font-inter overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-[260px] glass-panel border-r border-white/10 hidden md:flex flex-col justify-between p-6 z-20">
        <div>
          <div className="flex items-center gap-3 mb-10 text-primary-gradient font-jakarta font-bold text-2xl">
            <HeartPulse size={32} className="text-[#4F46E5]" />
            Medipass
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'Dashboard', icon: LayoutDashboard },
              { id: 'Medical Records', icon: FolderOpen },
              { id: 'Medications', icon: Pill },
              { id: 'Lab Results', icon: Activity },
              { id: 'Allergies', icon: ShieldAlert },
              { id: 'Smart Consent', icon: Share2 },
              { id: 'AI Assistant', icon: Bot },
              { id: 'Settings', icon: Settings }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'Smart Consent') {
                      document.getElementById('smart-consent-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${isActive ? 'bg-primary-gradient shadow-[0_0_15px_rgba(79,70,229,0.3)] font-medium text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                >
                  {!isActive && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>}
                  <tab.icon size={20} /> {tab.id}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 relative">
                {user.name?.charAt(0) || 'U'}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0D1117] rounded-full"></span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate w-24">{user.name}</p>
                <p className="text-xs text-emerald-400 font-medium">Online</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
        
        {/* TOP HEADER BAR */}
        <header className="flex justify-between items-end px-8 py-8 border-b border-white/5 sticky top-0 bg-[#0D1117]/80 backdrop-blur-xl z-30">
          <div>
            <h1 className="text-3xl font-jakarta font-extrabold tracking-tight mb-1">{getGreeting()}, {user.name?.split(' ')[0]} <span className="inline-block origin-bottom-right animate-bounce">👋</span></h1>
            <p className="text-gray-400 text-sm">Patient Dashboard &middot; Last updated: Today, 1:29 PM</p>
          </div>
          <div className="flex items-center gap-4 hidden md:flex">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="text" placeholder="Search records..." className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-64" />
            </div>
            
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                <Bell size={20} className="text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0D1117] pulse-red"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 border border-white/10"
                  >
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">You have no new notifications.</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif._id} 
                            onClick={() => !notif.isRead && markNotificationRead(notif._id)}
                            className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${notif.isRead ? 'opacity-60 hover:bg-white/5' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${notif.isRead ? 'text-gray-300 font-medium' : 'text-white font-bold'}`}>{notif.title}</h4>
                              {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></span>}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-500 mt-2">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 grid xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            {/* 3. STATS ROW */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4"><FolderOpen size={20} /></div>
                <h4 className="text-3xl font-jakarta font-bold mb-1"><StatCounter value={records.length} /></h4>
                <p className="text-gray-400 text-sm font-medium">Total Records</p>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4"><Pill size={20} /></div>
                <h4 className="text-3xl font-jakarta font-bold mb-1"><StatCounter value={records.filter(r=>r.resourceType==='Prescription').length} /></h4>
                <p className="text-gray-400 text-sm font-medium">Active Meds</p>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4"><ShieldAlert size={20} /></div>
                <h4 className="text-3xl font-jakarta font-bold mb-1"><StatCounter value={records.filter(r=>r.resourceType==='Allergy').length} /></h4>
                <p className="text-gray-400 text-sm font-medium">Allergies</p>
              </motion.div>
              {/* Added Health Trend Sparkline Widget */}
              <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center"><Activity size={20} /></div>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full font-bold">+2%</span>
                </div>
                <h4 className="text-xl font-jakarta font-bold mb-1">Health Score</h4>
                
                {/* SVG Sparkline */}
                <svg className="absolute bottom-0 left-0 w-full h-12 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,30 L10,25 L25,28 L40,15 L55,20 L75,5 L100,10" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0,30 L10,25 L25,28 L40,15 L55,20 L75,5 L100,10 L100,30 L0,30 Z" fill="rgba(6,182,212,0.1)" />
                </svg>
              </motion.div>
            </motion.div>

            {/* UPCOMING APPOINTMENTS WIDGET (Only on Dashboard) */}
            {activeTab === 'Dashboard' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-cyan-500">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 rounded-xl"><Calendar className="text-cyan-400" size={24}/></div>
                    <div>
                      <h4 className="font-bold text-white">Dr. Sarah Jenkins</h4>
                      <p className="text-xs text-gray-400">Cardiology Checkup</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-400">Oct 18</p>
                    <p className="text-xs text-gray-400">10:30 AM</p>
                  </div>
                </div>
                
                {/* RECENT ACCESS LOGS WIDGET */}
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-violet-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><ShieldCheck size={80}/></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-white/5 p-3 rounded-xl"><UserCheck className="text-violet-400" size={24}/></div>
                    <div>
                      <h4 className="font-bold text-white">Recent Record Access</h4>
                      <p className="text-xs text-gray-400">{accessLogs.length > 0 ? `By ${accessLogs[0].accessedBy?.name}` : 'No recent access'}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    {accessLogs.length > 0 ? (
                      <>
                        <p className="font-bold text-violet-400">{new Date(accessLogs[0].accessedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">Authorized</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">Secure</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. MAIN LIST OR SETTINGS OR AI ASSISTANT */}
            {activeTab === 'AI Assistant' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col h-[600px] glass-panel rounded-3xl border border-white/10 overflow-hidden relative">
                <div className="bg-white/5 border-b border-white/10 p-4 flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">MediBot</h3>
                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
                  <AnimatePresence>
                    {chatHistory.map((msg, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-white/10 border border-white/5 text-gray-200 rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                    {isAiTyping && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/10 border border-white/5 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-black/40 border-t border-white/10 relative z-10 flex flex-col gap-3">
                  {/* Suggestion Chips */}
                  {chatHistory.length === 1 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {["What is my blood pressure?", "Do I have any allergies?", "When is my next appointment?", "What is a healthy heart rate?"].map((suggestion, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleSendMessage(null, suggestion)}
                          className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="relative">
                    <input 
                      type="text" 
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask about your blood pressure, allergies, or upcoming appointments..." 
                      className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500 transition-all"
                    />
                    <button type="submit" disabled={!currentMessage.trim() || isAiTyping} className="absolute right-2 top-2 p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : activeTab === 'Settings' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
                <div className="glass-panel p-8 rounded-3xl border border-white/10">
                  <h3 className="text-2xl font-jakarta font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-indigo-400" /> Account Settings</h3>
                  
                  <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-xl">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">Profile Details</h4>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input type="text" value={settingsForm.name} onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white transition-all" />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input type="text" value={settingsForm.phone} onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})} placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white transition-all" />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">Security</h4>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input type="password" value={settingsForm.password} onChange={(e) => setSettingsForm({...settingsForm, password: e.target.value})} placeholder="New Password (leave blank to keep current)" className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white transition-all" />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button type="submit" disabled={updatingSettings} className="bg-primary-gradient px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all text-white">
                        {updatingSettings ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                <div className="glass-panel p-8 rounded-3xl border border-red-500/20 bg-red-500/5">
                  <h4 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h4>
                  <p className="text-sm text-gray-400 mb-6">Logging out will securely clear your active session from this device.</p>
                  <button onClick={logout} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                    <LogOut size={18} /> Secure Log Out
                  </button>
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="flex justify-between items-end mb-6 mt-8">
                  <h3 className="text-xl font-jakarta font-bold">{activeTab === 'Dashboard' ? 'Medical History' : activeTab}</h3>
                  {filteredRecords.length === 0 && !loading && activeTab !== 'Dashboard' ? null : (
                    records.length === 0 && !loading && (
                      <button onClick={handleSeed} className="text-sm bg-white/10 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/10">
                        Generate Demo Records
                      </button>
                    )
                  )}
                </div>

              {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
              ) : filteredRecords.length === 0 ? (
                <div className="glass-panel p-16 text-center text-gray-400 font-medium rounded-3xl border-dashed border-2 border-white/10">
                  <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                  No {activeTab.toLowerCase()} found.
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {filteredRecords.map(record => {
                    const style = getRecordStyle(record.resourceType);
                    const isSelected = selectedRecords.includes(record._id);
                    
                    return (
                      <motion.div 
                        key={record._id} 
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        onClick={() => toggleSelection(record._id)}
                        className={`glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start gap-6 cursor-pointer transition-all border-l-4 ${style.border} ${isSelected ? 'bg-white/10 border-white/30 ring-1 ring-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]' : ''}`}
                      >
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${style.iconBg} ${style.iconColor}`}>
                                {getIcon(record.resourceType)}
                              </div>
                              <div>
                                <h4 className="font-jakarta font-bold text-lg">{record.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                  <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">DR</div> {record.provider}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${style.badge}`}>
                                {record.resourceType === 'Allergy' && <span className="w-2 h-2 rounded-full bg-red-500 pulse-red"></span>}
                                {style.label}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> {new Date(record.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="bg-black/30 p-4 rounded-xl border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            {Object.entries(record.details).map(([k, v]) => (
                              <div key={k}>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">{k}</div>
                                <div className={`text-sm ${record.resourceType === 'Report' ? 'font-mono-code text-emerald-300' : 'text-gray-200'}`}>
                                  {v}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2 md:mt-0 md:self-center">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500 bg-transparent'}`}>
                            {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><ShieldCheck size={14} className="text-white" /></motion.div>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
            )}
          </div>

          {/* 5. SMART CONSENT PANEL */}
          <div className="xl:col-span-1" id="smart-consent-panel">
            <div className="sticky top-28 space-y-6">
              <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full filter blur-[80px] translate-y-1/2 -translate-x-1/3"></div>
                
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-2xl font-jakarta font-extrabold mb-2">Smart Consent</h3>
                  <p className="text-sm text-gray-400 mb-8 px-4">
                    Generate a secure QR token to instantly share {selectedRecords.length > 0 ? <strong className="text-white">{selectedRecords.length} selected</strong> : 'all'} records with medical staff.
                  </p>
                  
                  {!qrToken ? (
                    <div className="space-y-4">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateQR} 
                        disabled={generating || loading} 
                        className="w-full bg-primary-gradient py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_25px_rgba(79,70,229,0.5)] transition-all overflow-hidden relative group"
                      >
                        <span className="absolute top-0 left-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                        {generating ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />} Generate Secure Token
                      </motion.button>
                      <button 
                        onClick={handleRevokeAll}
                        disabled={revoking}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-3 rounded-xl font-semibold text-red-400 transition-all flex justify-center items-center gap-2"
                      >
                        {revoking ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />} Revoke All Access
                      </button>
                    </div>
                  ) : (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                      <div className="bg-white p-6 inline-block rounded-3xl shadow-xl mx-auto relative">
                        <QRCodeSVG value={qrToken} size={180} />
                        <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-3xl pointer-events-none animate-pulse"></div>
                      </div>
                      
                      <div className="bg-black/40 border border-white/10 p-4 relative group rounded-2xl mx-auto w-full max-w-[250px]">
                        <p className="font-mono-code text-sm break-all text-gray-300 select-all">{qrToken}</p>
                        <button onClick={() => navigator.clipboard.writeText(qrToken)} className="absolute right-2 top-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md font-medium">Copy</button>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 py-2 rounded-xl font-medium border border-emerald-500/20">
                        <ShieldCheck size={16} /> Token active (Expires in 10:00)
                      </div>
                      
                      <button onClick={() => setQrToken(null)} className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4 mt-2">Generate New Token</button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Required style for shimmer effect */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;
