const prisma = require('../config/database');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const { paginate, paginationResponse } = require('../utils/helpers');

class MediaService {
  /**
   * Upload media to Cloudinary
   */
  async uploadMedia(planId, userId, file, data = {}) {
    const { activityId, caption } = data;

    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    // Verify activity belongs to plan if provided
    if (activityId) {
      const activity = await prisma.activity.findFirst({
        where: { id: activityId, planId },
      });

      if (!activity) {
        throw ApiError.notFound('Activity not found in this plan');
      }
    }

    // Determine media type
    const isVideo = file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const mediaType = isVideo ? 'VIDEO' : 'IMAGE';

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `turnup/plans/${planId}`,
          resource_type: resourceType,
          transformation: isVideo
            ? [{ quality: 'auto', fetch_format: 'auto' }]
            : [{ quality: 'auto', fetch_format: 'auto', width: 1920, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    // Generate thumbnail for videos
    let thumbnail = null;
    if (isVideo) {
      thumbnail = cloudinary.url(uploadResult.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [{ width: 400, crop: 'scale' }, { start_offset: '0' }],
      });
    }

    // Save to database
    const media = await prisma.media.create({
      data: {
        planId,
        activityId,
        uploaderId: userId,
        type: mediaType,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        thumbnail,
        caption,
      },
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
    });

    return media;
  }

  /**
   * Upload multiple media files
   */
  async uploadMultipleMedia(planId, userId, files, data = {}) {
    const results = [];

    for (const file of files) {
      const media = await this.uploadMedia(planId, userId, file, data);
      results.push(media);
    }

    return results;
  }

  /**
   * Get media for a plan
   */
  async getPlanMedia(planId, userId, { page = 1, limit = 20, type }) {
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
    if (type) {
      where.type = type;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          activity: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.media.count({ where }),
    ]);

    return paginationResponse(media, total, page, limit);
  }

  /**
   * Get media for an activity
   */
  async getActivityMedia(activityId, userId) {
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

    const media = await prisma.media.findMany({
      where: { activityId },
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
    });

    return media;
  }

  /**
   * Delete media
   */
  async deleteMedia(mediaId, userId) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
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

    if (!media) {
      throw ApiError.notFound('Media not found');
    }

    // Check if user is uploader or admin/owner
    const isUploader = media.uploaderId === userId;
    const isAdmin = media.plan.members.length > 0;

    if (!isUploader && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to delete this media');
    }

    // Delete from Cloudinary
    try {
      const resourceType = media.type === 'VIDEO' ? 'video' : 'image';
      await cloudinary.uploader.destroy(media.publicId, { resource_type: resourceType });
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId },
    });

    return { message: 'Media deleted successfully' };
  }

  /**
   * Update media caption
   */
  async updateMediaCaption(mediaId, userId, caption) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw ApiError.notFound('Media not found');
    }

    if (media.uploaderId !== userId) {
      throw ApiError.forbidden('You can only edit your own media');
    }

    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: { caption },
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
    });

    return updatedMedia;
  }
}

module.exports = new MediaService();
