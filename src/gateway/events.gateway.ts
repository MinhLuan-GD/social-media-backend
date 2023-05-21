import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  AddUserPayload,
  MessageDeliveredPayload,
  MessageSeenAllPayload,
  MessageSeenPayload,
  SendMessagePayload,
  SendNotificationPayload,
  StartTypingMessagePayload,
  StopTypingMessagePayload,
} from './interfaces/payload';
import { IUser, UsersOnline } from './interfaces/user';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { Model } from 'mongoose';

@WebSocketGateway({
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer() server: Server;
  users: IUser[] = [];
  broadcastEventTypes = {
    ACTIVE_USERS: 'ACTIVE_USERS',
    GROUP_CALL_ROOMS: 'GROUP_CALL_ROOMS',
  };

  constructor(
    @InjectModel(User.name)
    private usersModel: Model<UserDocument>,
  ) {}

  usersOnline: UsersOnline = {};

  addUser(
    userId: string,
    socketId: string,
    userName: string,
    picture: string,
    timeJoin: string,
  ) {
    !this.users.some((user) => user.userId === userId) &&
      this.users.push({ userId, socketId, userName, picture, timeJoin });
  }

  getUser(userId: string) {
    return this.users.find((user) => user.userId === userId);
  }

  removeUser(socketId: string) {
    this.users = this.users.filter((user) => user.socketId !== socketId);
  }

  handleConnection(client: Socket) {
    console.log(`Client id: ${client.id} has connected.`);
    client.on('disconnecting', () => {
      const userId = [...client.rooms]
        .find((s) => /users:/.test(s))
        ?.split(':')[1];
      if (userId) {
        const skO = this.usersOnline[userId].socketIds;
        skO.splice(skO.indexOf(client.id), 1);
        if (skO.length === 0) delete this.usersOnline[userId];
      }
    });
  }

  handleDisconnect(client: Socket) {
    this.removeUser(client.id);
    this.server.emit('getUsers', this.users);
  }

  @SubscribeMessage('call-other')
  callOther(_client: Socket, data: any) {
    const user = this.getUser(data.receiveId);
    this.server.to(user?.socketId).emit('call-other', {
      callerUserId: data.senderId,
      callerUsername: data.username,
      callerPicture: data.picture,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('sendNotification')
  sendNotification(_client: Socket, data: SendNotificationPayload) {
    const user = this.getUser(data.receiverId);
    this.server.to(user?.socketId).emit('getNotification', data);
  }

  @SubscribeMessage('stop typing message')
  stopTypingMessage(_client: Socket, payload: StopTypingMessagePayload) {
    const user = this.getUser(payload.receiverId);
    this.server.to(user?.socketId).emit('stop typing message', payload);
  }

  @SubscribeMessage('start typing message')
  startTypingMessage(_client: Socket, payload: StartTypingMessagePayload) {
    const user = this.getUser(payload.receiverId);
    this.server.to(user?.socketId).emit('start typing message', payload);
  }

  @SubscribeMessage('messageSeenAll')
  messageSeenAll(_client: Socket, data: MessageSeenAllPayload) {
    const user = this.getUser(data.receiverId);
    this.server.to(user?.socketId).emit('getMessageSeenAll', data);
  }

  @SubscribeMessage('messageSeen')
  messageSeen(_client: Socket, payload: MessageSeenPayload) {
    const user = this.getUser(payload.message?.sender);
    this.server.to(user?.socketId).emit('getMessageSeen', payload);
  }

  @SubscribeMessage('messageDelivered')
  messageDelivered(_client: Socket, payload: MessageDeliveredPayload) {
    const user = this.getUser(payload.message?.sender);
    this.server.to(user?.socketId).emit('getMessageDelivered', payload);
  }

  @SubscribeMessage('sendMessage')
  sendMessage(_client: Socket, payload: SendMessagePayload) {
    const user = this.getUser(payload.messages?.receiver);
    this.server.to(user?.socketId).emit('getMessage', payload);
  }

  @SubscribeMessage('addUser')
  handleAddUser(client: Socket, payload: AddUserPayload) {
    if (payload.userId) {
      this.addUser(
        payload.userId,
        client.id,
        payload.userName,
        payload.picture,
        payload.timeJoin,
      );
    }

    this.server.emit('getUsers', this.users);

    this.server.emit('broadcast', {
      event: this.broadcastEventTypes.ACTIVE_USERS,
      activeUsers: this.users,
    });
  }

  @SubscribeMessage('joinUser')
  async joinUser(client: Socket, userId: string) {
    client.join(`users:${userId}`);
    this.usersOnline[userId] = {
      timeJoin: new Date().toISOString(),
      socketIds: [client.id],
    };
    this.getFriendsOnline(null, userId);
  }

  @SubscribeMessage('leaveUser')
  leaveUser(client: Socket, userId: string) {
    client.leave(`users:${userId}`);
    const skO = this.usersOnline[userId].socketIds;
    skO.splice(skO.indexOf(client.id), 1);
    if (skO.length === 0) delete this.usersOnline[userId];
  }

  @SubscribeMessage('getFriendsOnline')
  async getFriendsOnline(_client: Socket, userId: string) {
    const { friends } = await this.usersModel.findById(userId).lean();
    const friendsIds = friends.map((friend) => friend.toString());
    friendsIds.push(userId);
    friendsIds.forEach(async (friendId) => {
      if (this.usersOnline[friendId]) {
        const user = await this.usersModel.findById(friendId).lean();
        const friends = await this.usersModel
          .find({
            _id: {
              $in: user.friends.filter(
                (friend) => !!this.usersOnline[friend.toString()],
              ),
            },
          })
          .select('first_name last_name picture _id')
          .lean();
        const friendsOnline = friends.map((friend) => ({
          userId: friend._id,
          userName: `${friend.first_name} ${friend.last_name}`,
          picture: friend.picture,
          timeJoin: this.usersOnline[friend._id].timeJoin,
        }));
        this.server
          .to(`users:${friendId}`)
          .emit('getFriendsOnline', friendsOnline);
      }
    });
  }

  @SubscribeMessage('joinPostCommentTyping')
  async joinPostTyping(client: Socket, postId: string) {
    client.join(`posts:${postId}:commentTyping`);
    const commentRoom = await this.server.in(`posts:${postId}`).fetchSockets();
    const commentRoomIds = commentRoom.map((socket) => socket.id);
    const msgSocket = commentRoomIds.filter((id) => id != client.id);
    if (msgSocket.length > 0) {
      this.server.to(msgSocket).emit('startPostCommentTyping');
    }
  }

  @SubscribeMessage('leavePostCommentTyping')
  async leavePostTyping(client: Socket, postId: string) {
    client.leave(`posts:${postId}:commentTyping`);
    const sockets = await this.server
      .in(`posts:${postId}:commentTyping`)
      .fetchSockets();
    if (sockets.length === 1) {
      this.server.to(sockets[0].id).emit('stopPostCommentTyping');
    } else if (sockets.length === 0) {
      this.server.to(`posts:${postId}`).emit('stopPostCommentTyping');
    }
  }

  @SubscribeMessage('joinPostComment')
  async joinPostComment(client: Socket, postId: string) {
    client.join(`posts:${postId}`);
  }

  @SubscribeMessage('leavePostComment')
  async leavePostComment(client: Socket, postId: string) {
    client.leave(`posts:${postId}`);
  }
}
