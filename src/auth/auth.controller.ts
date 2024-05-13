import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Body() user: any) {
    const res = this.authService.login(user);
    return res;
  }

  @Post('signup')
  async signup(@Body() data: CreateUserDto) {
    const res = this.authService.signup(data);
    return res;
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    const res = this.authService.requestPasswordReset(email);
    return res;
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('id') id: string,
    @Body('password') password: string,
  ) {
    const res = this.authService.resetPassword(id, token, password);
    return res;
  }
}
