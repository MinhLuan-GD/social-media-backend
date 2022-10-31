import { RequestWithUser } from '@auth/interfaces/auth.interface';
import { Routes, Services } from '@/utils/constants';
import {
  Body,
  Controller,
  Get,
  Inject,
  Request,
  UseGuards,
} from '@nestjs/common';
import { INotificationService } from './notifications';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateNotificationDto } from './dtos/CreateNotification.dto';

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
  @Get()
  async createNotification(
    @Request() req: RequestWithUser,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.createNotification(
      req.user._id,
      createNotificationDto,
    );
  }
}
