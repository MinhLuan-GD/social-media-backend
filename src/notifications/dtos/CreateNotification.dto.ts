import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  from: string;

  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  icon: string;

  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  text: string;
}
