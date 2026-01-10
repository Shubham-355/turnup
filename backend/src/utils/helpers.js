const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique invite code for plans
 */
const generateInviteCode = () => {
  return uuidv4().split('-')[0].toUpperCase();
};

/**
 * Generate a short unique ID
 */
const generateShortId = () => {
  return uuidv4().split('-').slice(0, 2).join('');
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: limit,
  };
};

/**
 * Build pagination response
 */
const paginationResponse = (data, total, page, limit) => {
  return {
    items: data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

module.exports = {
  generateInviteCode,
  generateShortId,
  calculateDistance,
  paginate,
  paginationResponse,
};
