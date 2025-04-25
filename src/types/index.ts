export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
}

export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  username: string;
  email: string;
  link: string;
  role: UserRole;
}
