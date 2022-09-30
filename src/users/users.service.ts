import { Post, PostDocument } from '@posts/schemas/post.schema';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateOptions } from './interfaces/opts.interface';
import { User, UserDocument } from './schemas/user.schema';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  @InjectModel(User.name)
  private usersModel: Model<UserDocument>;

  @InjectModel(Post.name)
  private postsModel: Model<PostDocument>;

  @Inject(CACHE_MANAGER)
  private cacheManager: Cache;

  async findByEmail(email: string): Promise<User & { _id: string }> {
    return this.usersModel.findOne({ email }).lean();
  }

  async findByEmailAndFollow(email: string): Promise<User & { _id: string }> {
    return this.usersModel
      .findOne({ email })
      .populate('following', 'picture first_name last_name')
      .lean();
  }

  async findByUsername(username: string): Promise<User & { _id: string }> {
    return this.usersModel.findOne({ username }).lean();
  }

  async findById(id: string): Promise<User> {
    return this.usersModel.findById(id).lean();
  }

  async createUser(input: any): Promise<User & { _id: string }> {
    const user = await this.usersModel.create(input);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result }: User & { _id: string } = user.toJSON();
    return result;
  }

  async updateUser(filter: any, data: any, options: UpdateOptions = {}) {
    const user = await this.usersModel.findOneAndUpdate(filter, data, options);
    return user;
  }

  async setCode(user: string, code: string, ttl = 120) {
    await this.cacheManager.set(`users:${user}:code`, code, { ttl });
  }

  async getCode(user: string) {
    const code = await this.cacheManager.get(`users:${user}:code`);
    return code;
  }

  async getUserPicture(email: string) {
    const user = await this.usersModel.findOne({ email }).lean();
    if (!user) {
      throw new HttpException(
        'The email address you entered is not connected to an account.',
        HttpStatus.CONFLICT,
      );
    }
    return { email, picture: user.picture };
  }

  async getProfile(id: string, username: string) {
    const user = await this.usersModel.findById(id);
    const profile = await this.usersModel
      .findOne({ username })
      .select('-password');
    const friendship = {
      friends: false,
      following: false,
      requestSent: false,
      requestReceived: false,
    };
    if (!profile) throw new HttpException('Conflict', HttpStatus.CONFLICT);

    if (
      user.friends.includes(profile._id) &&
      profile.friends.includes(user._id)
    )
      friendship.friends = true;
    if (user.following.includes(profile._id)) friendship.following = true;
    if (user.requests.includes(profile._id)) friendship.requestReceived = true;
    if (profile.requests.includes(user._id)) friendship.requestSent = true;

    const posts = await this.postsModel
      .find({ user: profile._id })
      .populate('user')
      .populate('comments.commentBy', 'first_name last_name username picture')
      .sort({ createdAt: -1 });
    await profile.populate('friends', 'first_name last_name username picture');
    return {
      friendship,
      posts,
      ...profile.toObject(),
    };
  }

  async addFriend(senderId: string, receiverId: string) {
    if (senderId !== receiverId) {
      const sender = await this.usersModel.findById(senderId);
      const receiver = await this.usersModel.findById(receiverId);

      if (
        !receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({ $push: { requests: sender._id } });
        await receiver.updateOne({ $push: { followers: sender._id } });
        await sender.updateOne({ $push: { following: receiver._id } });
        return 'friend request has been sent';
      } else throw new HttpException('Already sent', HttpStatus.CONFLICT);
    } else {
      throw new HttpException(
        `You can't send a request to yourself`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async cancelRequest(senderId: string, receiverId: string) {
    if (senderId !== receiverId) {
      const sender = await this.usersModel.findById(senderId);
      const receiver = await this.usersModel.findById(receiverId);

      if (
        receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({ $pull: { requests: sender._id } });
        await receiver.updateOne({ $pull: { followers: sender._id } });
        await sender.updateOne({ $pull: { following: receiver._id } });
        return 'you successfully canceled request';
      } else throw new HttpException('Already Canceled', HttpStatus.CONFLICT);
    } else {
      throw new HttpException(
        `You can't cancel a request to yourself`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async follow(senderId: string, receiverId: string) {
    if (senderId !== receiverId) {
      const sender = await this.usersModel.findById(senderId);
      const receiver = await this.usersModel.findById(receiverId);

      if (
        !receiver.followers.includes(sender._id) &&
        !sender.following.includes(receiver._id)
      ) {
        await receiver.updateOne({ $push: { followers: sender._id } });
        await sender.updateOne({ $push: { following: receiver._id } });
        return 'follow success';
      } else throw new HttpException('Already following', HttpStatus.CONFLICT);
    } else
      throw new HttpException(`You can't follow yourself`, HttpStatus.CONFLICT);
  }

  async unfollow(senderId: string, receiverId: string) {
    if (senderId !== receiverId) {
      const sender = await this.usersModel.findById(senderId);
      const receiver = await this.usersModel.findById(receiverId);

      if (
        receiver.followers.includes(sender._id) &&
        sender.following.includes(receiver._id)
      ) {
        await receiver.updateOne({ $pull: { followers: sender._id } });
        await sender.updateOne({ $pull: { following: receiver._id } });
        return 'unfollow success';
      } else
        throw new HttpException('Already not following', HttpStatus.CONFLICT);
    } else {
      throw new HttpException(
        `You can't unfollow yourself`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async acceptRequest(senderId: string, receiverId: string) {
    if (senderId !== receiverId) {
      const sender = await this.usersModel.findById(senderId);
      const receiver = await this.usersModel.findById(receiverId);

      if (receiver.requests.includes(sender._id)) {
        await receiver.updateOne({
          $push: { friends: sender._id, following: sender._id },
        });
        await sender.updateOne({
          $push: { friends: receiver._id, followers: receiver._id },
        });
        await receiver.updateOne({ $pull: { requests: sender._id } });
        return 'friend request accepted';
      } else throw new HttpException('Already friends', HttpStatus.CONFLICT);
    } else {
      throw new HttpException(
        `You can't accept a request from  yourself`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async unfriend(senderId: string, receiverId: string) {
    if (senderId !== receiverId) {
      const sender = await this.usersModel.findById(senderId);
      const receiver = await this.usersModel.findById(receiverId);

      if (
        receiver.friends.includes(sender._id) &&
        sender.friends.includes(receiver._id)
      ) {
        await receiver.updateOne({
          $pull: {
            friends: sender._id,
            following: sender._id,
            followers: sender._id,
          },
        });
        await sender.updateOne({
          $pull: {
            friends: receiver._id,
            following: receiver._id,
            followers: receiver._id,
          },
        });
        return 'unfriend request accepted';
      } else
        throw new HttpException('Already not friends', HttpStatus.CONFLICT);
    } else {
      throw new HttpException(
        `You can't unfriend yourself`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async deleteRequest(senderId: string, receiverId: string) {
    if (senderId !== receiverId) {
      const sender = await this.usersModel.findById(senderId);
      const receiver = await this.usersModel.findById(receiverId);

      if (receiver.requests.includes(sender._id)) {
        await receiver.updateOne({
          $pull: { requests: sender._id, followers: sender._id },
        });
        await sender.updateOne({ $pull: { following: receiver._id } });
        return 'delete request accepted';
      } else
        throw new HttpException('Already deleted friends', HttpStatus.CONFLICT);
    } else
      throw new HttpException(`You can't delete yourself`, HttpStatus.CONFLICT);
  }

  async search(searchTerm: string) {
    const users = await this.usersModel
      .find({ $text: { $search: searchTerm } })
      .select('first_name last_name username picture')
      .limit(5)
      .lean();

    return users;
  }

  async addToSearchHistory(id: string, searchUser: string) {
    const search = {
      user: searchUser,
      createdAt: new Date(),
    };
    const user = await this.usersModel.findById(id);
    const check = user.search.find((x) => x.user.toString() === searchUser);
    if (check) {
      await this.usersModel.updateOne(
        { _id: id, 'search.user': searchUser },
        {
          $set: { 'search.$.createdAt': new Date() },
        },
      );
    } else await user.updateOne({ $push: { search } });
    return 'ok';
  }

  async getSearchHistory(id: string) {
    const { search } = await this.usersModel
      .findById(id)
      .select('search')
      .populate('search.user', 'first_name last_name username picture')
      .lean();
    return search;
  }

  async removeFromSearch(id: string, searchUser: string) {
    await this.usersModel.updateOne(
      { _id: id },
      { $pull: { search: { user: searchUser } } },
    );
    return 'ok';
  }

  async getFriendsPageInfos(id: string) {
    const { friends, requests } = await this.usersModel
      .findById(id)
      .select('friends requests')
      .populate('friends', 'first_name last_name picture username')
      .populate('requests', 'first_name last_name picture username')
      .lean();
    const sentRequests = await this.usersModel
      .find({ requests: id })
      .select('first_name last_name picture username')
      .lean();

    return { friends, requests, sentRequests };
  }
}
