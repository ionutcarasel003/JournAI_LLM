import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Loader2, ShieldCheck, Brain, LineChart } from 'lucide-react';
import Button from '../components/Button';

const LandingPage = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
    setEmail('');
    setPassword('');
  }, [isLoginMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    
    try {
      await new Promise(r => setTimeout(r, 800)); 
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare');

      if (!isLoginMode) {
        alert("🎉 Cont creat cu succes! Te rugăm să te autentifici.");
        setIsLoginMode(true);
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center overflow-hidden bg-gray-50 font-sans lg:p-10">
      
      <div className="absolute inset-0 w-full h-full z-0 bg-[#f8fafc]">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-200/60 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob"></div>
        <div className="absolute top-[10%] right-[-20%] w-[600px] h-[600px] bg-blue-200/60 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[30%] w-[700px] h-[700px] bg-pink-200/60 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.03] z-10 pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.1); }
          66% { transform: translate(-40px, 50px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite alternate linear; }
        .animation-delay-2000 { animation-delay: 5s; }
        .animation-delay-4000 { animation-delay: 10s; }
        .bg-noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); }
      `}</style>

      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20 px-6">
        
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left pt-10 lg:pt-0">
            <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-calm-primary font-bold text-sm mb-6 animate-fade-in">
                    <Sparkles size={16} />
                    <span>Noua ta rutină de wellness mental</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
                    Descoperă <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-calm-primary via-purple-500 to-pink-500">
                        Echilibrul Interior.
                    </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Mai mult decât un jurnal. Asistentul tău personal care te ajută să îți înțelegi emoțiile, să găsești resurse adaptate și să crești în fiecare zi.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <FeatureBox icon={Brain} title="Inteligență Emoțională" desc="Înțelege-ți tiparele." />
                <FeatureBox icon={LineChart} title="Progres Vizual" desc="Vezi evoluția clar." />
                <FeatureBox icon={ShieldCheck} title="Spațiu Sigur 100%" desc="Datele tale sunt private." />
            </div>
        </div>

        <div className="w-full max-w-md lg:w-auto lg:flex-1 flex justify-center lg:justify-end">
            <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/60 relative overflow-hidden w-full max-w-[450px]">
                
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {isLoginMode ? 'Bine ai revenit!' : 'Creează-ți contul'}
                    </h2>
                    <p className="text-gray-500">
                        {isLoginMode ? 'Continuă călătoria ta spre mindfulness.' : 'Durează mai puțin de un minut.'}
                    </p>
                </div>

                <div className="flex p-1 bg-gray-100/80 rounded-2xl mb-8 relative shadow-inner">
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isLoginMode ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                    ></div>
                    <button 
                        onClick={() => setIsLoginMode(true)}
                        className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors duration-300 ${isLoginMode ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Autentificare
                    </button>
                    <button 
                        onClick={() => setIsLoginMode(false)}
                        className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors duration-300 ${!isLoginMode ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Înregistrare
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-100/50 text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <InputGroup icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Adresa de email" />
                    
                    <div className="group relative transition-all duration-300 focus-within:scale-[1.02]">
                        <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-calm-primary transition-colors" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Parola" 
                            className="w-full bg-white/60 pl-12 pr-12 py-4 rounded-2xl border border-gray-200/80 outline-none focus:border-calm-primary focus:ring-4 focus:ring-calm-primary/10 transition-all placeholder:text-gray-400 text-gray-700 font-medium shadow-sm"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md hover:bg-gray-100/50 transition"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {isLoginMode && (
                        <div className="flex justify-end">
                            <a href="#" className="text-sm font-semibold text-calm-primary hover:text-calm-accent transition-colors">
                                Ai uitat parola?
                            </a>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button 
                            type="submit"
                            disabled={loading}
                            variant="primary" 
                            className={`w-full py-4 text-lg font-bold shadow-xl shadow-calm-primary/30 transition-all active:scale-[0.98] rounded-2xl ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:translate-y-[-3px] hover:shadow-2xl hover:shadow-calm-primary/40'}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin w-6 h-6" /> 
                                    Se procesează...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    {isLoginMode ? 'Intră în aplicație' : 'Începe gratuit'}
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
                
                <div className="mt-8 text-center bg-gray-50/80 mx-auto py-3 px-4 rounded-full w-fit shadow-sm border border-white/50 backdrop-blur-md">
                     <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                        <ShieldCheck size={14} className="text-green-500"/> Datele tale sunt criptate și sigure.
                     </p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon: Icon, type, value, onChange, placeholder }) => (
    <div className="group relative transition-all duration-300 focus-within:scale-[1.02]">
        <Icon className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-calm-primary transition-colors" />
        <input 
            type={type} 
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} 
            className="w-full bg-white/60 pl-12 pr-4 py-4 rounded-2xl border border-gray-200/80 outline-none focus:border-calm-primary focus:ring-4 focus:ring-calm-primary/10 transition-all placeholder:text-gray-400 text-gray-700 font-medium shadow-sm"
        />
    </div>
);

const FeatureBox = ({ icon: Icon, title, desc }) => (
    <div className="bg-white/60 backdrop-blur-lg p-4 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-center lg:text-left flex flex-col items-center lg:items-start">
        <div className="bg-calm-bg p-3 rounded-xl text-calm-primary mb-3 w-fit">
            <Icon size={24} />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-snug">{desc}</p>
    </div>
)

export default LandingPage;