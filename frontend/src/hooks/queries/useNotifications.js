import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationApi } from '../../api/notificationApi';

const KEY = 'notifications';

export function useNotifications(page = 0, size = 20) {
  return useQuery({
    queryKey: [KEY, page, size],
    queryFn: () => notificationApi.list({ page, size }),
    keepPreviousData: true,
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: [KEY, 'unread'],
    queryFn: notificationApi.unreadCount,
    refetchInterval: 1000 * 60,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('All marked as read');
    },
  });
}