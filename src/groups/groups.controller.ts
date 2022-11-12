import { Routes, Services } from '@/utils/constants';
import { Controller, Inject } from '@nestjs/common';
import { IGroupsService } from './groups';

@Controller(Routes.GROUPS)
export class GroupsController {
  constructor(@Inject(Services.GROUPS) private groupsService: IGroupsService) {}
}
