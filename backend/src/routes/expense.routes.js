const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  updateExpenseValidation,
  getExpenseValidation,
  settleShareValidation,
} = require('../validators/expense.validator');

// All routes require authentication
router.use(authenticate);

// Expense routes (standalone)
router.get('/:expenseId', getExpenseValidation, validate, expenseController.getExpenseById);
router.put('/:expenseId', updateExpenseValidation, validate, expenseController.updateExpense);
router.delete('/:expenseId', getExpenseValidation, validate, expenseController.deleteExpense);
router.post('/:expenseId/settle/:userId', settleShareValidation, validate, expenseController.settleShare);

module.exports = router;
