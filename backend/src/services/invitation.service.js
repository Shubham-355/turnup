const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');
const { paginate, paginationResponse } = require('../utils/helpers');

class InvitationService {
  /**
   * Send invitation to a user
   */
  async sendInvitation(planId, senderId, data) {
    const { receiverId, email } = data;

    // Verify sender is member with invite permissions
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId: senderId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    // Check if user is already a member
    if (receiverId) {
      const existingMembership = await prisma.planMember.findUnique({
        where: {
          planId_userId: { planId, userId: receiverId },
        },
      });

      if (existingMembership && existingMembership.status === 'ACTIVE') {
        throw ApiError.conflict('User is already a member of this plan');
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          planId,
          receiverId,
          status: 'PENDING',
        },
      });

      if (existingInvitation) {
        throw ApiError.conflict('User already has a pending invitation');
      }
    }

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        planId,
        senderId,
        receiverId,
        email,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    // Send notification to receiver
    if (receiverId) {
      await notificationService.createNotification(receiverId, {
        type: 'PLAN_INVITE',
        title: 'Plan Invitation',
        body: `${invitation.sender.displayName || invitation.sender.username} invited you to join "${plan.name}"`,
        data: { planId, invitationId: invitation.id },
      });
    }

    return invitation;
  }

  /**
   * Get user's received invitations
   */
  async getReceivedInvitations(userId, { page = 1, limit = 20 }) {
    const where = {
      receiverId: userId,
      status: 'PENDING',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
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
          plan: {
            select: {
              id: true,
              name: true,
              category: true,
              coverImage: true,
              _count: {
                select: {
                  members: { where: { status: 'ACTIVE' } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.invitation.count({ where }),
    ]);

    return paginationResponse(invitations, total, page, limit);
  }

  /**
   * Get sent invitations for a plan
   */
  async getSentInvitations(planId, userId, { page = 1, limit = 20 }) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const where = { planId };

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
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
          receiver: {
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
      prisma.invitation.count({ where }),
    ]);

    return paginationResponse(invitations, total, page, limit);
  }

  /**
   * Respond to invitation (accept/decline)
   */
  async respondToInvitation(invitationId, userId, accept) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        plan: true,
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!invitation) {
      throw ApiError.notFound('Invitation not found');
    }

    if (invitation.receiverId !== userId) {
      throw ApiError.forbidden('This invitation is not for you');
    }

    if (invitation.status !== 'PENDING') {
      throw ApiError.badRequest('This invitation has already been responded to');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' },
      });
      throw ApiError.badRequest('This invitation has expired');
    }

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
    });

    if (accept) {
      // Add user as member
      await prisma.planMember.upsert({
        where: {
          planId_userId: { planId: invitation.planId, userId },
        },
        update: {
          status: 'ACTIVE',
          role: 'MEMBER',
        },
        create: {
          planId: invitation.planId,
          userId,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });

      // Notify sender
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true, username: true },
      });

      await notificationService.createNotification(invitation.senderId, {
        type: 'MEMBER_JOINED',
        title: 'Invitation accepted',
        body: `${user.displayName || user.username} accepted your invitation to "${invitation.plan.name}"`,
        data: { planId: invitation.planId },
      });

      return { message: 'Invitation accepted', planId: invitation.planId };
    }

    return { message: 'Invitation declined' };
  }

  /**
   * Cancel invitation (by sender)
   */
  async cancelInvitation(invitationId, userId) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw ApiError.notFound('Invitation not found');
    }

    if (invitation.senderId !== userId) {
      throw ApiError.forbidden('You can only cancel invitations you sent');
    }

    if (invitation.status !== 'PENDING') {
      throw ApiError.badRequest('This invitation cannot be cancelled');
    }

    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    return { message: 'Invitation cancelled' };
  }

  /**
   * Request to join a public plan
   */
  async requestToJoin(planId, userId, message) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    if (plan.type !== 'PUBLIC') {
      throw ApiError.forbidden('This plan is private');
    }

    if (plan.status !== 'ACTIVE') {
      throw ApiError.badRequest('This plan is no longer active');
    }

    // Check if already a member
    const existingMembership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (existingMembership && existingMembership.status === 'ACTIVE') {
      throw ApiError.conflict('You are already a member of this plan');
    }

    // Check for existing pending request
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (existingRequest && existingRequest.status === 'PENDING') {
      throw ApiError.conflict('You already have a pending request');
    }

    // Create or update join request
    const request = await prisma.joinRequest.upsert({
      where: {
        planId_userId: { planId, userId },
      },
      update: {
        message,
        status: 'PENDING',
      },
      create: {
        planId,
        userId,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Notify plan owner
    await notificationService.createNotification(plan.ownerId, {
      type: 'JOIN_REQUEST',
      title: 'Join request',
      body: `${request.user.displayName || request.user.username} requested to join "${plan.name}"`,
      data: { planId, requestId: request.id },
    });

    return request;
  }

  /**
   * Get join requests for a plan
   */
  async getJoinRequests(planId, userId, { page = 1, limit = 20, status }) {
    // Verify user is admin/owner
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE' || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw ApiError.forbidden('Only admins can view join requests');
    }

    const where = { planId };
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.joinRequest.findMany({
        where,
        include: {
          user: {
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
      prisma.joinRequest.count({ where }),
    ]);

    return paginationResponse(requests, total, page, limit);
  }

  /**
   * Respond to join request (approve/reject)
   */
  async respondToJoinRequest(requestId, userId, approve) {
    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!request) {
      throw ApiError.notFound('Join request not found');
    }

    // Verify user is admin/owner
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId: request.planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE' || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw ApiError.forbidden('Only admins can respond to join requests');
    }

    if (request.status !== 'PENDING') {
      throw ApiError.badRequest('This request has already been processed');
    }

    // Update request status
    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: approve ? 'APPROVED' : 'REJECTED' },
    });

    if (approve) {
      // Add user as member
      await prisma.planMember.upsert({
        where: {
          planId_userId: { planId: request.planId, userId: request.userId },
        },
        update: {
          status: 'ACTIVE',
          role: 'MEMBER',
        },
        create: {
          planId: request.planId,
          userId: request.userId,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });

      // Notify the requester
      await notificationService.createNotification(request.userId, {
        type: 'JOIN_APPROVED',
        title: 'Join request approved',
        body: `Your request to join "${request.plan.name}" has been approved!`,
        data: { planId: request.planId },
      });

      return { message: 'Request approved' };
    }

    // Notify the requester of rejection
    await notificationService.createNotification(request.userId, {
      type: 'JOIN_REJECTED',
      title: 'Join request declined',
      body: `Your request to join "${request.plan.name}" was declined`,
      data: { planId: request.planId },
    });

    return { message: 'Request rejected' };
  }
}

module.exports = new InvitationService();
