const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { generateInviteCode, paginate, paginationResponse } = require('../utils/helpers');
const notificationService = require('./notification.service');

class PlanService {
  /**
   * Create a new plan
   */
  async createPlan(userId, data) {
    const { name, description, category, type, coverImage, startDate, endDate } = data;

    const inviteCode = generateInviteCode();

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        category,
        type: type || 'PRIVATE',
        coverImage,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        inviteCode,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            activities: true,
            members: true,
          },
        },
      },
    });

    return plan;
  }

  /**
   * Get all plans for a user
   */
  async getUserPlans(userId, { status, category, page = 1, limit = 20 }) {
    const where = {
      members: {
        some: {
          userId,
          status: 'ACTIVE',
        },
      },
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              activities: true,
              members: { where: { status: 'ACTIVE' } },
              messages: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.plan.count({ where }),
    ]);

    return paginationResponse(plans, total, page, limit);
  }

  /**
   * Get public plans (for discovery)
   */
  async getPublicPlans({ category, search, page = 1, limit = 20 }) {
    const where = {
      type: 'PUBLIC',
      status: 'ACTIVE',
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              activities: true,
              members: { where: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.plan.count({ where }),
    ]);

    return paginationResponse(plans, total, page, limit);
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId, userId) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        members: {
          where: { status: 'ACTIVE' },
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
        },
        activities: {
          orderBy: [{ date: 'asc' }, { order: 'asc' }],
        },
        _count: {
          select: {
            activities: true,
            members: { where: { status: 'ACTIVE' } },
            messages: true,
            expenses: true,
            media: true,
          },
        },
      },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    // Check access
    const isMember = plan.members.some((m) => m.userId === userId);
    
    if (plan.type === 'PRIVATE' && !isMember) {
      throw ApiError.forbidden('You do not have access to this plan');
    }

    return plan;
  }

  /**
   * Get plan by invite code
   */
  async getPlanByInviteCode(inviteCode) {
    const plan = await prisma.plan.findUnique({
      where: { inviteCode },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            activities: true,
            members: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    return plan;
  }

  /**
   * Update plan
   */
  async updatePlan(planId, userId, data) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        members: {
          where: {
            userId,
            status: 'ACTIVE',
            role: { in: ['OWNER', 'ADMIN'] },
          },
        },
      },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    if (plan.members.length === 0) {
      throw ApiError.forbidden('You do not have permission to update this plan');
    }

    const { name, description, category, type, coverImage, status, startDate, endDate } = data;

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name,
        description,
        category,
        type,
        coverImage,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            activities: true,
            members: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    return updatedPlan;
  }

  /**
   * Delete plan
   */
  async deletePlan(planId, userId) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    if (plan.ownerId !== userId) {
      throw ApiError.forbidden('Only the owner can delete the plan');
    }

    await prisma.plan.delete({
      where: { id: planId },
    });

    return { message: 'Plan deleted successfully' };
  }

  /**
   * Get plan members
   */
  async getPlanMembers(planId) {
    const members = await prisma.planMember.findMany({
      where: {
        planId,
        status: 'ACTIVE',
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
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    return members;
  }

  /**
   * Update member role
   */
  async updateMemberRole(planId, memberId, role, userId) {
    // Check if requester is owner
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.ownerId !== userId) {
      throw ApiError.forbidden('Only the owner can change member roles');
    }

    // Cannot change owner role
    if (memberId === userId) {
      throw ApiError.badRequest('Cannot change your own role');
    }

    const member = await prisma.planMember.update({
      where: {
        planId_userId: { planId, userId: memberId },
      },
      data: { role },
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

    return member;
  }

  /**
   * Remove member from plan
   */
  async removeMember(planId, memberId, userId) {
    // Check if requester is owner or admin
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw ApiError.forbidden('You do not have permission to remove members');
    }

    // Cannot remove owner
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (plan.ownerId === memberId) {
      throw ApiError.badRequest('Cannot remove the plan owner');
    }

    // Admin cannot remove other admins
    const targetMember = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId: memberId },
      },
    });

    if (membership.role === 'ADMIN' && targetMember.role === 'ADMIN') {
      throw ApiError.forbidden('Admins cannot remove other admins');
    }

    await prisma.planMember.update({
      where: {
        planId_userId: { planId, userId: memberId },
      },
      data: { status: 'REMOVED' },
    });

    // Notify removed member
    await notificationService.createNotification(memberId, {
      type: 'MEMBER_LEFT',
      title: 'Removed from plan',
      body: `You have been removed from ${plan.name}`,
      data: { planId },
    });

    return { message: 'Member removed successfully' };
  }

  /**
   * Leave plan
   */
  async leavePlan(planId, userId) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    // Owner cannot leave
    if (plan.ownerId === userId) {
      throw ApiError.badRequest('Owner cannot leave the plan. Transfer ownership or delete the plan.');
    }

    await prisma.planMember.update({
      where: {
        planId_userId: { planId, userId },
      },
      data: { status: 'LEFT' },
    });

    return { message: 'You have left the plan' };
  }

  /**
   * Join plan via invite code (for private plans)
   */
  async joinByInviteCode(inviteCode, userId) {
    const plan = await prisma.plan.findUnique({
      where: { inviteCode },
    });

    if (!plan) {
      throw ApiError.notFound('Invalid invite code');
    }

    if (plan.status !== 'ACTIVE') {
      throw ApiError.badRequest('This plan is no longer active');
    }

    // Check if already a member
    const existingMembership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId: plan.id, userId },
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        throw ApiError.conflict('You are already a member of this plan');
      }
      // Rejoin if previously left
      await prisma.planMember.update({
        where: { id: existingMembership.id },
        data: { status: 'ACTIVE', role: 'MEMBER' },
      });
    } else {
      await prisma.planMember.create({
        data: {
          planId: plan.id,
          userId,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });
    }

    // Notify owner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true },
    });

    await notificationService.createNotification(plan.ownerId, {
      type: 'MEMBER_JOINED',
      title: 'New member joined',
      body: `${user.displayName || user.username} joined ${plan.name}`,
      data: { planId: plan.id },
    });

    return { message: 'Successfully joined the plan', planId: plan.id };
  }

  /**
   * Regenerate invite code
   */
  async regenerateInviteCode(planId, userId) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.ownerId !== userId) {
      throw ApiError.forbidden('Only the owner can regenerate the invite code');
    }

    const newInviteCode = generateInviteCode();

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: { inviteCode: newInviteCode },
      select: { inviteCode: true },
    });

    return updatedPlan;
  }
}

module.exports = new PlanService();
