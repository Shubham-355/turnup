require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV,
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  // Map API
  mapApiKey: process.env.MAP_API_KEY,
  locationIqKey: process.env.LOCATIONIQ_API_KEY,
  maptilerKey: process.env.MAPTILER_API_KEY,
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8081',
};
