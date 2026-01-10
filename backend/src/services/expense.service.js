const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { paginate, paginationResponse } = require('../utils/helpers');
const notificationService = require('./notification.service');

class ExpenseService {
  /**
   * Create a new expense
   */
  async createExpense(planId, userId, data) {
    const { activityId, title, description, amount, currency, splitType, receipt, shares } = data;

    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    // Verify activity belongs to plan if provided
    if (activityId) {
      const activity = await prisma.activity.findFirst({
        where: { id: activityId, planId },
      });

      if (!activity) {
        throw ApiError.notFound('Activity not found in this plan');
      }
    }

    // Get plan members for splitting
    const members = await prisma.planMember.findMany({
      where: {
        planId,
        status: 'ACTIVE',
      },
      select: { userId: true },
    });

    // Calculate shares based on split type
    let expenseShares = [];

    if (splitType === 'EQUAL') {
      const shareAmount = amount / members.length;
      expenseShares = members.map((member) => ({
        userId: member.userId,
        amount: shareAmount,
        isPaid: member.userId === userId, // Payer's share is marked as paid
      }));
    } else if (splitType === 'CUSTOM' && shares) {
      // Validate custom shares
      const totalShares = shares.reduce((sum, share) => sum + share.amount, 0);
      if (Math.abs(totalShares - amount) > 0.01) {
        throw ApiError.badRequest('Share amounts must equal total expense amount');
      }
      expenseShares = shares.map((share) => ({
        userId: share.userId,
        amount: share.amount,
        isPaid: share.userId === userId,
      }));
    } else if (splitType === 'BY_ITEM' && shares) {
      expenseShares = shares.map((share) => ({
        userId: share.userId,
        amount: share.amount,
        isPaid: share.userId === userId,
      }));
    }

    // Create expense with shares
    const expense = await prisma.expense.create({
      data: {
        planId,
        activityId,
        paidById: userId,
        title,
        description,
        amount,
        currency: currency || 'USD',
        splitType: splitType || 'EQUAL',
        receipt,
        shares: {
          create: expenseShares,
        },
      },
      include: {
        paidBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify members about new expense
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { name: true },
    });

    for (const share of expense.shares) {
      if (share.userId !== userId) {
        await notificationService.createNotification(share.userId, {
          type: 'NEW_EXPENSE',
          title: 'New expense added',
          body: `${expense.paidBy.displayName || expense.paidBy.username} added "${title}" - You owe ${currency || 'USD'} ${share.amount.toFixed(2)}`,
          data: { planId, expenseId: expense.id },
        });
      }
    }

    return expense;
  }

  /**
   * Get expenses for a plan
   */
  async getPlanExpenses(planId, userId, { page = 1, limit = 20 }) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const where = { planId };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          paidBy: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          shares: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                },
              },
            },
          },
          activity: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.expense.count({ where }),
    ]);

    return paginationResponse(expenses, total, page, limit);
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId, userId) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        paidBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
        plan: {
          include: {
            members: {
              where: {
                userId,
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    if (expense.plan.members.length === 0) {
      throw ApiError.forbidden('You do not have access to this expense');
    }

    return expense;
  }

  /**
   * Update expense
   */
  async updateExpense(expenseId, userId, data) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    if (expense.paidById !== userId) {
      throw ApiError.forbidden('Only the person who paid can edit the expense');
    }

    const { title, description, amount, currency, splitType, receipt, shares } = data;

    // If amount or split type changed, recalculate shares
    if (amount !== undefined || splitType !== undefined || shares !== undefined) {
      // Delete existing shares
      await prisma.expenseShare.deleteMany({
        where: { expenseId },
      });

      // Get plan members
      const members = await prisma.planMember.findMany({
        where: {
          planId: expense.planId,
          status: 'ACTIVE',
        },
        select: { userId: true },
      });

      const newAmount = amount || expense.amount;
      const newSplitType = splitType || expense.splitType;

      let expenseShares = [];

      if (newSplitType === 'EQUAL') {
        const shareAmount = newAmount / members.length;
        expenseShares = members.map((member) => ({
          expenseId,
          userId: member.userId,
          amount: shareAmount,
          isPaid: member.userId === userId,
        }));
      } else if ((newSplitType === 'CUSTOM' || newSplitType === 'BY_ITEM') && shares) {
        expenseShares = shares.map((share) => ({
          expenseId,
          userId: share.userId,
          amount: share.amount,
          isPaid: share.userId === userId,
        }));
      }

      // Create new shares
      await prisma.expenseShare.createMany({
        data: expenseShares,
      });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        title,
        description,
        amount,
        currency,
        splitType,
        receipt,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return updatedExpense;
  }

  /**
   * Delete expense
   */
  async deleteExpense(expenseId, userId) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        plan: {
          select: { ownerId: true },
        },
      },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    // Only payer or plan owner can delete
    if (expense.paidById !== userId && expense.plan.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this expense');
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return { message: 'Expense deleted successfully' };
  }

  /**
   * Mark share as paid/settled
   */
  async settleShare(expenseId, shareUserId, userId) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    // Only the payer can mark shares as settled
    if (expense.paidById !== userId) {
      throw ApiError.forbidden('Only the person who paid can settle shares');
    }

    const share = await prisma.expenseShare.update({
      where: {
        expenseId_userId: { expenseId, userId: shareUserId },
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Notify the user
    await notificationService.createNotification(shareUserId, {
      type: 'EXPENSE_SETTLED',
      title: 'Expense settled',
      body: `Your share for "${expense.title}" has been marked as paid`,
      data: { planId: expense.planId, expenseId },
    });

    return share;
  }

  /**
   * Get expense summary for a plan
   */
  async getPlanExpenseSummary(planId, userId) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    // Get all expenses for the plan
    const expenses = await prisma.expense.findMany({
      where: { planId },
      include: {
        shares: true,
        paidBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Calculate total spent
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate balances for each member
    const members = await prisma.planMember.findMany({
      where: {
        planId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    const balances = members.map((member) => {
      const userId = member.userId;
      
      // Amount paid by this user
      const paid = expenses
        .filter((e) => e.paidById === userId)
        .reduce((sum, e) => sum + e.amount, 0);

      // Amount owed by this user
      const owed = expenses.reduce((sum, expense) => {
        const share = expense.shares.find((s) => s.userId === userId);
        return sum + (share?.amount || 0);
      }, 0);

      // Amount still to be paid
      const outstanding = expenses.reduce((sum, expense) => {
        const share = expense.shares.find((s) => s.userId === userId);
        if (share && !share.isPaid && expense.paidById !== userId) {
          return sum + share.amount;
        }
        return sum;
      }, 0);

      // Amount owed to this user
      const owedToYou = expenses
        .filter((e) => e.paidById === userId)
        .reduce((sum, expense) => {
          return sum + expense.shares
            .filter((s) => s.userId !== userId && !s.isPaid)
            .reduce((shareSum, s) => shareSum + s.amount, 0);
        }, 0);

      return {
        user: member.user,
        paid,
        owed,
        balance: paid - owed, // Positive means others owe them, negative means they owe others
        outstanding, // What they still need to pay
        owedToYou, // What others owe them
      };
    });

    return {
      totalSpent,
      expenseCount: expenses.length,
      balances,
      currency: expenses[0]?.currency || 'USD',
    };
  }

  /**
   * Get what current user owes to others
   */
  async getUserDebts(planId, userId) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    // Get unpaid shares for this user
    const unpaidShares = await prisma.expenseShare.findMany({
      where: {
        userId,
        isPaid: false,
        expense: {
          planId,
          paidById: { not: userId },
        },
      },
      include: {
        expense: {
          include: {
            paidBy: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Group by payer
    const debtsByPayer = {};
    for (const share of unpaidShares) {
      const payerId = share.expense.paidById;
      if (!debtsByPayer[payerId]) {
        debtsByPayer[payerId] = {
          user: share.expense.paidBy,
          totalOwed: 0,
          expenses: [],
        };
      }
      debtsByPayer[payerId].totalOwed += share.amount;
      debtsByPayer[payerId].expenses.push({
        id: share.expense.id,
        title: share.expense.title,
        amount: share.amount,
        currency: share.expense.currency,
      });
    }

    return Object.values(debtsByPayer);
  }
}

module.exports = new ExpenseService();
