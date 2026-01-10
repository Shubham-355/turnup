const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, username, displayName } = req.body;

  const result = await authService.register({
    email,
    password,
    username,
    displayName,
  });

  ApiResponse.created(result, 'User registered successfully').send(res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  ApiResponse.success(result, 'Login successful').send(res);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  ApiResponse.success(user).send(res);
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);

  ApiResponse.success(user, 'Profile updated successfully').send(res);
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);

  ApiResponse.success(result).send(res);
});

/**
 * @route   GET /api/auth/search
 * @desc    Search users
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const users = await authService.searchUsers(req.query.q, req.user.id);

  ApiResponse.success(users).send(res);
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  searchUsers,
};
