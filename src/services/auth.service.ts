import { request } from './client';
import { User } from '../types';

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
    return res;
  },

  logout: () => {
    localStorage.removeItem('fc_token');
  },

  getProfile: () => request<User>('/auth/me'),
};
