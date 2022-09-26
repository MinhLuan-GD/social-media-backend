import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  user: string;

  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  text: string;
}
