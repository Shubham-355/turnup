const expenseService = require('../services/expense.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/plans/:planId/expenses
 * @desc    Create a new expense
 * @access  Private (Member)
 */
const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(
    req.params.planId,
    req.user.id,
    req.body
  );

  ApiResponse.created(expense, 'Expense created successfully').send(res);
});

/**
 * @route   GET /api/plans/:planId/expenses
 * @desc    Get expenses for a plan
 * @access  Private (Member)
 */
const getPlanExpenses = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const expenses = await expenseService.getPlanExpenses(req.params.planId, req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  ApiResponse.success(expenses).send(res);
});

/**
 * @route   GET /api/expenses/:expenseId
 * @desc    Get expense by ID
 * @access  Private (Member)
 */
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.expenseId, req.user.id);

  ApiResponse.success(expense).send(res);
});

/**
 * @route   PUT /api/expenses/:expenseId
 * @desc    Update expense
 * @access  Private (Payer)
 */
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(
    req.params.expenseId,
    req.user.id,
    req.body
  );

  ApiResponse.success(expense, 'Expense updated successfully').send(res);
});

/**
 * @route   DELETE /api/expenses/:expenseId
 * @desc    Delete expense
 * @access  Private (Payer/Owner)
 */
const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.params.expenseId, req.user.id);

  ApiResponse.success(null, 'Expense deleted successfully').send(res);
});

/**
 * @route   POST /api/expenses/:expenseId/settle/:userId
 * @desc    Mark share as settled
 * @access  Private (Payer)
 */
const settleShare = asyncHandler(async (req, res) => {
  const share = await expenseService.settleShare(
    req.params.expenseId,
    req.params.userId,
    req.user.id
  );

  ApiResponse.success(share, 'Share settled successfully').send(res);
});

/**
 * @route   GET /api/plans/:planId/expenses/summary
 * @desc    Get expense summary for a plan
 * @access  Private (Member)
 */
const getPlanExpenseSummary = asyncHandler(async (req, res) => {
  const summary = await expenseService.getPlanExpenseSummary(req.params.planId, req.user.id);

  ApiResponse.success(summary).send(res);
});

/**
 * @route   GET /api/plans/:planId/expenses/debts
 * @desc    Get what current user owes to others
 * @access  Private (Member)
 */
const getUserDebts = asyncHandler(async (req, res) => {
  const debts = await expenseService.getUserDebts(req.params.planId, req.user.id);

  ApiResponse.success(debts).send(res);
});

module.exports = {
  createExpense,
  getPlanExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  settleShare,
  getPlanExpenseSummary,
  getUserDebts,
};
