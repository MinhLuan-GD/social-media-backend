import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  @Length(2, 30, { message: 'First name must be between 2 and 30 characters' })
  first_name: string;

  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  @Length(2, 30, { message: 'Last name must be between 2 and 30 characters' })
  last_name: string;

  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'This field is not empty!' })
  @IsString()
  @Length(6, 40, { message: 'Passwords must be at least 6 characters' })
  password: string;

  @IsIn(['male', 'female', 'option'])
  gender: string;

  @IsString()
  @IsNotEmpty({ message: 'This field is not empty!' })
  bYear: string;

  @IsString()
  @IsNotEmpty({ message: 'This field is not empty!' })
  bMonth: string;

  @IsString()
  @IsNotEmpty({ message: 'This field is not empty!' })
  bDay: string;
}
