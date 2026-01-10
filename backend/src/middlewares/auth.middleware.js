const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token is required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired');
    }
    throw error;
  }
});

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        isVerified: true,
      },
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
});

/**
 * Check if user is a member of a plan
 */
const isPlanMember = asyncHandler(async (req, res, next) => {
  const planId = req.params.planId || req.body.planId;
  const userId = req.user.id;

  if (!planId) {
    throw ApiError.badRequest('Plan ID is required');
  }

  const membership = await prisma.planMember.findUnique({
    where: {
      planId_userId: { planId, userId },
    },
  });

  if (!membership || membership.status !== 'ACTIVE') {
    throw ApiError.forbidden('You are not a member of this plan');
  }

  req.membership = membership;
  next();
});

/**
 * Check if user is plan owner or admin
 */
const isPlanAdmin = asyncHandler(async (req, res, next) => {
  const planId = req.params.planId || req.body.planId;
  const userId = req.user.id;

  if (!planId) {
    throw ApiError.badRequest('Plan ID is required');
  }

  const membership = await prisma.planMember.findUnique({
    where: {
      planId_userId: { planId, userId },
    },
  });

  if (!membership || membership.status !== 'ACTIVE') {
    throw ApiError.forbidden('You are not a member of this plan');
  }

  if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
    throw ApiError.forbidden('Admin access required');
  }

  req.membership = membership;
  next();
});

/**
 * Check if user is plan owner
 */
const isPlanOwner = asyncHandler(async (req, res, next) => {
  const planId = req.params.planId || req.body.planId;
  const userId = req.user.id;

  if (!planId) {
    throw ApiError.badRequest('Plan ID is required');
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw ApiError.notFound('Plan not found');
  }

  if (plan.ownerId !== userId) {
    throw ApiError.forbidden('Owner access required');
  }

  req.plan = plan;
  next();
});

module.exports = {
  authenticate,
  optionalAuth,
  isPlanMember,
  isPlanAdmin,
  isPlanOwner,
};
