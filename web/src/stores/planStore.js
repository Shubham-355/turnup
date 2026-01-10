import { create } from 'zustand';

const usePlanStore = create((set) => ({
  plans: [],
  currentPlan: null,
  
  setPlans: (plans) => set({ plans }),
  
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  
  addPlan: (plan) => set((state) => ({
    plans: [plan, ...state.plans]
  })),
  
  updatePlan: (planId, updates) => set((state) => ({
    plans: state.plans.map(p => p.id === planId ? { ...p, ...updates } : p),
    currentPlan: state.currentPlan?.id === planId 
      ? { ...state.currentPlan, ...updates } 
      : state.currentPlan
  })),
  
  removePlan: (planId) => set((state) => ({
    plans: state.plans.filter(p => p.id !== planId),
    currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan
  })),
}));

export default usePlanStore;
