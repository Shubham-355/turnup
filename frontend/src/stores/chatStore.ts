import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Message } from '../types';
import { chatService } from '../services';
import { config } from '../config';
import { getToken } from '../services/api';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  socket: Socket | null;
  typingUsers: Map<string, { username: string; planId: string }>;
  hasMore: boolean;
  currentPlanId: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  joinPlan: (planId: string) => void;
  leavePlan: (planId: string) => void;
  fetchMessages: (planId: string, options?: { before?: string }) => Promise<void>;
  sendMessage: (planId: string, content: string, type?: string, metadata?: any) => Promise<void>;
  deleteMessage: (planId: string, messageId: string) => Promise<void>;
  startTyping: (planId: string) => void;
  stopTyping: (planId: string) => void;
  clearMessages: () => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  isConnected: false,
  socket: null,
  typingUsers: new Map(),
  hasMore: true,
  currentPlanId: null,

  connect: async () => {
    const token = await getToken();
    if (!token || get().socket) return;

    const socket = io(config.socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      // Rejoin current plan if any
      const planId = get().currentPlanId;
      if (planId) {
        socket.emit('join-plan', planId);
      }
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('new-message', (message: Message) => {
      const currentPlanId = get().currentPlanId;
      if (message.planId === currentPlanId) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      }
    });

    socket.on('message-deleted', ({ messageId, planId }: { messageId: string; planId: string }) => {
      if (planId === get().currentPlanId) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
          ),
        }));
      }
    });

    socket.on('user-typing', ({ userId, username, planId }: { userId: string; username: string; planId: string }) => {
      if (planId === get().currentPlanId) {
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          newTypingUsers.set(userId, { username, planId });
          return { typingUsers: newTypingUsers };
        });

        // Auto-remove after 3 seconds
        setTimeout(() => {
          set((state) => {
            const newTypingUsers = new Map(state.typingUsers);
            newTypingUsers.delete(userId);
            return { typingUsers: newTypingUsers };
          });
        }, 3000);
      }
    });

    socket.on('user-stop-typing', ({ userId, planId }: { userId: string; planId: string }) => {
      if (planId === get().currentPlanId) {
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          newTypingUsers.delete(userId);
          return { typingUsers: newTypingUsers };
        });
      }
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinPlan: (planId: string) => {
    const { socket } = get();
    if (socket) {
      // Leave previous plan
      const prevPlanId = get().currentPlanId;
      if (prevPlanId && prevPlanId !== planId) {
        socket.emit('leave-plan', prevPlanId);
      }
      socket.emit('join-plan', planId);
      set({ currentPlanId: planId, messages: [], hasMore: true });
    }
  },

  leavePlan: (planId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave-plan', planId);
      set({ currentPlanId: null, messages: [], typingUsers: new Map() });
    }
  },

  fetchMessages: async (planId: string, options?: { before?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatService.getMessages(planId, {
        before: options?.before,
        limit: 50,
      });
      
      const newMessages = response.data.items;
      set((state) => ({
        messages: options?.before
          ? [...newMessages, ...state.messages]
          : newMessages,
        hasMore: response.data.pagination.hasMore,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch messages', isLoading: false });
    }
  },

  sendMessage: async (planId: string, content: string, type = 'TEXT', metadata?: any) => {
    const { socket } = get();
    if (!socket) return;

    try {
      // Emit via socket for real-time delivery
      socket.emit('send-message', { planId, content, type, metadata });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to send message' });
      throw error;
    }
  },

  deleteMessage: async (planId: string, messageId: string) => {
    const { socket } = get();
    if (!socket) return;

    try {
      socket.emit('delete-message', { planId, messageId });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete message' });
      throw error;
    }
  },

  startTyping: (planId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing-start', planId);
    }
  },

  stopTyping: (planId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing-stop', planId);
    }
  },

  clearMessages: () => set({ messages: [], hasMore: true }),

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
}));
