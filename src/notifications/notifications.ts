import { CreateNotificationDetails } from '@/utils/types';

export interface INotificationService {
  getNotifications(user: string);
  createNotification(notificationDetails: CreateNotificationDetails);
  notificationDelivered(notificationId: string);
  notificationSeen(notificationId: string);
}
