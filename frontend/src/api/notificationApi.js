import axiosClient from './axiosClient';

export const notificationApi = {
  list: (params) => axiosClient.get('/notifications', { params }).then((r) => r.data.data),
  unreadCount: () =>
    axiosClient.get('/notifications/unread-count').then((r) => r.data.data),
  markRead: (id) =>
    axiosClient.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    axiosClient.patch('/notifications/read-all').then((r) => r.data),
};