const aiAgentService = require('../services/ai-agent.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/ai-agent/chat
 * @desc    Chat with AI agent
 * @access  Private
 */
const chat = asyncHandler(async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return ApiResponse.error('Message is required', 400).send(res);
  }

  const userId = req.user?.id || 'demo-user';
  const response = await aiAgentService.chat(userId, message, context);

  ApiResponse.success(response, 'AI agent response').send(res);
});

/**
 * @route   GET /api/ai-agent/history
 * @desc    Get conversation history
 * @access  Private
 */
const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const history = await aiAgentService.getHistory(userId);

  ApiResponse.success(history).send(res);
});

/**
 * @route   POST /api/ai-agent/reset
 * @desc    Reset conversation history
 * @access  Private
 */
const resetConversation = asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const result = await aiAgentService.resetConversation(userId);

  ApiResponse.success(result).send(res);
});

/**
 * @route   GET /api/ai-agent/tools
 * @desc    Get available AI agent tools/capabilities
 * @access  Private
 */
const getAvailableTools = asyncHandler(async (req, res) => {
  const tools = aiAgentService.getAvailableTools();

  ApiResponse.success({ tools }).send(res);
});

module.exports = {
  chat,
  getHistory,
  resetConversation,
  getAvailableTools,
};
