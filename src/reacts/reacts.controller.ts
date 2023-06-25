import { Routes, Services } from '@/utils/constants';
import { RequestWithUser } from '@/auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  Body,
  Controller,
  Patch,
  UseGuards,
  Request,
  Get,
  Param,
  Inject,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { IReactsService } from './reacts';

@SkipThrottle()
@Controller(Routes.REACTS)
export class ReactsController {
  constructor(@Inject(Services.REACTS) private reactsService: IReactsService) {}

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
