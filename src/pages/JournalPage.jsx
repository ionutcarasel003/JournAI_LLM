import React, { useState, useEffect } from 'react';
import { 
  Smile, Meh, Frown, Heart, Calendar, Tag, 
  Clock, Sparkles, BookOpen, Mic, 
  BarChart2, Search, Zap, ChevronRight, Hash, Trash2, X, Maximize2
} from 'lucide-react';
import Button from '../components/Button';

// Configurația stărilor
const MOODS = [
  { score: 100, label: 'Excelent', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', gradient: 'from-yellow-400 to-orange-500', advice: "Ești on fire! 🔥 Folosește energia asta pentru a crea ceva minunat azi." },
  { score: 75, label: 'Bine', icon: Smile, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', gradient: 'from-green-400 to-emerald-500', advice: "O zi bună e o fundație solidă. Menține ritmul!" },
  { score: 50, label: 'Neutru', icon: Meh, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-400 to-indigo-500', advice: "E ok să fie liniște. Respiră și observă ziua fără să judeci." },
  { score: 25, label: 'Rău', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', gradient: 'from-orange-400 to-red-500', advice: "Norii trec. Fii blând cu tine însuți în momentele astea." },
  { score: 0, label: 'Groaznic', icon: Frown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-red-500 to-rose-600', advice: "Ești puternic pentru că ești încă aici. Cere ajutor dacă simți nevoia. ❤️" }
];

const TAGS = ["Familie", "Muncă", "Somn", "Sport", "Relație", "Sănătate", "Vreme", "Școală", "Creativitate", "Finanțe"];

const JournalPage = ({ user }) => {
  // State-uri principale
  const [selectedMood, setSelectedMood] = useState(50);
  const [activeTab, setActiveTab] = useState('journal');
  const [note, setNote] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  // State-uri date și UI
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  // State pentru MODAL (Fereastra de citire)
  const [viewEntry, setViewEntry] = useState(null); // Dacă e null, fereastra e închisă

  useEffect(() => {
    const moodObj = MOODS.find(m => m.score === selectedMood);
    if (moodObj) setAiInsight(moodObj.advice);
  }, [selectedMood]);

  useEffect(() => {
    if(user?.id) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/moods/${user.id}`);
      const data = await response.json();
      setRecentEntries(data);
    } catch (error) {
      console.error("Eroare istoric:", error);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setNote(prev => prev + " (Text dictat automat...) ");
      }, 2000);
    }
  };

  const handleSave = async () => {
    if (!note && !gratitude) return;

    setLoading(true);
    
    const fullNote = `
[TAGS]: ${selectedTags.join(', ')}
[RECUNOȘTINȚĂ]: ${gratitude}
[JURNAL]: ${note}
    `.trim();

    try {
      const response = await fetch('http://localhost:3000/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          score: selectedMood,
          note: fullNote
        }),
      });

      if (response.ok) {
        fetchHistory(); // Reîncărcăm lista de la server pentru a avea ID-ul corect
        setNote('');
        setGratitude('');
        setSelectedTags([]);
        alert("✨ Jurnal salvat cu succes!");
      }
    } catch (error) {
      console.error("Eroare:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCȚIE NOUĂ: Ștergere ---
  const handleDelete = async (e, entryId) => {
    e.stopPropagation(); // Oprim click-ul să deschidă modalul
    
    if (!window.confirm("Ești sigur că vrei să ștergi această intrare?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/moods/${entryId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setRecentEntries(prev => prev.filter(item => item.id !== entryId));
        }
    } catch (error) {
        console.error("Eroare la ștergere:", error);
    }
  };

  // Helpers
  const currentMoodObj = MOODS.find(m => m.score === selectedMood) || MOODS[2];
  
  const filteredEntries = recentEntries.filter(entry => 
    (entry.note || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funcție de curățare text pentru afișare
  const parseEntryText = (fullText) => {
      if (!fullText) return { tags: [], content: "" };
      
      const tagMatch = fullText.match(/\[TAGS\]: (.*?)(\n|$)/);
      const content = fullText.replace(/\[TAGS\]:.*|\[RECUNOȘTINȚĂ\]:.*|\[JURNAL\]:/gs, '').trim();
      
      const tags = tagMatch ? tagMatch[1].split(',').filter(t => t.trim() !== '') : [];
      return { tags, content };
  };

  return (
    <div className="min-h-screen pb-20 animate-fade-in transition-colors duration-700 ease-in-out relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Jurnalul Tău</h2>
          <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-calm-primary"/> 
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-700">{recentEntries.length} Intrări</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* EDITOR (Stânga) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Mood Selector */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 text-lg">Cum te simți acum?</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100 ${currentMoodObj.color}`}>
                    {currentMoodObj.label}
                </span>
            </div>
            
            <div className="flex justify-between gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m.score)}
                  className={`relative group flex flex-col items-center gap-3 p-4 min-w-[80px] rounded-2xl transition-all duration-300 ease-out
                    ${selectedMood === m.score 
                      ? `bg-gray-900 text-white shadow-lg transform scale-105` 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:scale-105'}`}
                >
                  <m.icon className={`w-8 h-8 transition-transform duration-300 ${selectedMood === m.score ? 'text-white scale-110' : m.color}`} />
                  <span className="text-xs font-medium">{m.label}</span>
                  {selectedMood === m.score && (
                    <span className="absolute -bottom-2 w-1.5 h-1.5 bg-gray-900 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 transition-colors duration-500 ${currentMoodObj.bg} ${currentMoodObj.border}`}>
                <Sparkles size={20} className={currentMoodObj.color} />
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${currentMoodObj.color}`}>Reflect AI Insight</p>
                    <p className="text-sm text-gray-700 font-medium italic">"{aiInsight}"</p>
                </div>
            </div>
          </div>

          {/* Text Editor */}
          <div className="bg-white p-1 rounded-[2.5rem] shadow-sm border border-gray-100">
             <div className="flex p-2 gap-2 bg-gray-50/50 rounded-[2.3rem] mb-4 mx-2 mt-2">
                <button 
                    onClick={() => setActiveTab('journal')}
                    className={`flex-1 py-3 px-6 rounded-3xl text-sm font-bold transition-all duration-300 ${activeTab === 'journal' ? 'bg-white shadow-md text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    ✍️ Jurnal Liber
                </button>
                <button 
                    onClick={() => setActiveTab('gratitude')}
                    className={`flex-1 py-3 px-6 rounded-3xl text-sm font-bold transition-all duration-300 ${activeTab === 'gratitude' ? 'bg-white shadow-md text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    🙏 Recunoștință
                </button>
             </div>

             <div className="px-6 pb-6">
                <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Tag-uri relevante</p>
                    <div className="flex flex-wrap gap-2">
                        {TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1
                            ${selectedTags.includes(tag) 
                                ? `bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105` 
                                : 'bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200 hover:bg-white'}`}
                        >
                            <Hash size={10} className={selectedTags.includes(tag) ? 'text-gray-400' : 'text-gray-300'}/> {tag}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="relative group">
                    {activeTab === 'journal' ? (
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-64 p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-calm-primary/20 focus:bg-white focus:ring-4 focus:ring-calm-primary/10 transition-all outline-none text-gray-700 leading-relaxed resize-none text-base placeholder:text-gray-400"
                            placeholder="Descarcă-te aici. Cum a fost ziua ta cu adevărat?"
                        ></textarea>
                    ) : (
                        <div className="h-64 flex flex-col gap-4">
                            <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 h-full flex flex-col">
                                <label className="text-orange-800 font-bold text-sm mb-2 flex items-center gap-2">
                                    <Heart size={16} className="fill-orange-500 text-orange-500"/>
                                    3 lucruri bune de azi:
                                </label>
                                <textarea 
                                    value={gratitude}
                                    onChange={(e) => setGratitude(e.target.value)}
                                    className="w-full flex-1 bg-transparent border-none focus:ring-0 outline-none text-gray-700 placeholder-orange-300/50 text-lg leading-relaxed resize-none"
                                    placeholder="1. Cafeaua de dimineață...&#10;2. ..."
                                ></textarea>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleMicClick}
                        className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 shadow-sm
                        ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-calm-primary border border-gray-100'}`}
                    >
                        <Mic size={20} />
                    </button>
                </div>

                <div className="mt-6">
                    <Button onClick={handleSave} variant="primary" disabled={loading} className="w-full py-4 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/20 hover:translate-y-[-2px] active:scale-[0.99] transition-all">
                        {loading ? 'Se salvează...' : 'Salvează în Jurnal'}
                    </Button>
                </div>
             </div>
          </div>
        </div>

        {/* ISTORIC (Dreapta) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-gray-100 border border-gray-100 h-[calc(100vh-140px)] sticky top-24 flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Clock size={20} className="text-calm-primary"/> Istoric
                </h3>
             </div>

             <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-300 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Caută..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 pl-10 pr-4 py-2.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-calm-primary/20 transition-all outline-none"
                />
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <BookOpen size={40} className="mx-auto mb-2 text-gray-300"/>
                    <p className="text-sm text-gray-400">Nu am găsit intrări.</p>
                  </div>
                ) : (
                  filteredEntries.map((entry, idx) => {
                    const { content } = parseEntryText(entry.note);
                    const moodIcon = MOODS.find(m => m.score === entry.score) || MOODS[2];
                    const EntryIcon = moodIcon.icon;

                    return (
                      <div 
                        key={entry.id || idx} 
                        onClick={() => setViewEntry(entry)} // DESCHIDE MODAL
                        className="group relative bg-white p-4 rounded-2xl border border-gray-100 hover:border-calm-primary hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${moodIcon.bg}`}>
                                    <EntryIcon size={14} className={moodIcon.color} />
                                </div>
                                <span className="text-xs font-bold text-gray-500">
                                    {entry.date ? new Date(entry.date).toLocaleDateString('ro-RO', {day: 'numeric', month: 'short'}) : 'Azi'}
                                </span>
                             </div>
                             
                             {/* BUTON ȘTERGERE */}
                             <button 
                                onClick={(e) => handleDelete(e, entry.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Șterge intrarea"
                             >
                                <Trash2 size={14} />
                             </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed font-medium">
                          {content || "Fără text..."}
                        </p>
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>

      </div>

      {/* === MODAL CITIRE === */}
      {viewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up">
                
                {/* Modal Header */}
                <div className={`p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${MOODS.find(m => m.score === viewEntry.score)?.bg || 'bg-gray-100'}`}>
                            {(() => {
                                const Icon = (MOODS.find(m => m.score === viewEntry.score) || MOODS[2]).icon;
                                return <Icon size={24} className={MOODS.find(m => m.score === viewEntry.score)?.color} />;
                            })()}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                {new Date(viewEntry.date).toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-400">
                                {new Date(viewEntry.date).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setViewEntry(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                    {/* Tags */}
                    {parseEntryText(viewEntry.note).tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {parseEntryText(viewEntry.note).tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Textul propriu-zis */}
                    <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {parseEntryText(viewEntry.note).content}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => setViewEntry(null)}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition"
                    >
                        Închide
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default JournalPage;