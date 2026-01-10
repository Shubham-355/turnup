const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const chatService = require('../services/chat.service');

/**
 * Socket.IO configuration and event handlers
 */
const configureSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Join plan room
    socket.on('join_plan', async (planId) => {
      try {
        // Verify membership
        const membership = await prisma.planMember.findUnique({
          where: {
            planId_userId: { planId, userId: socket.user.id },
          },
        });

        if (!membership || membership.status !== 'ACTIVE') {
          socket.emit('error', { message: 'Not a member of this plan' });
          return;
        }

        socket.join(`plan:${planId}`);
        socket.planId = planId;
        console.log(`${socket.user.username} joined plan: ${planId}`);

        // Notify others
        socket.to(`plan:${planId}`).emit('user_joined', {
          user: socket.user,
          planId,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join plan' });
      }
    });

    // Leave plan room
    socket.on('leave_plan', (planId) => {
      socket.leave(`plan:${planId}`);
      socket.to(`plan:${planId}`).emit('user_left', {
        user: socket.user,
        planId,
      });
      console.log(`${socket.user.username} left plan: ${planId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { planId, content, type, metadata } = data;

        const message = await chatService.sendMessage(planId, socket.user.id, {
          content,
          type,
          metadata,
        });

        io.to(`plan:${planId}`).emit('new_message', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', (planId) => {
      socket.to(`plan:${planId}`).emit('user_typing', {
        user: socket.user,
        planId,
      });
    });

    socket.on('typing_stop', (planId) => {
      socket.to(`plan:${planId}`).emit('user_stopped_typing', {
        user: socket.user,
        planId,
      });
    });

    // Update location
    socket.on('update_location', async (data) => {
      try {
        const { planId, latitude, longitude } = data;

        // Verify membership
        const membership = await prisma.planMember.findUnique({
          where: {
            planId_userId: { planId, userId: socket.user.id },
          },
        });

        if (!membership || membership.status !== 'ACTIVE') {
          return;
        }

        // Upsert location
        await prisma.userLocation.upsert({
          where: {
            userId_planId: { userId: socket.user.id, planId },
          },
          update: {
            latitude,
            longitude,
          },
          create: {
            userId: socket.user.id,
            planId,
            latitude,
            longitude,
          },
        });

        // Broadcast to plan members
        socket.to(`plan:${planId}`).emit('location_updated', {
          user: socket.user,
          latitude,
          longitude,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
      if (socket.planId) {
        socket.to(`plan:${socket.planId}`).emit('user_left', {
          user: socket.user,
          planId: socket.planId,
        });
      }
    });
  });

  return io;
};

module.exports = configureSocket;
