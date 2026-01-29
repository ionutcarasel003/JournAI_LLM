import React, { useState, useEffect } from 'react';
import { 
  Smile, Meh, Frown, Heart, Calendar, Tag, 
  Save, Clock, Sparkles, BookOpen 
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const MOODS = [
  { score: 100, label: 'Excelent', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { score: 75, label: 'Bine', icon: Smile, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  { score: 50, label: 'Neutru', icon: Meh, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-200' },
  { score: 25, label: 'Rău', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { score: 0, label: 'Groaznic', icon: Frown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
];

const TAGS = ["Familie", "Muncă", "Somn", "Sport", "Relație", "Sănătate", "Vreme", "Școală"];

const JournalPage = ({ user }) => {
  const [selectedMood, setSelectedMood] = useState(50);
  const [note, setNote] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/moods/${user.id}`);
      const data = await response.json();
      setRecentEntries(data.slice(0, 3));
    } catch (error) {
      console.error("Eroare istoric:", error);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    if (!note && !gratitude) {
      alert("Scrie măcar câteva cuvinte înainte de a salva.");
      return;
    }

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
        const newEntryOptimistic = {
            id: Date.now(), 
            score: selectedMood,
            note: fullNote,
            date: new Date().toISOString() 
        };

        setRecentEntries(prev => [newEntryOptimistic, ...prev].slice(0, 3));

        setNote('');
        setGratitude('');
        setSelectedTags([]);
  
      }
    } catch (error) {
      console.error("Eroare la salvare:", error);
      alert("Eroare de conexiune.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Jurnalul Tău</h2>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Calendar size={14}/> {new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <BookOpen className="text-calm-primary/20 w-12 h-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-700 mb-4">Cum te simți azi?</h3>
            <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m.score)}
                  className={`flex flex-col items-center gap-2 p-3 min-w-[70px] rounded-xl border transition-all duration-300
                    ${selectedMood === m.score 
                      ? `${m.bg} ${m.border} ring-2 ring-offset-1 ring-${m.color.split('-')[1]}-200 transform scale-105` 
                      : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                >
                  <m.icon className={`w-8 h-8 ${selectedMood === m.score ? m.color : 'text-gray-300'}`} />
                  <span className={`text-xs font-bold ${selectedMood === m.score ? 'text-gray-800' : 'text-gray-400'}`}>{m.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag size={16} /> Ce ți-a influențat ziua?
              </h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border
                      ${selectedTags.includes(tag) 
                        ? 'bg-calm-primary text-white border-calm-primary' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-calm-primary'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2 text-sm">
                <Heart size={16} className="fill-orange-400 text-orange-500"/> Pentru ce ești recunoscător azi?
              </h3>
              <input 
                type="text"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Ex: Am băut o cafea bună, Soarele a strălucit..."
                className="w-full bg-white border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none text-gray-700 placeholder-orange-200/70"
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Gândurile tale libere</h3>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-40 p-3 bg-gray-50 rounded-xl border-none resize-none focus:ring-2 focus:ring-calm-primary outline-none text-gray-700 leading-relaxed"
                placeholder="Descarcă-te aici. E un spațiu sigur..."
              ></textarea>
            </div>
          </Card>
          
          <Button onClick={handleSave} variant="primary" className="w-full py-4 text-lg shadow-xl shadow-calm-primary/20">
             {loading ? 'Se salvează...' : 'Salvează în Jurnal'} <Save size={18} />
          </Button>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Clock size={18} /> Intrări Recente
              </h3>
              
              <div className="space-y-4">
                {recentEntries.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nu ai intrări recente.</p>
                ) : (
                  recentEntries.map((entry, idx) => {
                    const noteText = entry.note || "";
                    const displayText = noteText.includes('[JURNAL]:') 
                      ? noteText.split('[JURNAL]:')[1] 
                      : noteText;

                    return (
                      <div key={entry.id || idx} className="relative pl-4 border-l-2 border-gray-100 hover:border-calm-primary transition group animate-fade-in">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-calm-primary transition"></div>
                        <p className="text-xs text-gray-400 mb-1">
                          {entry.date ? new Date(entry.date).toLocaleDateString('ro-RO') : 'Azi'}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-xs font-bold px-2 py-0.5 rounded ${entry.score > 50 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                             Stare: {entry.score}%
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 italic">
                          "{displayText ? displayText.substring(0, 60) : '...'}"
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default JournalPage;