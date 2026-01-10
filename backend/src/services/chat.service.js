const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { paginate, paginationResponse } = require('../utils/helpers');

class ChatService {
  /**
   * Send a message
   */
  async sendMessage(planId, userId, data) {
    const { content, type = 'TEXT', metadata } = data;

    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const message = await prisma.message.create({
      data: {
        planId,
        senderId: userId,
        content,
        type,
        metadata,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  }

  /**
   * Get messages for a plan
   */
  async getMessages(planId, userId, { page = 1, limit = 50, before }) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const where = {
      planId,
      isDeleted: false,
    };

    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.message.count({ where }),
    ]);

    // Reverse to get chronological order
    messages.reverse();

    return paginationResponse(messages, total, page, limit);
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId, userId) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    if (message.senderId !== userId) {
      throw ApiError.forbidden('You can only delete your own messages');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, content: 'This message was deleted' },
    });

    return updatedMessage;
  }

  /**
   * Create a system message
   */
  async createSystemMessage(planId, content) {
    // Find a member (we'll use the first member as sender for system messages)
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { ownerId: true },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    const message = await prisma.message.create({
      data: {
        planId,
        senderId: plan.ownerId,
        content,
        type: 'SYSTEM',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  }
}

module.exports = new ChatService();
