import { Routes, Services } from '@/utils/constants';
import { RequestWithUser } from '@/auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  Controller,
  Put,
  UseGuards,
  Request,
  Body,
  Patch,
  Inject,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { IChatService } from './chat';
import { CreateMessageDto } from './dtos/CreateMessage.dto';

@SkipThrottle()
@Controller(Routes.CHAT)
export class ChatController {
  constructor(@Inject(Services.CHAT) private chatService: IChatService) {}

  @UseGuards(JwtAuthGuard)
  @Put('conversations')
  async conversations(@Request() req: RequestWithUser) {
    return this.chatService.conversations(req.user._id, 0);
  }

  @UseGuards(JwtAuthGuard)
  @Put('message')
  async addMessage(
    @Request() req: RequestWithUser,
    @Body() body: CreateMessageDto,
  ) {
    const { user, text, image } = body;
    return this.chatService.addMessage(req.user._id, user, text, image);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('seen-message')
  async userSeen(@Body() body: any) {
    const { conversationId, messageId } = body;
    return this.chatService.messageSeen(conversationId, messageId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delivered-message')
  async deliveredMessage(@Body() body: any) {
    const { conversationId, messageId } = body;
    return this.chatService.deliveredMessage(conversationId, messageId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('seen-all-message')
  async seenAll(@Body() body: any) {
    const { conversationId } = body;
    return this.chatService.seenAll(conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delivered-all-message')
  async deliveredAll(@Body() body: any) {
    const { conversationId } = body;
    return this.chatService.deliveredAll(conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('seen-all-conversations')
  async seenAllConversations(@Request() req: RequestWithUser) {
    return this.chatService.seenAllConversations(req.user._id);
  }
}
