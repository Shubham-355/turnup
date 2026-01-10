const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

class ActivityService {
  /**
   * Create a new activity
   */
  async createActivity(planId, userId, data) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    // Get the highest order number for the plan
    const lastActivity = await prisma.activity.findFirst({
      where: { planId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (lastActivity?.order ?? -1) + 1;

    const {
      name,
      description,
      date,
      time,
      locationName,
      locationAddress,
      latitude,
      longitude,
      placeId,
    } = data;

    const activity = await prisma.activity.create({
      data: {
        planId,
        name,
        description,
        date: date ? new Date(date) : null,
        time,
        order,
        locationName,
        locationAddress,
        latitude,
        longitude,
        placeId,
      },
    });

    // Notify other members
    const members = await prisma.planMember.findMany({
      where: {
        planId,
        status: 'ACTIVE',
        userId: { not: userId },
      },
      select: { userId: true },
    });

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { name: true },
    });

    for (const member of members) {
      await notificationService.createNotification(member.userId, {
        type: 'NEW_ACTIVITY',
        title: 'New activity added',
        body: `"${name}" was added to ${plan.name}`,
        data: { planId, activityId: activity.id },
      });
    }

    return activity;
  }

  /**
   * Get activities for a plan
   */
  async getPlanActivities(planId, userId) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const activities = await prisma.activity.findMany({
      where: { planId },
      orderBy: [{ date: 'asc' }, { order: 'asc' }],
      include: {
        _count: {
          select: {
            expenses: true,
            media: true,
          },
        },
      },
    });

    return activities;
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId, userId) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        plan: {
          include: {
            members: {
              where: {
                userId,
                status: 'ACTIVE',
              },
            },
          },
        },
        expenses: {
          include: {
            paidBy: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        media: {
          include: {
            uploader: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!activity) {
      throw ApiError.notFound('Activity not found');
    }

    if (activity.plan.members.length === 0) {
      throw ApiError.forbidden('You do not have access to this activity');
    }

    return activity;
  }

  /**
   * Update activity
   */
  async updateActivity(activityId, userId, data) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        plan: {
          include: {
            members: {
              where: {
                userId,
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    if (!activity) {
      throw ApiError.notFound('Activity not found');
    }

    if (activity.plan.members.length === 0) {
      throw ApiError.forbidden('You do not have access to this activity');
    }

    const {
      name,
      description,
      date,
      time,
      locationName,
      locationAddress,
      latitude,
      longitude,
      placeId,
    } = data;

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined,
        time,
        locationName,
        locationAddress,
        latitude,
        longitude,
        placeId,
      },
    });

    return updatedActivity;
  }

  /**
   * Delete activity
   */
  async deleteActivity(activityId, userId) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        plan: {
          include: {
            members: {
              where: {
                userId,
                status: 'ACTIVE',
                role: { in: ['OWNER', 'ADMIN'] },
              },
            },
          },
        },
      },
    });

    if (!activity) {
      throw ApiError.notFound('Activity not found');
    }

    // Members can delete, but we could restrict to admin/owner if needed
    if (activity.plan.members.length === 0) {
      const membership = await prisma.planMember.findUnique({
        where: {
          planId_userId: { planId: activity.planId, userId },
        },
      });

      if (!membership || membership.status !== 'ACTIVE') {
        throw ApiError.forbidden('You do not have permission to delete this activity');
      }
    }

    await prisma.activity.delete({
      where: { id: activityId },
    });

    return { message: 'Activity deleted successfully' };
  }

  /**
   * Reorder activities
   */
  async reorderActivities(planId, userId, activityIds) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    // Update order for each activity
    const updates = activityIds.map((id, index) =>
      prisma.activity.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    const activities = await prisma.activity.findMany({
      where: { planId },
      orderBy: { order: 'asc' },
    });

    return activities;
  }
}

module.exports = new ActivityService();
