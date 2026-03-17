const BASE_URL = "http://localhost:3000/api";

export const createSession = async (userId, title = "New Chat") => {
  const response = await fetch(`${BASE_URL}/chat/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      title,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Nu s-a putut crea sesiunea.");
  }

  return data;
};

export const getSessionsByUser = async (userId) => {
  const response = await fetch(`${BASE_URL}/chat/sessions/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Nu s-au putut încărca sesiunile.");
  }

  return data;
};

export const getMessagesBySession = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/chat/messages/${sessionId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Nu s-au putut încărca mesajele.");
  }

  return data;
};

export const analyzeMessage = async ({ text, sessionId, userId }) => {
  const response = await fetch(`${BASE_URL}/ai/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      session_id: sessionId,
      user_id: userId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "A apărut o eroare la analiză.");
  }

  return data;
};