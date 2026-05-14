import React, { useState, useEffect } from 'react';
import {
  Smile, Meh, Frown, Heart, Calendar, Tag,
  Clock, Sparkles, BookOpen, Mic,
  BarChart2, Search, Zap, ChevronRight, Hash, Trash2, X, Maximize2,
  MessageCircleHeart, Brain, Loader2
} from 'lucide-react';
import Button from '../components/Button';

const MOODS = [
  { score: 100, label: 'Excellent', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', gradient: 'from-yellow-400 to-orange-500', advice: "You're on fire! 🔥 Use this energy to create something wonderful today." },
  { score: 75, label: 'Good', icon: Smile, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', gradient: 'from-green-400 to-emerald-500', advice: "A good day is a solid foundation. Keep the pace!" },
  { score: 50, label: 'Neutral', icon: Meh, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-400 to-indigo-500', advice: "It's ok to be quiet. Breathe and observe the day without judgment." },
  { score: 25, label: 'Bad', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', gradient: 'from-orange-400 to-red-500', advice: "Clouds pass. Be gentle with yourself in these moments." },
  { score: 0, label: 'Terrible', icon: Frown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-red-500 to-rose-600', advice: "You are strong because you're still here. Ask for help if you need it. ❤️" }
];

const TAGS = ["Family", "Work", "Sleep", "Sports", "Relationship", "Health", "Weather", "School", "Creativity", "Finance"];

const EMOTION_ORDER = ['joy', 'love', 'surprise', 'sadness', 'anger', 'fear'];

const JournalPage = ({ user, onNavigateToChat }) => {
  const [selectedMood, setSelectedMood] = useState(50);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const [viewEntry, setViewEntry] = useState(null);

  const [emotionResult, setEmotionResult] = useState(null);
  const [emotionLoading, setEmotionLoading] = useState(false);
  const [savedJournalText, setSavedJournalText] = useState('');

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
      console.error("History error:", error);
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
        setNote(prev => prev + " (Auto-dictated text...) ");
      }, 2000);
    }
  };

  const handleSave = async () => {
    if (!note) return;

    setLoading(true);
    setEmotionResult(null);

    const fullNote = `
[TAGS]: ${selectedTags.join(', ')}
[JURNAL]: ${note}
    `.trim();

    const journalText = note;

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
        const data = await response.json();
        const moodId = data.id;

        setSavedJournalText(journalText);
        fetchHistory();
        setNote('');
        setSelectedTags([]);

        // Detectare emotii
        setEmotionLoading(true);
        try {
          const emotionResponse = await fetch('http://localhost:3000/api/emotions/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: journalText })
          });

          if (emotionResponse.ok) {
            const emotionData = await emotionResponse.json();
            setEmotionResult(emotionData);

            // Salveaza emotiile in baza de date
            if (moodId) {
              await fetch(`http://localhost:3000/api/emotions/moods/${moodId}/emotions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emotions: emotionData.emotions })
              });
            }
          } else {
            setEmotionResult({ error: 'Emotion service is unavailable.' });
          }
        } catch {
          setEmotionResult({ error: 'Emotion service is unavailable. Make sure it is running on port 5000.' });
        } finally {
          setEmotionLoading(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, entryId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/moods/${entryId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setRecentEntries(prev => prev.filter(item => item.id !== entryId));
        }
    } catch (error) {
        console.error("Deletion error:", error);
    }
  };

  const currentMoodObj = MOODS.find(m => m.score === selectedMood) || MOODS[2];

  const filteredEntries = recentEntries.filter(entry =>
    (entry.note || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parseEntryText = (fullText) => {
      if (!fullText) return { tags: [], content: "" };

      // Use a strict regex to only extract tags on the same line.
      const tagMatch = fullText.match(/\[TAGS\]:([^\n]*)/);
      const tags = tagMatch && tagMatch[1] ? tagMatch[1].split(',').map(t => t.trim()).filter(t => t !== '') : [];

      // Extract text up to the next bracket or end of file
      const journalMatch = fullText.match(/\[JURNAL\]:\s*([\s\S]*?)(?=\n\[|$)/);
      const journal = journalMatch && journalMatch[1] ? journalMatch[1].trim() : "";

      const gratitudeMatch = fullText.match(/\[GRATITUDE\]:\s*([\s\S]*?)(?=\n\[|$)/);
      const gratitude = gratitudeMatch && gratitudeMatch[1] ? gratitudeMatch[1].trim() : "";

      let finalContent = "";
      
      if (gratitude && journal) {
          finalContent += "🙏 Gratitude:\n" + gratitude + "\n\n✍️ Journal:\n" + journal;
      } else if (gratitude) {
          finalContent = gratitude;
      } else if (journal) {
          finalContent = journal;
      }

      if (!journalMatch && !gratitudeMatch) {
          finalContent = fullText.replace(/\[TAGS\]:[^\n]*\n?/, '').trim();
      }

      return { tags, content: finalContent };
  };

  const sortedEmotions = emotionResult?.emotions
    ? EMOTION_ORDER.map(key => ({ key, ...emotionResult.emotions[key] })).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen pb-20 animate-fade-in transition-colors duration-700 ease-in-out relative">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Your Journal</h2>
          <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-calm-primary"/>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
             <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-700">{recentEntries.length} Entries</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 text-lg">How are you feeling right now?</h3>
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

          <div className="bg-white p-1 rounded-[2.5rem] shadow-sm border border-gray-100">

             <div className="px-6 pb-6">
                <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Relevant tags</p>
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
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full h-64 p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-calm-primary/20 focus:bg-white focus:ring-4 focus:ring-calm-primary/10 transition-all outline-none text-gray-700 leading-relaxed resize-none text-base placeholder:text-gray-400 mt-4"
                        placeholder="Vent here. How was your day really?"
                    ></textarea>

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
                        {loading ? 'Saving...' : 'Save to Journal'}
                    </Button>
                </div>
             </div>
          </div>

          {/* Emotion Detection Results */}
          {(emotionLoading || emotionResult) && (
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white animate-fade-in">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Detected Emotions</h3>
                  <p className="text-xs text-gray-400">BERT analysis of your text</p>
                </div>
              </div>

              {emotionLoading && (
                <div className="flex items-center gap-3 py-4 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-sm">Analyzing text...</span>
                </div>
              )}

              {emotionResult?.error && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
                  ⚠️ {emotionResult.error}
                </div>
              )}

              {emotionResult?.emotions && (
                <>
                  <div className="space-y-3">
                    {sortedEmotions.map(({ key, score, label_ro, color }) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 capitalize">{label_ro}</span>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Confidence</span>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{Math.round(score * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.round(score * 100)}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {emotionResult.dominant && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Dominant emotion:{' '}
                        <span
                          className="font-bold"
                          style={{ color: emotionResult.emotions[emotionResult.dominant]?.color }}
                        >
                          {emotionResult.emotions[emotionResult.dominant]?.label_ro}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="mt-5">
                    <button
                      onClick={() => onNavigateToChat && onNavigateToChat(savedJournalText)}
                      className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:translate-y-[-2px] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 text-base"
                    >
                      <MessageCircleHeart size={22} />
                      Do you want to chat?
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-gray-100 border border-gray-100 h-[calc(100vh-140px)] sticky top-24 flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Clock size={20} className="text-calm-primary"/> History
                </h3>
             </div>

             <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-300 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 pl-10 pr-4 py-2.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-calm-primary/20 transition-all outline-none"
                />
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <BookOpen size={40} className="mx-auto mb-2 text-gray-300"/>
                    <p className="text-sm text-gray-400">No entries found.</p>
                  </div>
                ) : (
                  filteredEntries.map((entry, idx) => {
                    const { content } = parseEntryText(entry.note);
                    const moodIcon = MOODS.find(m => m.score === entry.score) || MOODS[2];
                    const EntryIcon = moodIcon.icon;

                    return (
                      <div
                        key={entry.id || idx}
                        onClick={() => setViewEntry(entry)}
                        className="group relative bg-white p-4 rounded-2xl border border-gray-100 hover:border-calm-primary hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${moodIcon.bg}`}>
                                    <EntryIcon size={14} className={moodIcon.color} />
                                </div>
                                <span className="text-xs font-bold text-gray-500">
                                    {entry.date ? new Date(entry.date).toLocaleDateString('en-US', {day: 'numeric', month: 'short'}) : 'Today'}
                                </span>
                             </div>

                             <button
                                onClick={(e) => handleDelete(e, entry.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete entry"
                             >
                                <Trash2 size={14} />
                             </button>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed font-medium">
                          {content || "No text..."}
                        </p>
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>

      </div>

      {viewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up">

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
                                {new Date(viewEntry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-400">
                                {new Date(viewEntry.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setViewEntry(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                    {parseEntryText(viewEntry.note).tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {parseEntryText(viewEntry.note).tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {parseEntryText(viewEntry.note).content}
                    </div>

                    {viewEntry.emotions && (() => {
                        let emotions = viewEntry.emotions;
                        if (typeof emotions === 'string') {
                            try { emotions = JSON.parse(emotions); } catch { return null; }
                        }
                        const entries = EMOTION_ORDER.map(k => ({ key: k, ...emotions[k] })).filter(e => e.score != null);
                        if (!entries.length) return null;
                        return (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Brain size={14} /> Detected emotions
                                </p>
                                <div className="space-y-2">
                                    {entries.map(({ key, score, label_ro, color }) => (
                                        <div key={key}>
                                            <div className="flex justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs font-semibold text-gray-600">{label_ro}</span>
                                                  <span className="text-[9px] font-bold text-gray-300 uppercase">Confidence</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{Math.round(score * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="h-2 rounded-full" style={{ width: `${Math.round(score * 100)}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <button
                                      onClick={() => {
                                          const { content } = parseEntryText(viewEntry.note);
                                          onNavigateToChat && onNavigateToChat(content);
                                          setViewEntry(null);
                                      }}
                                      className="w-full py-3 px-4 bg-gray-900 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:translate-y-[-2px] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                    >
                                      <MessageCircleHeart size={18} />
                                      Do you want to chat about this entry?
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={() => setViewEntry(null)}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default JournalPage;
