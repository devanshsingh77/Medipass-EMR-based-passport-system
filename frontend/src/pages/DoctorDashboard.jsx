import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, FileText, Activity, Pill, ShieldAlert, LogOut, Loader2 } from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('token') || user.role !== 'Doctor') {
      navigate('/login');
    }
  }, [navigate, user]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    
    setLoading(true);
    setError('');
    setPatientData(null);

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('/api/consent/scan', { token: tokenInput }, config);
      setPatientData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Report': return <Activity className="text-blue-500" />;
      case 'Prescription': return <Pill className="text-purple-500" />;
      case 'Allergy': return <ShieldAlert className="text-red-500" />;
      default: return <FileText className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center glass-panel p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-jakarta font-extrabold text-[#F9FAFB]">Dr. {user.name}</h2>
          <p className="text-gray-500">Doctor Portal</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors border border-white/10 bg-white/5 px-4 py-2 rounded-xl font-semibold">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="glass-panel p-10 rounded-3xl">
        <h3 className="text-2xl font-jakarta font-extrabold mb-6 text-center text-[#F9FAFB] tracking-tight">Access Patient Records</h3>
        <form onSubmit={handleScan} className="max-w-2xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Paste Consent Token (or scan QR result)" 
              value={tokenInput} 
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500 transition-all"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-primary-gradient px-8 rounded-xl font-bold flex items-center gap-2 text-white">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Fetch Data'}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4 bg-red-50 py-2 rounded-lg">{error}</p>}
      </div>

      {patientData && (
        <div className="space-y-6 animate-fade-in mt-8">
          <div className="glass-panel p-6 flex items-center gap-6 rounded-3xl">
            <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-extrabold shadow-sm">
              {patientData.patient.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-jakarta font-bold text-white">{patientData.patient.name}</h3>
              <p className="text-gray-400">{patientData.patient.email} • {patientData.patient.phone}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                <ShieldAlert size={12} /> Secure Connection Active
              </div>
            </div>
          </div>

          <h4 className="text-xl font-jakarta font-bold text-white ml-2 tracking-tight">Shared Records ({patientData.records.length})</h4>
          
          {patientData.records.length === 0 ? (
            <div className="glass-panel p-12 text-center text-gray-400 font-medium rounded-3xl">No specific records shared in this token.</div>
          ) : (
            <div className="grid gap-4">
              {patientData.records.map(record => (
                <div key={record._id} className="glass-panel-hover glass-panel p-6 flex items-start gap-4 rounded-3xl">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-white">
                    {getIcon(record.resourceType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-jakarta font-bold text-lg text-white">{record.title}</h4>
                      <span className="text-sm text-gray-400">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 font-medium">{record.provider}</p>
                    <div className="grid grid-cols-2 gap-4 bg-black/30 border border-white/5 p-5 rounded-xl mt-3">
                      {Object.entries(record.details).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1 font-semibold">{k}</span>
                          <span className="font-medium text-gray-200">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
