import {
  CreateCommentDetails,
  CreatePostDetails,
  UpdateCommentDetails,
} from '@/utils/types';
import { Post } from './schemas/post.schema';

export interface IPostsService {
  createPost(createPostDetails: CreatePostDetails): Promise<Post>;

  getAllPosts(id: string): Promise<Post[]>;

  createComment(
    commentBy: string,
    createCommentDetails: CreateCommentDetails,
  ): Promise<any[]>;

  updateComment(
    commentBy: string,
    updateCommentDetails: UpdateCommentDetails,
  ): Promise<any[]>;

  deleteComment(commentBy: string, _id: string, post: string): Promise<any[]>;

  savePost(id: string, post: string): Promise<string>;

  deletePost(id: string): Promise<{ status: string }>;

  reactPost(postId: string, userId: string, react: string): Promise<string>;
}
