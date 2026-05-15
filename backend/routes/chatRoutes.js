const express = require('express');
const router = express.Router();

const { sendMessage, getChatSessions, getSessionMessages, deleteChatSession } = require('../controllers/chatController');

router.post('/message', sendMessage);
router.get('/sessions/:userId', getChatSessions);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.delete('/sessions/:sessionId', deleteChatSession);

module.exports = router;
