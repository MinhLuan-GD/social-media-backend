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

  async getNotifications(user: string) {
    return this.notificationsModel
      .find({ user })
      .limit(10)
      .sort({ createdAt: -1 })
      .select('-user -__v -updatedAt')
      .lean();
  }

  async createNotification(
    user: string,
    notificationDetails: CreateNotificationDetails,
  ) {
    return this.notificationsModel.create({ ...notificationDetails, user });
  }

  async notificationDelivered(notificationId: string) {
    this.notificationsModel.findByIdAndUpdate(
      notificationId,
      {
        $set: { status: 'delivered' },
      },
      {},
      () => ({}),
    );
    return 'ok';
  }

  async notificationSeen(notificationId: string) {
    this.notificationsModel.findByIdAndUpdate(
      notificationId,
      {
        $set: { status: 'seen' },
      },
      {},
      () => ({}),
    );
    return 'ok';
  }
}
