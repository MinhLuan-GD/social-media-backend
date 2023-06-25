import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/users/schemas/user.schema';
import { Services } from '@/utils/constants';
import { EventsModule } from '@/gateway/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EventsModule,
  ],
  providers: [
    {
      provide: Services.CHAT,
      useClass: ChatService,
    },
  ],
  controllers: [ChatController],
  exports: [
    {
      provide: Services.CHAT,
      useClass: ChatService,
    },
  ],
})
export class ChatModule {}
