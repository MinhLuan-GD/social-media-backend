import { IsNotEmpty, IsString } from 'class-validator';

class CreateImageDto {
  @IsString()
  url: string;
}

export class CreatePostDto {
  type: string;

  text: string;

  images: CreateImageDto[];

  @IsString()
  @IsNotEmpty()
  user: string;

  background: string;
}
