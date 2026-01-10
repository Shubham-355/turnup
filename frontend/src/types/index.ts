// User types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  phone?: string | null;
  isVerified: boolean;
  createdAt?: string;
}

// Plan types
export type PlanCategory = 'NIGHTOUT' | 'TRIP';
export type PlanType = 'PRIVATE' | 'PUBLIC';
export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  category: PlanCategory;
  type: PlanType;
  status: PlanStatus;
  coverImage: string | null;
  inviteCode: string;
  ownerId: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: PlanMember[];
  activities?: Activity[];
  _count?: {
    activities: number;
    members: number;
    messages?: number;
    expenses?: number;
    media?: number;
  };
}

export interface PlanMember {
  id: string;
  planId: string;
  userId: string;
  role: MemberRole;
  status: 'ACTIVE' | 'LEFT' | 'REMOVED';
  joinedAt: string;
  user: User;
}

// Activity types
export interface Activity {
  id: string;
  planId: string;
  name: string;
  description: string | null;
  date: string | null;
  time: string | null;
  order: number;
  locationName: string | null;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
    media: number;
  };
}

// Message types
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'LOCATION' | 'SYSTEM';

export interface Message {
  id: string;
  planId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: any;
  isDeleted: boolean;
  createdAt: string;
  sender: User;
}

// Expense types
export type SplitType = 'EQUAL' | 'CUSTOM' | 'BY_ITEM';

export interface ExpenseShare {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
  user: User;
}

export interface Expense {
  id: string;
  planId: string;
  activityId: string | null;
  paidById: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  splitType: SplitType;
  receipt: string | null;
  createdAt: string;
  paidBy: User;
  shares: ExpenseShare[];
  activity?: {
    id: string;
    name: string;
  } | null;
}

export interface ExpenseSummary {
  totalSpent: number;
  expenseCount: number;
  currency: string;
  balances: {
    user: User;
    paid: number;
    owed: number;
    balance: number;
    outstanding: number;
    owedToYou: number;
  }[];
}

// Media types
export interface Media {
  id: string;
  planId: string;
  activityId: string | null;
  uploaderId: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  publicId: string;
  thumbnail: string | null;
  caption: string | null;
  createdAt: string;
  uploader: User;
}

// Invitation types
export interface Invitation {
  id: string;
  planId: string;
  senderId: string;
  receiverId: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: string;
  sender: User;
  receiver?: User;
  plan: Plan;
}

export interface JoinRequest {
  id: string;
  planId: string;
  userId: string;
  message: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: User;
}

// Notification types
export type NotificationType =
  | 'PLAN_INVITE'
  | 'PLAN_INVITATION'
  | 'JOIN_REQUEST'
  | 'JOIN_APPROVED'
  | 'JOIN_REJECTED'
  | 'NEW_ACTIVITY'
  | 'NEW_MESSAGE'
  | 'NEW_EXPENSE'
  | 'EXPENSE_SETTLED'
  | 'PLAN_UPDATE'
  | 'MEMBER_JOINED'
  | 'MEMBER_LEFT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Location types
export interface UserLocation {
  id: string;
  userId: string;
  planId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
