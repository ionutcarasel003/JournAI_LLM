import React, { useState } from 'react';
import { 
  User, Book, MessageCircle, Home, LogOut, 
  Github, Globe, Compass, Sparkles, LayoutGrid, Bot
} from 'lucide-react';

import HomePage from './HomePage';
import DiscoverPage from './DiscoverPage';
import JournalPage from './JournalPage';
import ProfilePage from './ProfilePage';
import Footer from '../components/Footer';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home'); 

  const renderChat = () => (
    <div className="flex flex-col h-[70vh] justify-center items-center text-center animate-fade-in p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-purple-500/10 border border-white/60 relative overflow-hidden max-w-md w-full backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-calm-primary border border-gray-100 shadow-inner">
                <Bot className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Companion</h3>
            <p className="text-gray-500 leading-relaxed mb-6">
                Antrenăm modelul nostru de empatie pentru a-ți oferi conversații profunde și suport emoțional real.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                În dezvoltare
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-calm-primary selection:text-white">
      
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] z-50 border-b border-gray-100/50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('home')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Sparkles size={20} fill="currentColor" className="text-white/90" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-gray-800 group-hover:text-indigo-600 transition-colors">
                    Reflect
                </span>
            </div>

            <nav className="hidden md:flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
                <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Acasă" icon={LayoutGrid} />
                <NavButton active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} label="Explorează" icon={Compass} />
                <NavButton active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} label="Jurnal" icon={Book} />
                <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} label="AI Chat" icon={MessageCircle} />
                <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Profil" icon={User} />
            </nav>

            <button 
                onClick={onLogout} 
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-500 transition-all px-4 py-2 rounded-xl hover:bg-red-50 group"
            >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Ieșire</span>
            </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent opacity-50 -z-10 pointer-events-none"></div>

        <div className="animate-fade-in-up">
            {activeTab === 'home' && <HomePage user={user} />}
            {activeTab === 'discover' && <DiscoverPage />}
            {activeTab === 'journal' && <JournalPage user={user} />}
            {activeTab === 'profile' && <ProfilePage user={user} onLogout={onLogout} />}
            {activeTab === 'chat' && renderChat()}
        </div>
      </main>
<Footer />

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-full px-6 py-3 flex gap-6 z-50">
         <MobileNavIcon active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={LayoutGrid} />
         <MobileNavIcon active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} icon={Compass} />
         <MobileNavIcon active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} icon={Book} />
         <MobileNavIcon active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={MessageCircle} />
         <MobileNavIcon active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} />
      </div>

    </div>
  );
};


const NavButton = ({ active, onClick, label, icon: Icon }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm border
        ${active 
            ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20' 
            : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white hover:border-gray-200 hover:shadow-sm'}`}
    >
        <Icon size={18} className={active ? "text-white" : ""} />
        {label}
    </button>
);

const MobileNavIcon = ({ active, onClick, icon: Icon }) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-full transition-all duration-300 relative group
            ${active ? 'text-indigo-600 -translate-y-2' : 'text-gray-400 hover:text-gray-600'}`}
    >
        <div className={`absolute inset-0 bg-indigo-50 rounded-full scale-0 transition-transform duration-300 ${active ? 'scale-100' : ''}`}></div>
        <Icon size={24} className="relative z-10" />
        {active && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>}
    </button>
);

const SocialButton = ({ icon: Icon }) => (
    <button className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <Icon size={18} />
    </button>
);

export default Dashboard;