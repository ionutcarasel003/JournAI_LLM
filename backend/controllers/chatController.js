const http = require('http');
const { getSQLiteDB } = require('../config/sqlite');
const { OpenAI } = require('openai');
const { execFile } = require("child_process");
const util = require("util");
const path = require("path");

const execFileAsync = util.promisify(execFile);

let openaiClient = null;

const getOpenAIClient = () => {
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY });
    }
    return openaiClient;
};

const buildSessionTitle = (text) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return "New Chat";
    return clean.length > 40 ? clean.slice(0, 40) + "..." : clean;
};

const sendMessage = async (req, res) => {
    let { messages, user_id, session_id } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Missing messages' });
    }

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        const db = getSQLiteDB();
        const lastUserMsg = messages[messages.length - 1];

        if (!session_id) {
            const title = buildSessionTitle(lastUserMsg.content);
            const result = await db.run(
                `INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)`,
                [user_id, title]
            );
            session_id = result.lastID;
        } else {
            await db.run(
                `UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [session_id]
            );
        }

        let isHighRisk = false;
        let maxTokens = 60;

        if (lastUserMsg.role === 'user') {
            try {
                const riskScriptPath = path.join(__dirname, "../initializer/initRiskLevel.py");
                const riskResult = await execFileAsync("uv", ["run", "python", riskScriptPath, lastUserMsg.content]);
                
                // Căutăm ultimul bloc JSON din stdout în caz că python face și alte print-uri
                const lines = riskResult.stdout.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                const parsedRisk = JSON.parse(lastLine);
                
                if (parsedRisk.risk_level === "high_risk") {
                    isHighRisk = true;
                    console.log("[chat] Major risk detected for this message!");
                }
            } catch (err) {
                console.error("Error checking risk (harm detection):", err);
            }
            
            const contentLower = lastUserMsg.content.toLowerCase();
            const triggerWords = [
                'overwhelmed', 'suffocated', 'suffocating', "can't manage", 'time management', 
                'struggling', 'help', 'hilfe', 'distraught', 'over my head', 'depressed', 'anxious',
                'sad', 'scared', 'nervous',
                'advice', 'elaborate', 'more', 'need', 'furthermore', 'further', 'why', 'what',
                'know', 'believe'
            ];
            
            if (triggerWords.some(word => contentLower.includes(word))) {
                maxTokens = 256;
            }
            
            if (isHighRisk) {
                maxTokens = 512;
            }

            await db.run(
                `INSERT INTO messages (session_id, user_id, role, content) VALUES (?, ?, ?, ?)`,
                [session_id, user_id, lastUserMsg.role, lastUserMsg.content]
            );
        }

        let systemPrompt = `You are JournAI, a compassionate and deeply empathetic AI companion. Your primary role is to listen, validate, and provide a safe space for the user to explore their thoughts and feelings. 
        \n\nADAPTIVE RESPONSE LENGTH (MANDATORY):
        \n- For casual conversation, greetings, or simple status updates (e.g., 'I had a holiday'), YOU MUST respond with a maximum of 1-2 sentences. Keep it warm but extremely concise.\n- Only if the user shares a deep struggle (e.g., feeling 'suffocated', 'overwhelmed', or 'time management' issues), provide a longer, more detailed response.
        \n\nCORE PRINCIPLES:
        \n1. DEEP EMPATHY: Always start by acknowledging and validating the user's specific feelings. Use phrases like 'I can hear how heavy this feels' or 'It makes perfect sense that you'd feel that way.'
        \n2. ACTIVE LISTENING: Summarize what you've heard to show you're paying attention before offering any perspective. Ask questions relevant to the user's message to show that you care.
        \n3. GENTLE GUIDANCE: When offering advice, frame it as suggestions or reflections rather than commands.
        \n4. NO JUDGMENT: Create an environment where no topic is too small or too dark.
        \n5. NO SIGN-OFFS: Do not end messages with 'Take care', 'Goodbye', or repeated greetings. Stop as soon as you have finished your thought.
        \n6. NO TOXIC ADVICE OR MISPLACED ENCOURAGEMENT: If the user wants to harm another person, don't encourage it. Don't give him toxic or harmful advice that might affect the user and the potential victim only to validate the user. In this situation give constructive and healthy advice and try to deescalate the situation.
        \n7. ELEGANT FORMATTING: If you provide numbered advice or a list, YOU MUST include an empty line (double newline) between each numbered item to make the response elegant and easy to read.`;

        if (isHighRisk) {
            systemPrompt += "\n\nCRITICAL CONTEXT: The user's message has triggered risk filters. They may be experiencing distress or thoughts of self-harm. Your PRIORITY is to be exceptionally gentle, validating, and safe. Acknowledge their pain deeply. If appropriate, suggest they are not alone and that help is available.";
        }

        let messagesToSend = messages;

        if (messages.length > 5) {
            const recentMessages = messages.slice(-5);
            const olderMessages = messages.slice(0, messages.length - 5);
            
            try {
                const summaryPrompt = olderMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
                
                const client = getOpenAIClient();
                const summaryResponse = await client.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are an assistant that creates concise summaries of therapy/journal conversations. Provide a short, to-the-point summary, preserving the essence of the user's state and the assistant's advice." },
                        { role: "user", content: `Here is the conversation:\n${summaryPrompt}` }
                    ]
                });
                
                const summary = summaryResponse.choices[0].message.content;
                console.log("[chat] Summary generated by OpenAI for context:", summary);
                
                messagesToSend = [
                    { role: "system", content: systemPrompt },
                    { role: "system", content: `Previous context summary: ${summary}` },
                    ...recentMessages
                ];
            } catch (err) {
                console.error("Error generating OpenAI summary:", err);
                messagesToSend = [
                    { role: "system", content: systemPrompt },
                    ...recentMessages
                ];
            }
        } else {
            messagesToSend = [
                { role: "system", content: systemPrompt },
                ...messages
            ];
        }

        const payload = JSON.stringify({ messages: messagesToSend, max_tokens: maxTokens });

        const options = {
            hostname: '127.0.0.1',
            port: 5050,
            path: '/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'JournAI-Backend'
            }
        };

        const request = http.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', async () => {
                try {
                    const result = JSON.parse(data);
                    if (response.statusCode === 503 && result.loading) {
                        return res.status(503).json(result);
                    }

                    if (result.reply) {
                        await db.run(
                            `INSERT INTO messages (session_id, user_id, role, content) VALUES (?, ?, ?, ?)`,
                            [session_id, user_id, "assistant", result.reply]
                        );
                    }

                    result.session_id = session_id;
                    res.status(response.statusCode).json(result);
                } catch (e) {
                    console.error('[chat] parse error:', e.message);
                    res.status(500).json({ error: 'Error parsing response', raw: data });
                }
            });
        });

        request.on('error', (err) => {
            console.error('[chat] service unavailable:', err.message);
            res.status(503).json({ error: 'Chat service is unavailable. Make sure emotion-service is running.' });
        });

        request.setTimeout(120000, () => {
            request.destroy();
            res.status(504).json({ error: 'Timeout - response generation is taking too long.' });
        });

        request.write(payload);
        request.end();

    } catch (err) {
        console.error('[chat] DB error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

const getChatSessions = async (req, res) => {
    const { userId } = req.params;
    try {
        const db = getSQLiteDB();
        const sessions = await db.all(
            `SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC`,
            [userId]
        );
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ error: 'Error reading sessions' });
    }
};

const getSessionMessages = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const db = getSQLiteDB();
        const messages = await db.all(
            `SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
            [sessionId]
        );
        res.json(messages);
    } catch (error) {
        console.error('Error fetching session messages:', error);
        res.status(500).json({ error: 'Error reading messages' });
    }
};

const deleteChatSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const db = getSQLiteDB();
        await db.run(`DELETE FROM messages WHERE session_id = ?`, [sessionId]);
        await db.run(`DELETE FROM chat_sessions WHERE id = ?`, [sessionId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Error deleting session' });
    }
};

module.exports = { sendMessage, getChatSessions, getSessionMessages, deleteChatSession };
