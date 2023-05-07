import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer() server: Server;
  users = [];
  broadcastEventTypes = {
    ACTIVE_USERS: 'ACTIVE_USERS',
    GROUP_CALL_ROOMS: 'GROUP_CALL_ROOMS',
  };

  addUser(userId, socketId, userName, picture, timeJoin) {
    !this.users.some((user) => user.userId === userId) &&
      this.users.push({ userId, socketId, userName, picture, timeJoin });
  }

  getUser(userId) {
    return this.users.find((user) => user.userId === userId);
  }

  removeUser(socketId) {
    this.users = this.users.filter((user) => user.socketId !== socketId);
  }

  handleConnection(client: Socket) {
    client.on('addUser', (data) => {
      this.addUser(
        data.userId,
        client.id,
        data.userName,
        data.picture,
        data.timeJoin,
      );

      this.server.emit('getUsers', this.users);

      this.server.emit('broadcast', {
        event: this.broadcastEventTypes.ACTIVE_USERS,
        activeUsers: this.users,
      });
    });

    client.on('sendMessage', ({ messages, currentChatID }) => {
      const user = this.getUser(messages?.receiver);
      this.server
        .to(user?.socketId)
        .emit('getMessage', { messages, currentChatID });
    });

    client.on('messageDelivered', (data) => {
      const user = this.getUser(data.message?.sender);
      this.server.to(user?.socketId).emit('getMessageDelivered', data);
    });

    client.on('messageSeen', (data) => {
      const user = this.getUser(data.message?.sender);
      this.server.to(user?.socketId).emit('getMessageSeen', data);
    });

    client.on('messageSeenAll', (data) => {
      const user = this.getUser(data.receiverId);
      this.server.to(user?.socketId).emit('getMessageSeenAll', data);
    });

    client.on('start typing message', (data) => {
      console.log('start typing message', data);
      const user = this.getUser(data.receiverId);
      this.server.to(user?.socketId).emit('start typing message', data);
    });

    client.on('stop typing message', (data) => {
      const user = this.getUser(data.receiverId);
      this.server.to(user?.socketId).emit('stop typing message', data);
    });

    client.on('sendNotification', (data) => {
      const user = this.getUser(data.receiverId);
      this.server.to(user?.socketId).emit('getNotification', data);
    });

    client.on('call-other', (data) => {
      const user = this.getUser(data.receiveId);
      this.server.to(user?.socketId).emit('call-other', {
        callerUserId: data.senderId,
        callerUsername: data.username,
        callerPicture: data.picture,
        roomId: data.roomId,
      });
    });
  }

  handleDisconnect(client: Socket) {
    this.removeUser(client.id);
    this.server.emit('getUsers', this.users);
  }

  @SubscribeMessage('joinUser')
  joinUser(client: Socket, userId: string) {
    client.join(`users:${userId}`);
  }
}
