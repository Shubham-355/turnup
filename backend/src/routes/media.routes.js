const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { deleteMediaValidation, updateMediaCaptionValidation } = require('../validators/media.validator');

// All routes require authentication
router.use(authenticate);

// Media routes (standalone)
router.delete('/:mediaId', deleteMediaValidation, validate, mediaController.deleteMedia);
router.put('/:mediaId/caption', updateMediaCaptionValidation, validate, mediaController.updateMediaCaption);

module.exports = router;
