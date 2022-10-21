import { RequestWithUser } from '@auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import {
  Controller,
  Put,
  UseGuards,
  Request,
  Body,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/message.dto';

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
  async getFriend(
    @Request() req: RequestWithUser,
    @Body() body: CreateMessageDto,
  ) {
    const { user, text } = body;
    return this.chatService.addMessage(req.user._id, user, text);
  }

  @UseGuards(JwtAuthGuard)
  @Put('user-seen/:id')
  async userSeen(@Param('id') id: string) {
    return this.chatService.userSeen(id);
  }
}
