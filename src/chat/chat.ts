import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';

export interface IChatService {
  conversations(id: string, skip: number): Promise<Conversation[]>;

  addMessage(
    sender: string,
    receiver: string,
    text: string,
    image: string,
  ): Promise<Conversation>;

  messageSeen(conversationId: string, messageId: string): Promise<string>;

  deliveredMessage(conversationId: string, messageId: string): Promise<string>;

  seenAll(conversationId: string): Promise<Message[]>;

  deliveredAll(conversationId: string): Promise<Message[]>;
}
