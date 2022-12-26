import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'User is not empty!' })
  @IsString()
  user: string;

  @IsNotEmpty({ message: 'Text is not empty!' })
  @IsString()
  text: string;

  @IsString()
  image: string;
}
