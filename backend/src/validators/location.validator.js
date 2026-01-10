const { body, param, query } = require('express-validator');

const updateLocationValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

const getLocationsValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
];

const searchPlacesValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

const getPlaceDetailsValidation = [
  param('placeId')
    .notEmpty()
    .withMessage('Place ID is required'),
];

const getDirectionsValidation = [
  query('originLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Origin latitude must be between -90 and 90'),
  query('originLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Origin longitude must be between -180 and 180'),
  query('destLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Destination latitude must be between -90 and 90'),
  query('destLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Destination longitude must be between -180 and 180'),
];

module.exports = {
  updateLocationValidation,
  getLocationsValidation,
  searchPlacesValidation,
  getPlaceDetailsValidation,
  getDirectionsValidation,
};
