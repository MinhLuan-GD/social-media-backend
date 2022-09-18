import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateOptions } from './interfaces/opts.interface';
import { User, UserDocument } from './schemas/user.schema';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  @InjectModel(User.name)
  private usersModel: Model<UserDocument>;

  @Inject(CACHE_MANAGER)
  private cacheManager: Cache;

  async findByEmail(email: string): Promise<User & { _id: string }> {
    return this.usersModel.findOne({ email }).lean();
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
}
