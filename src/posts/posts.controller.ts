import { RequestWithUser } from '@auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
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
import { CreateCommentDto } from './dto/comment.dto';
import { CreatePostDto } from './dto/post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Put('create-post')
  async createPost(@Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(createPostDto);
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
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.comment(req.user._id, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-comment')
  async updateComment(
    @Request() req: RequestWithUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.updateComment(req.user._id, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('delete-comment')
  async deleteComment(@Request() req: RequestWithUser, @Body() body: any) {
    return this.postsService.deleteComment(req.user._id, body.id, body.post);
  }

  @UseGuards(JwtAuthGuard)
  @Put('save-post/:id')
  async savePost(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.postsService.savePost(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-post/:id')
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
