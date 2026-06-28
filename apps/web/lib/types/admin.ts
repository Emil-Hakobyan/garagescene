export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalConversations: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminProject {
  _id: string;
  title: string;
  owner: { _id: string; name: string; email: string } | string;
  genre: string;
  stage: string;
  createdAt: string;
}

export interface AdminReport {
  _id: string;
  reporter: { _id: string; name: string; email: string } | string;
  targetType: 'user' | 'project';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}
