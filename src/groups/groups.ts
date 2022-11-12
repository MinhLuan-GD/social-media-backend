export interface IGroupsService {
  createGroup(params);
  modifyGroup(params);
  listGroups(filter, limit, skip);
  findGroup(filter);
}
