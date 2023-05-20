import {
  CreateUserDetails,
  FindUserParams,
  ModifyUserData,
  ModifyUserFilter,
  UpdateOptions,
} from '@/utils/types';
import { Search } from './schemas/search.schema';
import { User } from './schemas/user.schema';

export interface IUsersService {
  findUser(param: FindUserParams): Promise<User & { _id: string }>;

  findUserAndFriends(email: string): Promise<User & { _id: string }>;

  createUser(input: CreateUserDetails): Promise<User & { _id: string }>;

  updateTheme(theme: string, id: string): Promise<string>;

  updateUser(
    filter: ModifyUserFilter,
    data: ModifyUserData,
    options: UpdateOptions,
  ): Promise<User & { _id: string }>;

  setCode(user: string, code: string, ttl: number): Promise<string>;

  getCode(user: string): Promise<string>;

  getUserPicture(email: string): Promise<{
    email: string;
    picture: string;
  }>;

  getProfile(id: string, username: string);

  addFriend(senderId: string, receiverId: string): Promise<string>;

  cancelRequest(senderId: string, receiverId: string): Promise<any>;

  follow(senderId: string, receiverId: string): Promise<string>;

  unfollow(senderId: string, receiverId: string): Promise<string>;

  acceptRequest(senderId: string, receiverId: string): Promise<any>;

  unfriend(senderId: string, receiverId: string): Promise<string>;

  deleteRequest(senderId: string, receiverId: string): Promise<any>;

  search(searchTerm: string): Promise<Array<User & { _id: string }>>;

  addToSearchHistory(id: string, searchUser: string): Promise<string>;

  getSearchHistory(id: string): Promise<Search[]>;

  removeFromSearch(id: string, searchUser: string): Promise<string>;

  getFriendsPageInfos(id: string): Promise<{
    friends: User[];
    requests: User[];
    sentRequests: Array<User & { _id: string }>;
  }>;
}
