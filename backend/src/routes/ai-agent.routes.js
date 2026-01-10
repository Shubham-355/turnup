const express = require('express');
const router = express.Router();
const aiAgentController = require('../controllers/ai-agent.controller');
// const { authenticate } = require('../middlewares/auth.middleware');

// All routes are public for demo purposes
// router.use(authenticate);

/**
 * @route   POST /api/ai-agent/chat
 * @desc    Chat with AI agent
 * @access  Private
 */
router.post('/chat', aiAgentController.chat);

/**
 * @route   GET /api/ai-agent/history
 * @desc    Get conversation history
 * @access  Private
 */
router.get('/history', aiAgentController.getHistory);

/**
 * @route   POST /api/ai-agent/reset
 * @desc    Reset conversation history
 * @access  Private
 */
router.post('/reset', aiAgentController.resetConversation);

/**
 * @route   GET /api/ai-agent/tools
 * @desc    Get available AI agent tools/capabilities
 * @access  Private
 */
router.get('/tools', aiAgentController.getAvailableTools);

module.exports = router;
