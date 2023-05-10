import { User, UserDocument } from '@/users/schemas/user.schema';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Comment } from './schemas/comment.schema';
import { IPostsService } from './posts';
import {
  CreateCommentDetails,
  CreatePostDetails,
  UpdateCommentDetails,
} from '@/utils/types';
import {
  NotificationDocument,
  Notification,
} from '@/notifications/schemas/notification.schema';
import fetch from 'node-fetch';
import { Server } from 'socket.io';
import { EventsGateway } from '@/gateway/events.gateway';

@Injectable()
export class PostsService implements IPostsService {
  constructor(
    @InjectModel(Post.name)
    private postsModel: Model<PostDocument>,
    @InjectModel(User.name)
    private usersModel: Model<UserDocument>,
    @InjectModel(Notification.name)
    private notificationsModel: Model<NotificationDocument>,
    @Inject(EventsGateway)
    private readonly evenGateWay: EventsGateway,
  ) {}

  async createPost(createPostDetails: CreatePostDetails) {
    let isToxic = false;
    if (createPostDetails.text) {
      isToxic = await this.checkTextToxicity(createPostDetails.text);
    }
    if (!createPostDetails.type && !createPostDetails.text) {
      createPostDetails.type = 'picture';
    }
    const post = await this.postsModel.create({
      ...createPostDetails,
      hidePost: isToxic,
    });
    const server: Server = this.evenGateWay.server;
    if (isToxic) {
      const notification = await this.notificationsModel.create({
        user: createPostDetails.user,
        icon: 'system',
        text: 'Your post has been locked for violating our community standards with inappropriate language that could incite hatred.',
        isSystem: true,
      });
      server
        .to(`users:${createPostDetails.user}`)
        .emit('toxicNotification', notification);
    } else {
      const user = await this.usersModel.findById(createPostDetails.user);
      for (const friend of user.friends) {
        const notification = await this.notificationsModel.create({
          user: friend,
          icon: 'post',
          text: `${user.first_name} ${user.last_name} has posted something.`,
        });
        const notificationPayload = {
          _id: notification._id,
          user: friend,
          from: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            picture: user.picture,
          },
          icon: 'post',
          text: notification.text,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        };
        server.to(`users:${friend}`).emit('newPost', post);
        server
          .to(`users:${friend}`)
          .emit('postNotification', notificationPayload);
      }
    }

    return post.populate(
      'user',
      'first_name last_name cover picture username gender',
    );
  }

  async checkTextToxicity(text: string) {
    let toxicitySRes: any;
    try {
      toxicitySRes = await fetch(process.env.TOXICITY_URL, {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.log(error);
      return;
    }
    const toxicitySData = await toxicitySRes.json();
    for (const key in toxicitySData) {
      if (toxicitySData[key] === true) {
        return true;
      }
    }
    return false;
  }

  async getAllPosts(id: string) {
    const followingTemp = await this.usersModel
      .findById(id)
      .select('following');
    const following = followingTemp.following;
    const promises = following.map((user) =>
      this.postsModel
        .find({ user: user })
        .populate('user', 'first_name last_name picture username cover gender')
        .populate('comments.commentBy', 'first_name last_name picture username')
        .sort({ createdAt: -1 })
        .limit(5),
    );

    const followingPosts = (await Promise.all(promises)).flat();
    // const userPosts = await this.postsModel
    //   .find({ user: id })
    //   .populate('user', 'first_name last_name picture username cover gender')
    //   .populate('comments.commentBy', 'first_name last_name picture username')
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    // followingPosts.push(...[...userPosts]);
    followingPosts.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return followingPosts;
  }

  async createComment(
    commentBy: string,
    createCommentDetails: CreateCommentDetails,
  ) {
    const { comment, image, postId, parentId } = createCommentDetails;
    let isToxic = false;
    let notification: any = {};
    if (comment) {
      isToxic = await this.checkTextToxicity(comment);
    }
    const { comments } = await this.postsModel
      .findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: {
              image,
              comment,
              parentId,
              commentBy,
              hideComment: isToxic,
              commentAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .populate('comments.commentBy', 'picture first_name last_name username')
      .lean();
    const server: Server = this.evenGateWay.server;
    const post: any = await this.postsModel.findById(postId).populate('user');
    const user = await this.usersModel.findById(commentBy);
    if (isToxic) {
      notification = await this.notificationsModel.create({
        user: commentBy,
        icon: 'system',
        text: 'Your comment has been locked for violating our community standards with inappropriate language that could incite hatred.',
        isSystem: true,
      });
      server.to(`users:${commentBy}`).emit('toxicNotification', notification);
    } else if (post && post.user._id.toString() !== commentBy) {
      notification = await this.notificationsModel.create({
        user: post.user._id,
        from: commentBy,
        icon: 'comment',
        text: `${user.first_name} ${user.last_name} commented on your post`,
      });
      const notificationPayload = {
        _id: notification._id,
        user: post.user._id,
        from: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          picture: user.picture,
        },
        icon: 'comment',
        text: notification.text,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      };
      server
        .to(`users:${post.user._id}`)
        .emit('commentNotification', notificationPayload);

      server.emit('newComment', {
        postId,
        comment: comments[comments.length - 1],
      });
    }

    return {
      comments,
      notification,
    };
  }

  async updateComment(
    commentBy: string,
    updateCommentDetails: UpdateCommentDetails,
  ) {
    const { comment, image, postId: post, id: _id } = updateCommentDetails;
    const findPost = await this.postsModel
      .findOne({ _id: post, comments: { $elemMatch: { _id, commentBy } } })
      .lean();
    if (!findPost) {
      throw new HttpException('cant find comment', HttpStatus.CONFLICT);
    }

    let isToxic = false;
    let notification = {};
    if (comment) {
      isToxic = await this.checkTextToxicity(comment);
    }
    if (isToxic) {
      const server: Server = this.evenGateWay.server;
      notification = await this.notificationsModel.create({
        user: commentBy,
        icon: 'system',
        text: 'Your comment has been locked for violating our community standards with inappropriate language that could incite hatred.',
        isSystem: true,
      });
      server.to(`users:${commentBy}`).emit('toxicNotification', notification);
    }

    const { comments } = await this.postsModel
      .findOneAndUpdate(
        { _id: post, comments: { $elemMatch: { _id, commentBy } } },
        {
          $set: {
            'comments.$.comment': comment,
            'comments.$.image': image,
            'comments.$.updateAt': new Date(),
            'comments.$.hideComment': isToxic,
          },
        },
        { new: true },
      )
      .populate('comments.commentBy', 'picture first_name last_name username')
      .lean();
    return comments;
  }

  async deleteComment(commentBy: string, _id: string, post: string) {
    const findPost = await this.postsModel
      .findOne({ _id: post, comments: { $elemMatch: { _id, commentBy } } })
      .lean();
    if (!findPost) {
      throw new HttpException('cant find comment', HttpStatus.CONFLICT);
    }

    const commentIds = [];
    findPost.comments.forEach((x: Comment & { _id: any }) => {
      if (x.parentId == _id) {
        findPost.comments.forEach((y: Comment & { _id: any }) => {
          if (y.parentId == x._id) {
            commentIds.push(y._id);
          }
          commentIds.push(x._id);
        });
      }
    });

    commentIds.push(_id);

    const { comments } = await this.postsModel
      .findOneAndUpdate(
        { _id: post },
        { $pull: { comments: { _id: commentIds } } },
        { new: true },
      )
      .populate('comments.commentBy', 'picture first_name last_name username')
      .lean();

    return comments;
  }

  async savePost(id: string, post: string) {
    const check = await this.usersModel.findOne({
      _id: id,
      savedPosts: [{ post }],
    });
    if (check) {
      await this.usersModel.findByIdAndUpdate(id, {
        $pull: {
          savedPosts: {
            _id: check._id,
          },
        },
      });
    } else {
      await this.usersModel.findByIdAndUpdate(id, {
        $push: {
          savedPosts: {
            post,
            savedAt: new Date(),
          },
        },
      });
    }

    return 'ok';
  }

  async deletePost(id: string) {
    this.postsModel.findByIdAndRemove(id, () => ({}));
    return { status: 'ok' };
  }
}
