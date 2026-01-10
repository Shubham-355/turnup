const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const planRoutes = require('./plan.routes');
const activityRoutes = require('./activity.routes');
const chatRoutes = require('./chat.routes');
const mediaRoutes = require('./media.routes');
const expenseRoutes = require('./expense.routes');
const locationRoutes = require('./location.routes');
const invitationRoutes = require('./invitation.routes');
const notificationRoutes = require('./notification.routes');
const joinRequestRoutes = require('./join-request.routes');

// Import controllers for nested routes
const activityController = require('../controllers/activity.controller');
const chatController = require('../controllers/chat.controller');
const mediaController = require('../controllers/media.controller');
const expenseController = require('../controllers/expense.controller');
const locationController = require('../controllers/location.controller');
const invitationController = require('../controllers/invitation.controller');

// Import middlewares
const { authenticate, isPlanMember } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

// Import validators
const { createActivityValidation, reorderActivitiesValidation } = require('../validators/activity.validator');
const { sendMessageValidation, getMessagesValidation } = require('../validators/chat.validator');
const { uploadMediaValidation, getMediaValidation } = require('../validators/media.validator');
const { createExpenseValidation, getExpensesValidation } = require('../validators/expense.validator');
const { updateLocationValidation, getLocationsValidation } = require('../validators/location.validator');
const { sendInvitationValidation, requestToJoinValidation, getJoinRequestsValidation } = require('../validators/invitation.validator');

// Base routes
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/activities', activityRoutes);
router.use('/messages', chatRoutes);
router.use('/media', mediaRoutes);
router.use('/expenses', expenseRoutes);
router.use('/maps', locationRoutes);
router.use('/invitations', invitationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/join-requests', joinRequestRoutes);

// Nested plan routes
// Activities under plans
router.post(
  '/plans/:planId/activities',
  authenticate,
  createActivityValidation,
  validate,
  activityController.createActivity
);
router.get(
  '/plans/:planId/activities',
  authenticate,
  activityController.getPlanActivities
);
router.put(
  '/plans/:planId/activities/reorder',
  authenticate,
  reorderActivitiesValidation,
  validate,
  activityController.reorderActivities
);

// Messages under plans
router.post(
  '/plans/:planId/messages',
  authenticate,
  sendMessageValidation,
  validate,
  chatController.sendMessage
);
router.get(
  '/plans/:planId/messages',
  authenticate,
  getMessagesValidation,
  validate,
  chatController.getMessages
);

// Media under plans
router.post(
  '/plans/:planId/media',
  authenticate,
  upload.single('file'),
  uploadMediaValidation,
  validate,
  mediaController.uploadMedia
);
router.post(
  '/plans/:planId/media/multiple',
  authenticate,
  upload.array('files', 10),
  uploadMediaValidation,
  validate,
  mediaController.uploadMultipleMedia
);
router.get(
  '/plans/:planId/media',
  authenticate,
  getMediaValidation,
  validate,
  mediaController.getPlanMedia
);

// Expenses under plans
router.post(
  '/plans/:planId/expenses',
  authenticate,
  createExpenseValidation,
  validate,
  expenseController.createExpense
);
router.get(
  '/plans/:planId/expenses',
  authenticate,
  getExpensesValidation,
  validate,
  expenseController.getPlanExpenses
);
router.get(
  '/plans/:planId/expenses/summary',
  authenticate,
  expenseController.getPlanExpenseSummary
);
router.get(
  '/plans/:planId/expenses/debts',
  authenticate,
  expenseController.getUserDebts
);

// Locations under plans
router.put(
  '/plans/:planId/location',
  authenticate,
  updateLocationValidation,
  validate,
  locationController.updateUserLocation
);
router.get(
  '/plans/:planId/locations',
  authenticate,
  getLocationsValidation,
  validate,
  locationController.getPlanMemberLocations
);
router.get(
  '/plans/:planId/route',
  authenticate,
  locationController.getActivityRoute
);
router.delete(
  '/plans/:planId/location',
  authenticate,
  locationController.deleteUserLocation
);

// Invitations under plans
router.post(
  '/plans/:planId/invitations',
  authenticate,
  sendInvitationValidation,
  validate,
  invitationController.sendInvitation
);
router.get(
  '/plans/:planId/invitations',
  authenticate,
  invitationController.getSentInvitations
);

// Join requests under plans
router.post(
  '/plans/:planId/join-request',
  authenticate,
  requestToJoinValidation,
  validate,
  invitationController.requestToJoin
);
router.get(
  '/plans/:planId/join-requests',
  authenticate,
  getJoinRequestsValidation,
  validate,
  invitationController.getJoinRequests
);

// Media under activities
router.get(
  '/activities/:activityId/media',
  authenticate,
  mediaController.getActivityMedia
);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
