import { CreateNotificationDetails } from '@/utils/types';

export interface INotificationService {
  getNotifications(user: string);
  createNotification(
    user: string,
    notificationDetails: CreateNotificationDetails,
  );
  notificationDelivered(notificationId: string);
  notificationSeen(notificationId: string);
}
