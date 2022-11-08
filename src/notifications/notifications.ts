import { CreateNotificationDetails } from '@/utils/types';

export interface INotificationService {
  getNotifications(user: string);
  createNotification(notificationDetails: CreateNotificationDetails);
  notificationSeen(notificationId: string, user: string);
}
