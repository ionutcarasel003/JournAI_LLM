import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Bot,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Loader2,
} from "lucide-react";
import Button from "../components/Button";

const API_URL = "http://localhost:3000/api/ai/analyze";

const AIChatPage = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Salut${user?.email ? `, ${user.email}` : ""}! Cum ți-a fost ziua?.`,
      riskLevel: null,
      probabilities: null,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading],
  );

  const buildBotReply = (data) => {
    const risk = data?.risk_level || "unknown";
    const probabilities = data?.probabilities || null;

    let responseText = "Analiza a fost finalizată.";

    if (risk === "high") {
      responseText =
        "Analiza a fost finalizată. Mesajul trimis indică un nivel de risc ridicat.";
    } else if (risk === "medium") {
      responseText =
        "Analiza a fost finalizată. Mesajul trimis indică un nivel de risc mediu.";
    } else if (risk === "low") {
      responseText =
        "Analiza a fost finalizată. Mesajul trimis indică un nivel de risc scăzut.";
    }

    return {
      id: Date.now() + Math.random(),
      sender: "bot",
      text: responseText,
      riskLevel: risk,
      probabilities,
    };
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "A apărut o eroare la analiză.");
      }

      const botMessage = buildBotReply(data);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: "bot",
          text: "Nu am putut analiza mesajul acum. Verifică backend-ul și încearcă din nou.",
          riskLevel: null,
          probabilities: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI Chat</h2>
            <p className="text-sm text-gray-500 mt-1">
              Trimite un mesaj, si hai să vorbim.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-calm-primary rounded-2xl text-sm font-semibold border border-blue-100 w-fit">
            <Bot size={18} />
            Vorbeste cu mine
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-[28px] p-4 md:p-5 h-[62vh] flex flex-col">
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] md:max-w-[70%] rounded-3xl rounded-bl-md bg-white border border-gray-100 shadow-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin text-calm-primary" />
                    Botul analizează mesajul...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-2 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Scrie mesajul tău aici..."
                className="flex-1 resize-none bg-transparent outline-none px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 max-h-40"
              />

              <Button
                type="button"
                onClick={handleSend}
                className="px-4 py-3 min-w-[120px]"
                disabled={!canSend}
              >
                <Send size={16} />
                Trimite
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-3 px-1">
              Apasă Enter pentru trimitere. Shift + Enter pentru rând nou.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatBubble = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] px-4 py-3 shadow-sm ${
          isUser
            ? "bg-gray-900 text-white rounded-3xl rounded-br-md"
            : "bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-bl-md"
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>

        {!isUser && message.riskLevel && (
          <div className="mt-3">
            <RiskBadge riskLevel={message.riskLevel} />
          </div>
        )}

        {!isUser && message.probabilities && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <ProbabilityCard label="Low" value={message.probabilities.low} />
            <ProbabilityCard
              label="Medium"
              value={message.probabilities.medium}
            />
            <ProbabilityCard label="High" value={message.probabilities.high} />
          </div>
        )}
      </div>
    </div>
  );
};

const RiskBadge = ({ riskLevel }) => {
  const config = {
    low: {
      label: "Low Risk",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: ShieldCheck,
    },
    medium: {
      label: "Medium Risk",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: ShieldQuestion,
    },
    high: {
      label: "High Risk",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: ShieldAlert,
    },
  };

  const current = config[riskLevel] || {
    label: "Unknown",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: ShieldQuestion,
  };

  const Icon = current.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold uppercase tracking-wide ${current.className}`}
    >
      <Icon size={14} />
      {current.label}
    </div>
  );
};

const ProbabilityCard = ({ label, value }) => {
  const percentage =
    value !== undefined && value !== null
      ? `${(Number(value) * 100).toFixed(1)}%`
      : "-";

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 px-3 py-2 text-center">
      <p className="text-[11px] uppercase font-bold text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-700 mt-1">{percentage}</p>
    </div>
  );
};

export default AIChatPage;
