const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitation.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  getInvitationsValidation,
  respondToInvitationValidation,
  respondToJoinRequestValidation,
} = require('../validators/invitation.validator');

// All routes require authentication
router.use(authenticate);

// User's received invitations
router.get('/', getInvitationsValidation, validate, invitationController.getReceivedInvitations);

// Respond to invitation
router.post('/:invitationId/respond', respondToInvitationValidation, validate, invitationController.respondToInvitation);

// Cancel invitation
router.delete('/:invitationId', invitationController.cancelInvitation);

module.exports = router;
