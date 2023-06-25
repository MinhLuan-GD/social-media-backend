export class CreateCommentDto {
  postId: string;

  parentId: string;

  comment: string;

  image: string;

  socketId: string;
}
