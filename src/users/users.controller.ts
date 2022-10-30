import { RequestWithUser } from '@auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Body,
  Patch,
  Put,
  Post,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';

@SkipThrottle()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('get-user-picture')
  async getUserPicture(@Body('email') email: string) {
    return this.usersService.getUserPicture(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-profile/:username')
  async getProfile(
    @Request() req: RequestWithUser,
    @Param('username') username: string,
  ) {
    return this.usersService.getProfile(req.user._id, username);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-profile-picture')
  async updateProfilePicture(
    @Request() req: RequestWithUser,
    @Body('url') url: string,
  ) {
    this.usersService.updateUser({ _id: req.user._id }, { picture: url });
    return url;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-cover')
  async updateCover(@Request() req: RequestWithUser, @Body('url') url: string) {
    this.usersService.updateUser({ _id: req.user._id }, { cover: url });
    return url;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-details')
  async updateDetails(
    @Request() req: RequestWithUser,
    @Body('infos') infos: string,
  ) {
    const { details } = await this.usersService.updateUser(
      { _id: req.user._id },
      { details: infos },
      { new: true },
    );
    return details;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add-friend/:id')
  async addFriend(
    @Request() req: RequestWithUser,
    @Param('id') receiverId: string,
  ) {
    return this.usersService.addFriend(req.user._id, receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cancel-request/:id')
  async cancelRequest(
    @Request() req: RequestWithUser,
    @Param('id') receiverId: string,
  ) {
    return this.usersService.cancelRequest(req.user._id, receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('follow/:id')
  async follow(
    @Request() req: RequestWithUser,
    @Param('id') receiverId: string,
  ) {
    return this.usersService.follow(req.user._id, receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('unfollow/:id')
  async unfollow(
    @Request() req: RequestWithUser,
    @Param('id') receiverId: string,
  ) {
    return this.usersService.unfollow(req.user._id, receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('accept-request/:id')
  async acceptRequest(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.usersService.acceptRequest(id, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('unfriend/:id')
  async unfriend(
    @Request() req: RequestWithUser,
    @Param('id') receiverId: string,
  ) {
    return this.usersService.unfriend(req.user._id, receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delete-request/:id')
  async deleteRequest(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteRequest(id, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('search/:searchTerm')
  async search(@Param('searchTerm') searchTerm: string) {
    // console.log(`searching:::${searchTerm}`);
    return this.usersService.search(searchTerm);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add-to-search-history')
  async addToSearchHistory(
    @Request() req: RequestWithUser,
    @Body('searchUser') searchUser: string,
  ) {
    return this.usersService.addToSearchHistory(req.user._id, searchUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-search-history')
  async getSearchHistory(@Request() req: RequestWithUser) {
    return this.usersService.getSearchHistory(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('remove-from-search')
  async removeFromSearch(
    @Request() req: RequestWithUser,
    @Body('searchUser') searchUser: string,
  ) {
    return this.usersService.removeFromSearch(req.user._id, searchUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-friends-page-infos')
  async getFriendsPageInfos(@Request() req: RequestWithUser) {
    return this.usersService.getFriendsPageInfos(req.user._id);
  }
}
