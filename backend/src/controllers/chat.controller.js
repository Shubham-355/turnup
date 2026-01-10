const chatService = require('../services/chat.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/plans/:planId/messages
 * @desc    Send a message
 * @access  Private (Member)
 */
const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage(
    req.params.planId,
    req.user.id,
    req.body
  );

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io) {
    io.to(`plan:${req.params.planId}`).emit('new_message', message);
  }

  ApiResponse.created(message, 'Message sent').send(res);
});

/**
 * @route   GET /api/plans/:planId/messages
 * @desc    Get messages for a plan
 * @access  Private (Member)
 */
const getMessages = asyncHandler(async (req, res) => {
  const { page, limit, before } = req.query;

  const messages = await chatService.getMessages(req.params.planId, req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
    before,
  });

  ApiResponse.success(messages).send(res);
});

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private (Message owner)
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await chatService.deleteMessage(req.params.messageId, req.user.id);

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io && message) {
    io.to(`plan:${message.planId}`).emit('message_deleted', { messageId: message.id });
  }

  ApiResponse.success(null, 'Message deleted').send(res);
});

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
};
