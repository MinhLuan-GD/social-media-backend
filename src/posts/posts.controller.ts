import { Routes, Services } from '@/utils/constants';
import { UpdateCommentDetails } from '@/utils/types';
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
  Inject,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateCommentDto } from './dtos/CreateComment.dto';
import { CreatePostDto } from './dtos/CreatePost.dto';
import { IPostsService } from './posts';

@SkipThrottle()
@Controller(Routes.POSTS)
export class PostsController {
  constructor(@Inject(Services.POSTS) private postsService: IPostsService) {}

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
    return this.postsService.createComment(req.user._id, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-comment')
  async updateComment(
    @Request() req: RequestWithUser,
    @Body() updateCommentDetails: UpdateCommentDetails,
  ) {
    return this.postsService.updateComment(req.user._id, updateCommentDetails);
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }
}
