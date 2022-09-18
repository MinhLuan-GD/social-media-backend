import { RequestWithUser } from '@/auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  Body,
  Controller,
  Put,
  UseGuards,
  Request,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Put('create-post')
  async createPost(@Body() input: any) {
    return this.postsService.createPost(input);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all-posts')
  async getAllPosts(@Request() req: RequestWithUser) {
    return this.postsService.getAllPosts(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('comment')
  async comment(
    @Request() req: RequestWithUser,
    @Body() body: { comment: string; image: string; postId: string },
  ) {
    const { comment, image, postId } = body;
    return this.postsService.comment(req.user._id, comment, image, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('save-post/:id')
  async savePost(@Request() req: RequestWithUser, @Param('id') id: string) {
    console.log(`save-post:::id:::${id}`);
    return this.postsService.savePost(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-post/:id')
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
