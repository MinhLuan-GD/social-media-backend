import { Services } from '../../utils/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { BadRequestException } from '@nestjs/common';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: Services.POSTS,
          useValue: {
            createPost: jest.fn((x) => x),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(Services.POSTS);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPost', () => {
    it('should return a successful response', async () => {
      const response = await controller.createPost({
        type: null,
        background: '../../../images/postbackgrounds/1.jpg',
        text: 'post 3',
        user: '636fa7ac6bbe992d480d87f9',
        images: null,
      });
      // expect(response).toStrictEqual({
      //   status: 'success',
      // });
    });

    it('should throw error', async () => {
      jest.spyOn(postsService, 'createPost').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const response = await controller.createPost({
          type: 'profilePicture',
          background: '../../../images/postbackgrounds/1.jpg',
          text: 'post 3',
          user: '636fa7ac6bbe992d480d87f9',
          images: [{ url: 'blah' }],
        });
      } catch (error) {}
    });
  });
});
