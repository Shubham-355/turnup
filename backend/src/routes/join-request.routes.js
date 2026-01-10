const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitation.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { respondToJoinRequestValidation } = require('../validators/invitation.validator');

// All routes require authentication
router.use(authenticate);

// Respond to join request
router.post('/:requestId/respond', respondToJoinRequestValidation, validate, invitationController.respondToJoinRequest);

module.exports = router;
