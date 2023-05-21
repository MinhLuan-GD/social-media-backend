export interface IUser {
  userId: string;
  socketId: string;
  userName: string;
  picture: string;
  timeJoin: string;
}

export interface UsersOnline {
  [key: string]: string;
}
