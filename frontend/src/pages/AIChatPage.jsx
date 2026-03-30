import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import Button from "../components/Button";
import ChatSidebar from "../components/ChatSidebar";
import {
  createSession,
  getSessionsByUser,
  getMessagesBySession,
  analyzeMessage,
} from "../services/chatApi";

const AIChatPage = ({ user }) => {
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  const welcomeMessage = {
    id: "welcome-message",
    sender: "bot",
    text: `Hi${user?.email ? `, ${user.email}` : ""}! How was your day?`,
  };

  const canSend = useMemo(() => {
    return input.trim().length > 0 && !loading && !!sessionId;
  }, [input, loading, sessionId]);

  const uiMessages = sessionId && messages.length > 0 ? messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [uiMessages, loading]);

  const mapDbMessageToUi = (message) => ({
    id: message.id,
    sender: message.role === "assistant" ? "bot" : "user",
    text: message.content,
    created_at: message.created_at,
  });

  const loadSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoadingSessions(true);
      const data = await getSessionsByUser(user.id);
      setSessions(data);

      if (data.length > 0) {
        setSessionId(data[0].id);
      } else {
        setSessions([]);
        setSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error in loadSessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (selectedSessionId) => {
    if (!selectedSessionId) return;

    try {
      setLoadingMessages(true);
      const data = await getMessagesBySession(selectedSessionId);
      setMessages(data.map(mapDbMessageToUi));
    } catch (error) {
      console.error("Error in loadMessages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    }
  }, [sessionId, loadMessages]);

  const refreshSessionsKeepActive = async (preferredSessionId = null) => {
    if (!user?.id) return;

    try {
      const data = await getSessionsByUser(user.id);
      setSessions(data);

      if (preferredSessionId) {
        setSessionId(preferredSessionId);
      } else if (!sessionId && data.length > 0) {
        setSessionId(data[0].id);
      }
    } catch (error) {
      console.error("Error in refreshSessionsKeepActive:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSession = await createSession(user.id, "New Chat");
      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSession.id);
      setMessages([]);
      setInput("");
    } catch (error) {
      console.error("Error in handleNewChat:", error);
    }
  };

  const handleSelectSession = async (selectedSessionId) => {
    setSessionId(selectedSessionId);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !sessionId) return;

    const optimisticUserMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await analyzeMessage({
        text: trimmed,
        sessionId,
        userId: user.id,
      });

      const botMessage = {
        id: Date.now() + Math.random(),
        sender: "bot",
        text: data?.reply || "I analyzed your message.",
      };

      setMessages((prev) => [...prev, botMessage]);

      await refreshSessionsKeepActive(sessionId);
      await loadMessages(sessionId);
    } catch (error) {
      console.error("Error in handleSend:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: "bot",
          text: "I couldn't analyze your message right now. Check the backend and try again.",
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
              Send a message and view your conversation history.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-calm-primary rounded-2xl text-sm font-semibold border border-blue-100 w-fit">
            <Bot size={18} />
            Talk to me
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
          <ChatSidebar
            sessions={sessions}
            activeSessionId={sessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            loadingSessions={loadingSessions}
          />

          <div className="bg-gray-50 border border-gray-100 rounded-[28px] p-4 md:p-5 h-[62vh] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
              {loadingMessages ? (
                <div className="text-sm text-gray-400">Loading messages...</div>
              ) : !sessionId ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  Select a conversation or click the New Chat button.
                </div>
              ) : uiMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  This conversation is still empty. Write a message.
                </div>
              ) : (
                uiMessages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[70%] rounded-3xl rounded-bl-md bg-white border border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin text-calm-primary" />
                      The bot is analyzing your message...
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
                  placeholder="Write your message here..."
                  className="flex-1 resize-none bg-transparent outline-none px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 max-h-40"
                />

                <Button
                  type="button"
                  onClick={handleSend}
                  className="px-4 py-3 min-w-[120px]"
                  disabled={!canSend}
                >
                  <Send size={16} />
                  Send
                </Button>
              </div>

              <p className="text-xs text-gray-400 mt-3 px-1">
                Press Enter to send. Shift + Enter for a new line.
              </p>
            </div>
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
