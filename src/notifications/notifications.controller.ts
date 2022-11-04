import { RequestWithUser } from '@auth/interfaces/auth.interface';
import { Routes, Services } from '@/utils/constants';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { INotificationService } from './notifications';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateNotificationDto } from './dtos/CreateNotification.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller(Routes.NOTIFICATIONS)
export class NotificationsController {
  constructor(
    @Inject(Services.NOTIFICATIONS)
    private notificationsService: INotificationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotifications(@Request() req: RequestWithUser) {
    return this.notificationsService.getNotifications(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/delivered')
  async notificationDelivered(@Param('id') notificationId: string) {
    return this.notificationsService.notificationDelivered(notificationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/seen')
  async notificationSeen(@Param('id') notificationId: string) {
    return this.notificationsService.notificationSeen(notificationId);
  }
}
