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
    let hateSpeechLabels: string[] = [];
    if (createPostDetails.text) {
      hateSpeechLabels = await this.checkTextToxicity(createPostDetails.text);
    }
    if (!createPostDetails.type && !createPostDetails.text) {
      createPostDetails.type = 'picture';
    }
    const post = await this.postsModel.create({
      ...createPostDetails,
      hidePost: hateSpeechLabels && hateSpeechLabels.length > 0,
    });
    const server: Server = this.evenGateWay.server;
    if (hateSpeechLabels.length > 0) {
      const notification = await this.notificationsModel.create({
        user: createPostDetails.user,
        icon: 'system',
        text: 'Your post has been locked for violating our community standards with inappropriate language that could incite hatred.',
        isSystem: true,
        hateSpeechLabels,
      });
      server
        .to(`users:${createPostDetails.user}`)
        .emit('toxicNotification', notification);
    }

    if (createPostDetails.type === 'share') {
      await this.postsModel.findByIdAndUpdate(createPostDetails.postRef, {
        $inc: { shareCount: 1 },
      });
    }

    const postRs = await this.postsModel
      .findById(post._id)
      .populate('user', 'first_name last_name cover picture username gender')
      .populate({
        path: 'postRef',
        populate: {
          path: 'user',
          select: 'first_name last_name picture username cover',
        },
        select: '-comments',
      });

    const text =
      createPostDetails.type === 'share'
        ? 'shared a post with you'
        : 'has posted something.';
    if (postRs.whoCanSee !== 'private') {
      const user = await this.usersModel.findById(createPostDetails.user);
      for (const friend of user.friends) {
        const notification = await this.notificationsModel.create({
          user: friend,
          icon: 'post',
          from: user._id,
          text,
          postId: post._id,
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
          postId: post._id,
          text: notification.text,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        };
        server.to(`users:${friend}`).emit('newPost', postRs);
        server
          .to(`users:${friend}`)
          .emit('postNotification', notificationPayload);
      }
    }

    return postRs;
  }

  async getPostById(id: string) {
    const post = await this.postsModel
      .findById(id)
      .populate('user', 'first_name last_name picture username cover gender')
      .populate('comments.commentBy', 'first_name last_name picture username')
      .populate({
        path: 'postRef',
        populate: {
          path: 'user',
          select: 'first_name last_name picture username cover',
        },
        select: '-comments',
      });
    return post;
  }

  async checkTextToxicity(text: string): Promise<string[]> {
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
    const labels = [];
    for (const key in toxicitySData) {
      if (toxicitySData[key] === true) {
        labels.push(key);
      }
    }
    return labels;
  }

  async getAllPosts(id: string) {
    const followingTemp = await this.usersModel
      .findById(id)
      .select('following');
    const following = followingTemp.following;

    const friendTemp = await this.usersModel.findById(id).select('friends');
    const friends = friendTemp.friends;

    const promisesFollowing = following.map((user) =>
      this.postsModel
        .find({ user, whoCanSee: 'public' })
        .populate('user', 'first_name last_name picture username cover gender')
        .populate('comments.commentBy', 'first_name last_name picture username')
        .populate({
          path: 'postRef',
          populate: {
            path: 'user',
            select: 'first_name last_name picture username cover',
          },
          select: '-comments',
        })
        .sort({ createdAt: -1 })
        .limit(5),
    );

    const promisesFriend = friends.map((user) =>
      this.postsModel
        .find({ user, whoCanSee: 'friends' })
        .populate('user', 'first_name last_name picture username cover gender')
        .populate('comments.commentBy', 'first_name last_name picture username')
        .populate({
          path: 'postRef',
          populate: {
            path: 'user',
            select: 'first_name last_name picture username cover',
          },
          select: '-comments',
        })
        .sort({ createdAt: -1 })
        .limit(5),
    );

    const followingPosts = (await Promise.all(promisesFollowing)).flat();
    const friendPosts = (await Promise.all(promisesFriend)).flat();
    const userPosts = await this.postsModel
      .find({ user: id, type: 'share' })
      .populate('user', 'first_name last_name picture username cover gender')
      .populate('comments.commentBy', 'first_name last_name picture username')
      .populate({
        path: 'postRef',
        populate: {
          path: 'user',
          select: 'first_name last_name picture username cover',
        },
        select: '-comments',
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const posts = [...followingPosts, ...friendPosts, ...userPosts];

    posts.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return posts;
  }

  async createComment(
    commentBy: string,
    createCommentDetails: CreateCommentDetails,
  ) {
    const { comment, image, postId, parentId, socketId } = createCommentDetails;
    let hateSpeechLabels: string[] = [];
    let notification: any = {};
    if (comment) {
      hateSpeechLabels = await this.checkTextToxicity(comment);
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
              hideComment: hateSpeechLabels && hateSpeechLabels.length > 0,
              commentAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .populate('comments.commentBy', 'picture first_name last_name username')
      .lean();
    const server: Server = this.evenGateWay.server;
    if (hateSpeechLabels.length > 0) {
      notification = await this.notificationsModel.create({
        user: commentBy,
        icon: 'system',
        from: commentBy,
        text: 'Your comment has been locked for violating our community standards with inappropriate language that could incite hatred.',
        isSystem: true,
        hateSpeechLabels,
      });
      server.to(`users:${commentBy}`).emit('toxicNotification', notification);
    }

    const post = await this.postsModel.findById(postId).lean();

    if (post.user.toString() !== commentBy) {
      await this.notificationsModel.create({
        user: post.user,
        icon: 'comment',
        text: 'commented on your post.',
        postId,
        commentId: comments[comments.length - 1]._id,
      });
    }

    const commentObj = comments[comments.length - 1];
    server.sockets.sockets.forEach((socket) => {
      if (socket.id !== socketId) {
        server.to(socket.id).emit('newComment', {
          postId,
          comment: commentObj,
        });
      }
    });

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

    let hateSpeechLabels: string[] = [];
    let notification = {};
    if (comment) {
      hateSpeechLabels = await this.checkTextToxicity(comment);
    }
    if (hateSpeechLabels.length > 0) {
      const server: Server = this.evenGateWay.server;
      notification = await this.notificationsModel.create({
        user: commentBy,
        icon: 'system',
        text: 'Your comment has been locked for violating our community standards with inappropriate language that could incite hatred.',
        isSystem: true,
        hateSpeechLabels,
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
            'comments.$.hideComment':
              hateSpeechLabels && hateSpeechLabels.length > 0,
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
