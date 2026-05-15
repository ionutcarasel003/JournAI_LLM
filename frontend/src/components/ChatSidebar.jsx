import React from "react";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";

const ChatSidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  loadingSessions,
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 h-[62vh] flex flex-col">
      <button
        onClick={onNewChat}
        className="w-full mb-4 px-4 py-3 rounded-2xl bg-gray-900 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition"
      >
        <MessageSquarePlus size={16} />
        New chat
      </button>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {loadingSessions ? (
          <div className="text-sm text-gray-400">Loading history...</div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-gray-400">
            No conversations yet.
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = Number(activeSessionId) === Number(session.id);

            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left p-3 rounded-2xl border transition ${
                  isActive
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessagesSquare
                    size={16}
                    className="mt-0.5 text-calm-primary"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {session.title || "New Chat"}
                    </div>

                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <span>
                        {new Date(session.updated_at).toLocaleString()}
                      </span>

                      {session.title === "New Chat" && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-medium">
                          empty
                        </span>
                      )}
                    </div>
                    
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
