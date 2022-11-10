import { User } from '@/users/schemas/user.schema';
import { Request } from 'express';

export interface AuthPayload {
  _id: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: User & AuthPayload;
}

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  picture: string;
  verified: boolean;
  following: User[];
}
