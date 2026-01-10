const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  searchPlacesValidation,
  getPlaceDetailsValidation,
  getDirectionsValidation,
} = require('../validators/location.validator');

// All routes require authentication
router.use(authenticate);

// Map/Places API routes
router.get('/search', searchPlacesValidation, validate, locationController.searchPlaces);
router.get('/place/:placeId', getPlaceDetailsValidation, validate, locationController.getPlaceDetails);
router.get('/directions', getDirectionsValidation, validate, locationController.getDirections);

module.exports = router;
