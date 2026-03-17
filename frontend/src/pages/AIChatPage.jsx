import React, { useMemo, useRef, useState, useEffect } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import Button from "../components/Button";

const API_URL = "http://localhost:3000/api/ai/analyze";

const AIChatPage = ({ user }) => {
  const [sessionId, setSessionId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Salut${user?.email ? `, ${user.email}` : ""}! Cum ți-a fost ziua?`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);

  useEffect(() => {
    if (user?.id && !sessionId) {
      createNewSession();
    }
  }, [user, sessionId]);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && !loading;
  }, [input, loading]);

  const buildBotReply = (data) => {
    return {
      id: Date.now() + Math.random(),
      sender: "bot",
      text: data?.reply || "Am analizat mesajul tău.",
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
        body: JSON.stringify({
          text: trimmed,
          session_id: sessionId,
          user_id: user.id,
        }),
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

  const createNewSession = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          title: "New Chat",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Nu s-a putut crea sesiunea.");
      }

      setSessionId(data.id);
    } catch (error) {
      console.error("Eroare la createNewSession:", error);
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
      </div>
    </div>
  );
};

export default AIChatPage;
