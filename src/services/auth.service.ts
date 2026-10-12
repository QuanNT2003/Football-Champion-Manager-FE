import { request } from './client';
import { User, Club } from '../types';

export const authApi = {
  login: async (usernameOrEmail: string, password: string) => {
    const res = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const token = res?.accessToken || res?.access_token || res?.token;
    if (token) {
      localStorage.setItem('fc_token', token);
    }
    if (res?.user) {
      localStorage.setItem('fc_user', JSON.stringify(res.user));
      if (res.user.club) {
        localStorage.setItem('fc_club', JSON.stringify(res.user.club));
      }
    }
    return res;
  },

  register: async (username: string, email: string, password: string) => {
    const res = await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    const token = res?.accessToken || res?.access_token || res?.token;
    if (token) {
      localStorage.setItem('fc_token', token);
    }
    if (res?.user) {
      localStorage.setItem('fc_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_user');
    localStorage.removeItem('fc_club');
  },

  getProfile: () => request<User>('/auth/me'),

  getCurrentUser: (): User | null => {
    try {
      const u = localStorage.getItem('fc_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getCurrentClub: (): Club | null => {
    try {
      const c = localStorage.getItem('fc_club');
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  },
};
