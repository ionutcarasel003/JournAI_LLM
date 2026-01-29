import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  User, Mail, Calendar, TrendingUp, Award, Settings, 
  Phone, Shield, Edit2, Check, LogOut, Zap, Trophy, Target, Camera 
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const ProfilePage = ({ user, onLogout }) => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.email.split('@')[0]);
  
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null); 

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userRes = await fetch(`http://localhost:3000/api/users/${user.id}`);
        const userData = await userRes.json();
        if (userData.avatar) {
            setAvatar(userData.avatar);
        }

        const moodRes = await fetch(`http://localhost:3000/api/moods/${user.id}`);
        const moodData = await moodRes.json();
        setMoodHistory(moodData);
      } catch (error) {
        console.error("Eroare:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user.id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64Image = reader.result;
        setAvatar(base64Image); 

        try {
            await fetch(`http://localhost:3000/api/users/${user.id}/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: base64Image })
            });
        } catch (error) {
            console.error("Eroare upload:", error);
            alert("Nu s-a putut salva poza.");
        }
    };
    reader.readAsDataURL(file);
  };

  const gameStats = useMemo(() => {
    const totalEntries = moodHistory.length;
    const totalScore = moodHistory.reduce((acc, curr) => acc + curr.score, 0);
    const avgMood = totalEntries > 0 ? Math.round(totalScore / totalEntries) : 0;
    
    let currentXP = totalEntries * 10; 
    
    const badges = [
      { id: 1, label: 'Primul Pas', icon: '🌱', threshold: 1, rewardXP: 50, desc: 'Prima intrare în jurnal' },
      { id: 2, label: 'Consecvent', icon: '🔥', threshold: 5, rewardXP: 100, desc: 'Ai scris de 5 ori' },
      { id: 3, label: 'Jurnalist', icon: '✍️', threshold: 10, rewardXP: 200, desc: '10 intrări în jurnal' },
      { id: 4, label: 'Zen Master', icon: '🧘', threshold: 20, rewardXP: 500, desc: '20 de momente de mindfulness' },
      { id: 5, label: 'Veteran', icon: '👑', threshold: 50, rewardXP: 1000, desc: 'Un adevărat maestru al emoțiilor' }
    ];

    badges.forEach(badge => {
      if (totalEntries >= badge.threshold) currentXP += badge.rewardXP;
    });

    const level = Math.floor(currentXP / 150) + 1;
    const progressToNextLevel = Math.min(((currentXP % 150) / 150) * 100, 100);
    const nextBadge = badges.find(b => totalEntries < b.threshold) || { label: 'Ai terminat jocul!', threshold: totalEntries };
    const entriesNeeded = nextBadge.threshold - totalEntries;

    return { totalEntries, avgMood, badges, currentXP, level, progressToNextLevel, entriesNeeded };
  }, [moodHistory]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
        <div className="h-24 bg-gradient-to-r from-calm-primary to-cyan-400"></div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 gap-4">
             
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <div className="w-28 h-28 bg-white p-1 rounded-full shadow-md overflow-hidden relative">
                    {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-4xl font-bold text-calm-primary">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="text-white w-8 h-8" />
                    </div>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                />

                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow border-2 border-white flex items-center gap-1 z-10">
                    <Zap size={12} fill="currentColor"/> Lvl {gameStats.level}
                </div>
             </div>

             <div className="flex-1 text-center md:text-left mb-2">
                {isEditing ? (
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="text-xl font-bold border-b border-calm-primary outline-none" autoFocus />
                        <button onClick={() => setIsEditing(false)}><Check size={18} className="text-green-500"/></button>
                    </div>
                ) : (
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
                        {displayName} <button onClick={() => setIsEditing(true)}><Edit2 size={14} className="text-gray-400 hover:text-calm-primary"/></button>
                    </h2>
                )}
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-xs text-calm-primary mt-1 flex items-center justify-center md:justify-start gap-1">
                    <Camera size={10} /> Apasă pe poză pentru a o schimba
                </p>
             </div>

             <div className="text-center bg-gray-50 px-4 py-2 rounded-xl">
                 <p className="text-xs text-gray-400 font-bold uppercase">Total Experiență</p>
                 <p className="text-xl font-bold text-calm-primary">{gameStats.currentXP} XP</p>
             </div>
          </div>

          <div className="mt-6">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                  <span>Nivel {gameStats.level}</span>
                  <span>{Math.floor(gameStats.progressToNextLevel)}%</span>
                  <span>Nivel {gameStats.level + 1}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-calm-primary to-green-400 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${gameStats.progressToNextLevel}%` }}
                  ></div>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Calendar} value={gameStats.totalEntries} label="Intrări Totale" color="blue" />
        <StatCard icon={TrendingUp} value={`${gameStats.avgMood}%`} label="Stare Medie" color="green" />
        <StatCard icon={Trophy} value={gameStats.badges.filter(b => gameStats.totalEntries >= b.threshold).length} label="Realizări" color="yellow" />
        <StatCard icon={Target} value={gameStats.entriesNeeded > 0 ? gameStats.entriesNeeded : 0} label="Până la urm. insignă" color="red" />
      </div>

      <div>
        <h3 className="font-bold text-gray-700 mb-4 px-2 flex items-center gap-2">
            <Award className="text-yellow-500" /> Colecția ta de Insigne
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameStats.badges.map(badge => {
            const isUnlocked = gameStats.totalEntries >= badge.threshold;
            return (
                <div key={badge.id} className={`relative p-4 rounded-2xl border-2 transition-all ${isUnlocked ? 'bg-white border-yellow-400 shadow-md' : 'bg-gray-50 border-gray-100 opacity-70 grayscale'}`}>
                    {isUnlocked && <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-bl-xl">+{badge.rewardXP} XP</div>}
                    <div className="flex items-center gap-4">
                        <div className={`text-4xl p-2 rounded-full ${isUnlocked ? 'bg-yellow-50' : 'bg-gray-200'}`}>{badge.icon}</div>
                        <div>
                            <h4 className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>{badge.label}</h4>
                            <p className="text-xs text-gray-400 mb-1">{badge.desc}</p>
                        </div>
                    </div>
                </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <Button variant="ghost" onClick={onLogout} className="w-full text-red-400 hover:text-red-600 hover:bg-red-50">
            <LogOut size={16} className="mr-2"/> Deconectare Cont
        </Button>
      </div>

    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => {
    const colors = {
        blue: "text-blue-500 bg-blue-50",
        green: "text-green-500 bg-green-50",
        yellow: "text-yellow-600 bg-yellow-50",
        red: "text-red-500 bg-red-50"
    };
    return (
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className={`mb-2 p-2 rounded-full ${colors[color]}`}><Icon size={18} /></div>
            <span className="text-lg font-bold text-gray-800">{value}</span>
            <span className="text-[10px] text-gray-400 uppercase font-medium">{label}</span>
        </div>
    );
}

export default ProfilePage;