import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts.service';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('PostsService', () => {
  let service: PostsService;
  let postsModel: Model<PostDocument>;
  let usersModel: Model<UserDocument>;

  const postsModelToken = getModelToken(Post.name);
  const usersModelToken = getModelToken(User.name);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: postsModelToken,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: usersModelToken,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsModel = module.get<Model<PostDocument>>(postsModelToken);
    usersModel = module.get<Model<UserDocument>>(usersModelToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('postsModel should be defined', () => {
    expect(postsModel).toBeDefined();
  });

  it('usersModel should be defined', () => {
    expect(usersModel).toBeDefined();
  });

  describe('createPost', () => {
    it('should create posts', async () => {
      await service.createPost({
        type: 'profilePicture',
        background: '../../../images/postbackgrounds/1.jpg',
        text: 'post 3',
        user: '636fa7ac6bbe992d480d87f9',
        images: [{ url: 'blah' }],
      });
      expect(postsModel.create).toHaveBeenCalledWith({
        type: 'profilePicture',
        background: '../../../images/postbackgrounds/1.jpg',
        text: 'post 3',
        user: '636fa7ac6bbe992d480d87f9',
        images: [{ url: 'blah' }],
      });
      expect(postsModel.create);
    });
  });
});
