import { RequestWithUser } from '@/auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ChatService } from './chat.service';

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
  async getFriend(@Request() req: RequestWithUser, @Body() body: any) {
    const { user, text } = body;
    return this.chatService.addMessage(req.user._id, user, text);
  }
}
