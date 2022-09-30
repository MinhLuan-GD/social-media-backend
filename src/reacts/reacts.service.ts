import { User, UserDocument } from '@users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { React, ReactDocument } from './schemas/react.schema';

@Injectable()
export class ReactsService {
  @InjectModel(React.name)
  private reactsModel: Model<ReactDocument>;

  @InjectModel(User.name)
  private usersModel: Model<UserDocument>;

  async reactPost(user: string, post: string, react: string) {
    const check = await this.reactsModel.findOne({ user, post });
    if (!check) this.reactsModel.create({ user, post, react });
    else if (check.react == react)
      await this.reactsModel.findByIdAndRemove(check._id);
    else
      await this.reactsModel.findByIdAndUpdate(check._id, { $set: { react } });
    return 'ok';
  }

  async getReacts(user: string, post: string) {
    const reactsArray = await this.reactsModel.find({ post });

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

    const check = await this.reactsModel.findOne({ post, user });
    const checkSaved = await this.usersModel.findOne({
      _id: user,
      savedPosts: [{ post }],
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
