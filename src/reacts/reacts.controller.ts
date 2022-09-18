import { RequestWithUser } from '@auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import {
  Body,
  Controller,
  Patch,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { ReactsService } from './reacts.service';

@Controller('reacts')
export class ReactsController {
  constructor(private reactsService: ReactsService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('react-post')
  async reactPost(@Request() req: RequestWithUser, @Body() body: any) {
    const { postId, react } = body;
    return this.reactsService.reactPost(req.user._id, postId, react);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-reacts/:id')
  async getReacts(
    @Request() req: RequestWithUser,
    @Param('id') postId: string,
  ) {
    return this.reactsService.getReacts(req.user._id, postId);
  }
}
