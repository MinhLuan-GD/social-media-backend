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
import { IUser } from './interfaces/user';

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
  joinUser(client: Socket, userId: string) {
    client.join(`users:${userId}`);
  }

  @SubscribeMessage('leaveUser')
  leaveUser(client: Socket, userId: string) {
    client.leave(`users:${userId}`);
  }

  @SubscribeMessage('joinPostCommentTyping')
  async joinPostTyping(client: Socket, payload: any) {
    const sockets = await this.server
      .in(`posts:${payload.postId}:commentTyping`)
      .fetchSockets();
    if (sockets.length >= 0) {
      const socketIds = sockets.map((socket) => socket.id);
      this.server.emit('startPostCommentTyping', {
        postId: payload.postId,
        socketIds,
      });
    }
    client.join(`posts:${payload.postId}:commentTyping`);
  }

  @SubscribeMessage('leavePostCommentTyping')
  async leavePostTyping(client: Socket, postId: string) {
    client.leave(`posts:${postId}:commentTyping`);
    const sockets = await this.server
      .in(`posts:${postId}:commentTyping`)
      .fetchSockets();
    if (sockets.length === 0) {
      this.server.emit('stopPostCommentTyping', postId);
    }
  }
}
