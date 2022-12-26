import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class CreateImageDto {
  @IsString()
  url: string;
}

enum TypePost {
  ProfilePicture = 'profilePicture',
  CoverPicture = 'coverPicture',
}

export class CreatePostDto {
  @IsEnum(TypePost, {
    message: "Type is enum ['profilePicture', 'coverPicture']",
  })
  type: string;

  text: string;

  images: CreateImageDto[];

  @IsString()
  @IsNotEmpty({ message: 'User is not empty!' })
  user: string;

  background: string;
}
