import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtOpts } from '@config/async.config';
import { UsersModule } from '@users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthUtil } from './auth.util';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.registerAsync(jwtOpts)],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthUtil],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
