import React, { useState } from 'react';
import {
  User, Book, MessageCircle, Home, LogOut,
  Github, Globe, Compass, Sparkles, LayoutGrid, Bot
} from 'lucide-react';

import HomePage from './HomePage';
import DiscoverPage from './DiscoverPage';
import JournalPage from './JournalPage';
import ProfilePage from './ProfilePage';
import ChatPage from './ChatPage';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  const handleNavigateToChat = (journalText) => {
    setChatInitialMessage(journalText);
    setActiveTab('chat');
  };

  const handleTabChange = (tab) => {
    if (tab !== 'chat') {
      setChatInitialMessage('');
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-calm-primary selection:text-white">

      <header className="sticky top-0 bg-white/80 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] z-50 border-b border-gray-100/50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleTabChange('home')}>
                <img
                    src={logo}
                    alt="Reflect Logo"
                    className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                />
                <span className="font-extrabold text-2xl tracking-tight text-gray-800 group-hover:text-indigo-600 transition-colors">
                    Reflect.
                </span>
            </div>

            <nav className="hidden md:flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
                <NavButton active={activeTab === 'home'} onClick={() => handleTabChange('home')} label="Home" icon={LayoutGrid} />
                <NavButton active={activeTab === 'discover'} onClick={() => handleTabChange('discover')} label="Discover" icon={Compass} />
                <NavButton active={activeTab === 'journal'} onClick={() => handleTabChange('journal')} label="Journal" icon={Book} />
                <NavButton active={activeTab === 'chat'} onClick={() => handleTabChange('chat')} label="AI Chat" icon={MessageCircle} />
                <NavButton active={activeTab === 'profile'} onClick={() => handleTabChange('profile')} label="Profile" icon={User} />
            </nav>

            <button
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-500 transition-all px-4 py-2 rounded-xl hover:bg-red-50 group"
            >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Logout</span>
            </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent opacity-50 -z-10 pointer-events-none"></div>

        <div className="animate-fade-in-up">
            {activeTab === 'home' && <HomePage user={user} />}
            {activeTab === 'discover' && <DiscoverPage />}
            {activeTab === 'journal' && (
                <JournalPage user={user} onNavigateToChat={handleNavigateToChat} />
            )}
            {activeTab === 'profile' && <ProfilePage user={user} onLogout={onLogout} />}
            {activeTab === 'chat' && (
                <ChatPage initialMessage={chatInitialMessage} user={user} />
            )}
        </div>
      </main>
      <Footer />

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-full px-6 py-3 flex gap-6 z-50">
         <MobileNavIcon active={activeTab === 'home'} onClick={() => handleTabChange('home')} icon={LayoutGrid} />
         <MobileNavIcon active={activeTab === 'discover'} onClick={() => handleTabChange('discover')} icon={Compass} />
         <MobileNavIcon active={activeTab === 'journal'} onClick={() => handleTabChange('journal')} icon={Book} />
         <MobileNavIcon active={activeTab === 'chat'} onClick={() => handleTabChange('chat')} icon={MessageCircle} />
         <MobileNavIcon active={activeTab === 'profile'} onClick={() => handleTabChange('profile')} icon={User} />
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
