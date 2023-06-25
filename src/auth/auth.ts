import { CreateUserDto } from './dtos/CreateUser.dto';
import { AuthUser } from './interfaces/auth.interface';

export interface IAuthService {
  validateUser(email: string, pass: string): Promise<any>;

  getToken(
    payload: any,
    expiresIn: string | number,
  ): Promise<{ token: string }>;

  login(id: string, email: string): Promise<{ token: string }>;

  signup(input: CreateUserDto): Promise<AuthUser & { token: string }>;

  activate(id: string, token: string): Promise<string>;

  sendVerification(id: string): Promise<string>;

  sendResetPasswordCode(email: string): Promise<string>;

  validateResetCode(email: string, code: string): Promise<{ token: string }>;

  changePassword(email: string, iPassword: string): Promise<string>;
}
