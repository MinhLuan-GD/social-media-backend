import { User, UserDocument } from '@/users/schemas/user.schema';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { React, ReactDocument } from './schemas/react.schema';
import { IReactsService } from './reacts';
import { EventsGateway } from '@/gateway/events.gateway';
import { Post, PostDocument } from '@/posts/schemas/post.schema';
import {
  Notification,
  NotificationDocument,
} from '@/notifications/schemas/notification.schema';

@Injectable()
export class ReactsService implements IReactsService {
  constructor(
    @InjectModel(React.name)
    private reactsModel: Model<ReactDocument>,
    @InjectModel(User.name)
    private usersModel: Model<UserDocument>,
    @InjectModel(Post.name)
    private postsModel: Model<PostDocument>,
    @InjectModel(Notification.name)
    private notificationsModel: Model<NotificationDocument>,
    @Inject(EventsGateway)
    private readonly evenGateWay: EventsGateway,
  ) {}

  async reactPost(reactBy: string, postRef: string, react: string) {
    const check = await this.reactsModel.findOne({ reactBy, postRef });
    if (!check) {
      this.reactsModel.create({ reactBy, postRef, react });
      this.reactNotification(reactBy, postRef, react);
    } else if (check.react == react) {
      await this.reactsModel.findByIdAndRemove(check._id);
    } else {
      this.reactNotification(reactBy, postRef, react);
      await this.reactsModel.findByIdAndUpdate(check._id, { $set: { react } });
    }
    return 'ok';
  }

  async reactNotification(reactBy: string, postRef: string, react: string) {
    const post = await this.postsModel.findById(postRef).lean();
    if (post.user.toString() !== reactBy) {
      const notification = await this.notificationsModel.create({
        user: post.user,
        icon: react,
        text: 'reacted to your post',
        from: reactBy,
        postId: postRef,
      });

      const user = await this.usersModel.findById(reactBy).lean();

      const notificationPayload = {
        _id: notification._id,
        user: post.user.toString(),
        from: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          picture: user.picture,
        },
        icon: react,
        postId: postRef,
        text: notification.text,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      };

      this.evenGateWay.server
        .to(`users:${post.user.toString()}`)
        .emit('reactPostNotification', notificationPayload);
    }
  }

  async getReacts(reactBy: string, postRef: string) {
    const reactsArray = await this.reactsModel.find({ postRef });

    const newReacts = reactsArray.reduce((group, react) => {
      const key = react.react;
      group[key] = group[key] || [];
      group[key].push(react);
      return group;
    }, {});

    const interfaces = ['like', 'love', 'haha', 'sad', 'wow', 'angry'];
    const reacts = interfaces.map((x) => {
      return {
        react: x,
        count: newReacts[x] ? newReacts[x].length : 0,
      };
    });

    const check = await this.reactsModel.findOne({ postRef, reactBy });
    const checkSaved = await this.usersModel.findOne({
      _id: reactBy,
      savedPosts: [{ postRef }],
    });
    const rs = {
      reacts,
      check: check?.react,
      total: reactsArray.length,
      checkSaved: checkSaved ? true : false,
    };
    return rs;
  }
}
