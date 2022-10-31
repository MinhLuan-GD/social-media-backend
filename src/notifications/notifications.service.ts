import { CreateNotificationDetails } from '@/utils/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotificationService } from './notifications';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService implements INotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationsModel: Model<NotificationDocument>,
  ) {}

  getNotifications(user: string) {
    return this.notificationsModel.find({ user }).limit(15).lean();
  }

  createNotification(
    user: string,
    notificationDetails: CreateNotificationDetails,
  ) {
    return this.notificationsModel.create({ ...notificationDetails, user });
  }

  notificationDelivered(notificationId: string) {
    throw new Error('Method not implemented.');
  }

  notificationSeen(notificationId: string) {
    throw new Error('Method not implemented.');
  }
}
