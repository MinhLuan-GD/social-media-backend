import { RequestWithUser } from '@auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import {
  Controller,
  Put,
  UseGuards,
  Request,
  Body,
  Patch,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/message.dto';

@SkipThrottle()
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Put('conversations')
  async conversations(@Request() req: RequestWithUser) {
    return this.chatService.conversations(req.user._id);
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
}
