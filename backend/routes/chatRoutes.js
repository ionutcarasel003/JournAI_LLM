const express = require("express");
const router = express.Router();
const {
  createSession,
  getSessionsByUser,
  getMessagesBySession,
  saveMessage,
} = require("../controllers/chatController");

router.post("/sessions", createSession);
router.get("/sessions/:userId", getSessionsByUser);
router.get("/messages/:sessionId", getMessagesBySession);
router.post("/messages", saveMessage);

module.exports = router;