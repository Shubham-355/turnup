const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { deleteMessageValidation } = require('../validators/chat.validator');

// All routes require authentication
router.use(authenticate);

// Message routes (standalone)
router.delete('/:messageId', deleteMessageValidation, validate, chatController.deleteMessage);

module.exports = router;
