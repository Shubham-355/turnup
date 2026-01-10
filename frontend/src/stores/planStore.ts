import { create } from 'zustand';
import { Plan, Activity, PlanMember, PlanCategory, PlanType } from '../types';
import { planService, CreatePlanData, CreateActivityData, PlanFilters } from '../services/plans';

interface PlanState {
  plans: Plan[];
  publicPlans: Plan[];
  currentPlan: Plan | null;
  activities: Activity[];
  members: PlanMember[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };

  // Plan actions
  fetchPlans: (filters?: PlanFilters) => Promise<void>;
  fetchPublicPlans: (filters?: PlanFilters) => Promise<void>;
  fetchPlanById: (planId: string) => Promise<void>;
  fetchPlanDetails: (planId: string) => Promise<void>;
  createPlan: (data: CreatePlanData) => Promise<Plan>;
  updatePlan: (planId: string, data: Partial<CreatePlanData>) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  updateCoverImage: (planId: string, formData: FormData) => Promise<void>;
  regenerateInviteCode: (planId: string) => Promise<string>;
  leavePlan: (planId: string) => Promise<void>;

  // Member actions
  fetchMembers: (planId: string) => Promise<void>;
  updateMemberRole: (planId: string, memberId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') => Promise<void>;
  removeMember: (planId: string, memberId: string) => Promise<void>;

  // Activity actions
  fetchActivities: (planId: string) => Promise<void>;
  createActivity: (planId: string, data: CreateActivityData) => Promise<Activity>;
  updateActivity: (planId: string, activityId: string, data: Partial<CreateActivityData>) => Promise<void>;
  deleteActivity: (planId: string, activityId: string) => Promise<void>;
  reorderActivities: (planId: string, activityIds: string[]) => Promise<void>;

  // Utility
  clearError: () => void;
  clearCurrentPlan: () => void;
  setCurrentPlan: (plan: Plan | null) => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  publicPlans: [],
  currentPlan: null,
  activities: [],
  members: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: false,
  },

  // Plan actions
  fetchPlans: async (filters?: PlanFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.getPlans(filters);
      set({
        plans: response.data.items,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch plans', isLoading: false });
    }
  },

  fetchPublicPlans: async (filters?: PlanFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.getPublicPlans(filters);
      set({
        publicPlans: response.data.items,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch public plans', isLoading: false });
    }
  },

  fetchPlanById: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.getPlanById(planId);
      set({ currentPlan: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch plan', isLoading: false });
    }
  },

  fetchPlanDetails: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [planRes, activitiesRes, membersRes] = await Promise.all([
        planService.getPlanById(planId),
        planService.getActivities(planId),
        planService.getMembers(planId),
      ]);
      set({
        currentPlan: planRes.data,
        activities: activitiesRes.data,
        members: membersRes.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch plan details', isLoading: false });
    }
  },

  createPlan: async (data: CreatePlanData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.createPlan(data);
      set((state) => ({
        plans: [response.data, ...state.plans],
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create plan', isLoading: false });
      throw error;
    }
  },

  updatePlan: async (planId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.updatePlan(planId, data);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === planId ? response.data : p)),
        currentPlan: state.currentPlan?.id === planId ? response.data : state.currentPlan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update plan', isLoading: false });
      throw error;
    }
  },

  deletePlan: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      await planService.deletePlan(planId);
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== planId),
        currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete plan', isLoading: false });
      throw error;
    }
  },

  updateCoverImage: async (planId: string, formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.updateCoverImage(planId, formData);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === planId ? response.data : p)),
        currentPlan: state.currentPlan?.id === planId ? response.data : state.currentPlan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update cover image', isLoading: false });
      throw error;
    }
  },

  regenerateInviteCode: async (planId: string) => {
    try {
      const response = await planService.regenerateInviteCode(planId);
      set((state) => ({
        currentPlan: state.currentPlan?.id === planId
          ? { ...state.currentPlan, inviteCode: response.data.inviteCode }
          : state.currentPlan,
      }));
      return response.data.inviteCode;
    } catch (error: any) {
      throw error;
    }
  },

  leavePlan: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      await planService.leavePlan(planId);
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== planId),
        currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to leave plan', isLoading: false });
      throw error;
    }
  },

  // Member actions
  fetchMembers: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.getMembers(planId);
      set({ members: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch members', isLoading: false });
    }
  },

  updateMemberRole: async (planId: string, memberId: string, role) => {
    try {
      const response = await planService.updateMemberRole(planId, memberId, role);
      set((state) => ({
        members: state.members.map((m) => (m.id === memberId ? response.data : m)),
      }));
    } catch (error: any) {
      throw error;
    }
  },

  removeMember: async (planId: string, memberId: string) => {
    try {
      await planService.removeMember(planId, memberId);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
      }));
    } catch (error: any) {
      throw error;
    }
  },

  // Activity actions
  fetchActivities: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.getActivities(planId);
      set({ activities: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch activities', isLoading: false });
    }
  },

  createActivity: async (planId: string, data: CreateActivityData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.createActivity(planId, data);
      set((state) => ({
        activities: [...state.activities, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create activity', isLoading: false });
      throw error;
    }
  },

  updateActivity: async (planId: string, activityId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await planService.updateActivity(planId, activityId, data);
      set((state) => ({
        activities: state.activities.map((a) => (a.id === activityId ? response.data : a)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update activity', isLoading: false });
      throw error;
    }
  },

  deleteActivity: async (planId: string, activityId: string) => {
    set({ isLoading: true, error: null });
    try {
      await planService.deleteActivity(planId, activityId);
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== activityId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete activity', isLoading: false });
      throw error;
    }
  },

  reorderActivities: async (planId: string, activityIds: string[]) => {
    try {
      const response = await planService.reorderActivities(planId, activityIds);
      set({ activities: response.data });
    } catch (error: any) {
      throw error;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  clearCurrentPlan: () => set({ currentPlan: null, activities: [], members: [] }),
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
}));
