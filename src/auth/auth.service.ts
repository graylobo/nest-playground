import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { privateKey } from 'src/libs/constants';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { Token } from 'src/entities/token.entity';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { sendEmail } from 'src/libs/email/sendEmail';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(data: CreateUserDto) {
    let user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (user) {
      throw new Error('Email already exist');
    }
    user = new User(data);
    const token = sign({ id: user.id }, privateKey, { algorithm: 'RS256' });
    user = await this.userRepository.save(user);
    return { ...user, token };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    const { id, name } = user;

    if (!user) throw new Error('User does not exist');
    try {
      let token = await this.tokenRepository.findOne({
        where: { id: user.id },
      });
      if (token) await this.tokenRepository.delete(token);
      const resetToken = randomBytes(32).toString('hex');
      const hash = await bcrypt.hash(
        resetToken,
        Number(process.env.BCRYPT_SALT),
      );

      token = new Token({
        id,
        token: hash,
      });

      this.tokenRepository.save(token);

      const link = `${process.env.CLIENT_URL}/passwordReset?token=${resetToken}&id=${user.id}`;
      const results = await sendEmail(
        user.email,
        'Password Reset Request',
        { name, link },
        './template/requestResetPassword.handlebars',
      );
      return link;
    } catch (error) {
      console.log('');
    }
  }

  async resetPassword(userId, token, password) {
    const passwordResetToken = await this.tokenRepository.findOne({
      where: { id: userId },
    });

    if (!passwordResetToken) {
      throw new Error('Invalid or expired password reset token');
    }
    // passwordResetToken.token에는 hash할때 사용한 salt값이 포함되어있고, compare 메서드 내부적으로
    // 이를 파싱해서 salt값을 추출해서 compare를 해주므로 hash할때처럼 별도로 salt값을 제공하지 않아도 된다.
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      throw new Error('Invalid or expired password reset token');
    }
    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    updatedUser.password = hash;
    await this.userRepository.save(updatedUser);

    sendEmail(
      updatedUser.email,
      'Password Reset Successfully',
      {
        name: updatedUser.name,
      },
      './template/resetPassword.handlebars',
    );
    await this.tokenRepository.delete(passwordResetToken);
    return true;
  }
}
