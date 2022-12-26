import { URL_D_PIC } from '../../config/async.config';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Details, DetailsSchema } from './details.schema';
import { SavedPost, SavedPostSchema } from './savedPost.schema';
import { Search, SearchSchema } from './search.schema';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  first_name: string;

  @Prop({ required: true, trim: true })
  last_name: string;

  @Prop({ required: true, trim: true, unique: true })
  username: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop({
    trim: true,
    default: URL_D_PIC,
  })
  picture: string;

  @Prop({ trim: true })
  cover: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  bYear: number;

  @Prop({ required: true })
  bMonth: number;

  @Prop({ required: true })
  bDay: number;

  @Prop({ default: false })
  verified: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    default: [],
  })
  friends: User[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    default: [],
  })
  following: User[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    default: [],
  })
  followers: User[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    default: [],
  })
  requests: User[];

  @Prop([SearchSchema])
  search: Search[];

  @Prop(DetailsSchema)
  details: Details;

  @Prop([SavedPostSchema])
  savedPosts: SavedPost[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ first_name: 'text', last_name: 'text' });
