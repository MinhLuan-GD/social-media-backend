import { User, UserDocument } from '@users/schemas/user.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreateCommentDto } from './dto/comment.dto';
import { CreatePostDto } from './dto/post.dto';
import { Comment } from './schemas/comment.schema';

@Injectable()
export class PostsService {
  @InjectModel(Post.name)
  private postsModel: Model<PostDocument>;

  @InjectModel(User.name)
  private usersModel: Model<UserDocument>;

  async createPost(createPostDto: CreatePostDto) {
    return (await this.postsModel.create(createPostDto)).populate(
      'user',
      'first_name last_name cover picture username',
    );
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
    const userPosts = await this.postsModel
      .find({ user: id })
      .populate('user', 'first_name last_name picture username cover gender')
      .populate('comments.commentBy', 'first_name last_name picture username')
      .sort({ createdAt: -1 })
      .limit(5);

    followingPosts.push(...[...userPosts]);
    followingPosts.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return followingPosts;
  }

  async comment(id: string, createCommentDto: CreateCommentDto) {
    const { comment, image, postId: post, parentId } = createCommentDto;
    const { comments } = await this.postsModel
      .findByIdAndUpdate(
        post,
        {
          $push: {
            comments: {
              image,
              comment,
              parentId,
              commentAt: new Date(),
              commentBy: id,
            },
          },
        },
        { new: true },
      )
      .populate('comments.commentBy', 'picture first_name last_name username')
      .lean();
    return comments;
  }

  async updateComment(commentBy: string, createCommentDto: CreateCommentDto) {
    const { comment, image, postId: post, id: _id } = createCommentDto;
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

    const commentIds = findPost.comments
      .filter((x) => x.parentId == _id)
      .map((x: Comment & { _id: any }) => x._id);

    const { comments } = await this.postsModel
      .findOneAndUpdate(
        { _id: post },
        { $pull: { comments: { _id: [...commentIds, _id] } } },
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
    return 'ok';
  }
}
