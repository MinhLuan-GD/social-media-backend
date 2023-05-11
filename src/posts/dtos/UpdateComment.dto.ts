export class UpdateCommentDto {
  id: string;

  postId: string;

  parentId: string;

  whoCanSee: string;

  comment: string;

  image: string;
}
