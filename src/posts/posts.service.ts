import { User, UserDocument } from '@/users/schemas/user.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

@Injectable()
export class PostsService implements IPostsService {
  constructor(
    @InjectModel(Post.name)
    private postsModel: Model<PostDocument>,
    @InjectModel(User.name)
    private usersModel: Model<UserDocument>,
    @InjectModel(Notification.name)
    private notificationsModel: Model<NotificationDocument>,
  ) {}

  async createPost(createPostDetails: CreatePostDetails) {
    const post = await this.postsModel.create(createPostDetails);
    this.checkTextToxicity(
      createPostDetails.text,
      createPostDetails.user,
      post._id,
      null,
    );

    return post.populate('user', 'first_name last_name cover picture username');
  }

  async checkTextToxicity(
    text: string,
    user: string,
    postId: string,
    commentId?: string,
  ) {
    const toxicitySRes = await fetch(
      `http://toxicity-service/score-comment/${text}`,
    );
    const toxicitySData = await toxicitySRes.json();
    let toxicText = false;
    for (const key in toxicitySData) {
      if (toxicitySData[key] === true) {
        toxicText = true;
        break;
      }
    }

    if (toxicText) {
      this.notificationsModel.create({
        user,
        icon: 'post',
        text: `Your ${
          commentId ? 'comment' : 'post'
        } has been hidden due to toxicity`,
      });

      if (!commentId) {
        await this.postsModel.findByIdAndUpdate(postId, {
          $set: { hidePost: true },
        });
      } else {
        await this.postsModel.updateOne(
          { _id: postId, 'comments._id': commentId },
          { $set: { 'comments.$.hideComment': true } },
        );
      }
    }
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
    const { comment, image, postId: post, parentId } = createCommentDetails;
    const { comments } = await this.postsModel
      .findByIdAndUpdate(
        post,
        {
          $push: {
            comments: {
              image,
              comment,
              parentId,
              commentBy,
              commentAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .populate('comments.commentBy', 'picture first_name last_name username')
      .lean();
    this.checkTextToxicity(comment, commentBy, post, comments.slice(-1)[0]._id);
    return comments;
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

    const { comments } = await this.postsModel
      .findOneAndUpdate(
        { _id: post, comments: { $elemMatch: { _id, commentBy } } },
        {
          $set: {
            'comments.$.comment': comment,
            'comments.$.image': image,
            'comments.$.updateAt': new Date(),
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
          if (y.parentId == x.parentId) {
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
