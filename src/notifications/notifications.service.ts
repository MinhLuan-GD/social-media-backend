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
      .select('-__v -updatedAt')
      .populate('from', 'first_name last_name username')
      .lean();
  }

  async createNotification(notificationDetails: CreateNotificationDetails) {
    const { _id } = await this.notificationsModel.create(notificationDetails);

    return this.notificationsModel
      .findById(_id)
      .select('-__v -updatedAt')
      .populate('from', 'first_name last_name username')
      .lean();
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
