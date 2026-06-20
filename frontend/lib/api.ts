import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Settings
export const getSettings = () => api.get('/api/settings').then(r => r.data);
export const updateSettings = (data: any) => api.patch('/api/settings', data).then(r => r.data);

// Instagram status
export const getInstagramStatus = () => api.get('/api/instagram/status').then(r => r.data);
export const getInstagramPosts  = () => api.get('/api/instagram/posts').then(r => r.data);

// DM Messages
export const getDmMessages = () => api.get('/api/dm-messages').then(r => r.data);
export const updateDmMessages = (messages: string[]) =>
  api.put('/api/dm-messages', { messages }).then(r => r.data);

// Logs
export const getLogs = (limit = 100) =>
  api.get(`/api/logs?limit=${limit}`).then(r => r.data);
export const getTodayStats = () =>
  api.get('/api/logs/today-stats').then(r => r.data);

// Comment Rules
export const getCommentRules = () => api.get('/api/comment-rules').then(r => r.data);
export const createCommentRule = (data: any) => api.post('/api/comment-rules', data).then(r => r.data);
export const updateCommentRule = (id: number, data: any) => api.patch(`/api/comment-rules/${id}`, data).then(r => r.data);
export const deleteCommentRule = (id: number) => api.delete(`/api/comment-rules/${id}`).then(r => r.data);
export const toggleCommentRule = (id: number) => api.patch(`/api/comment-rules/${id}/toggle`).then(r => r.data);
