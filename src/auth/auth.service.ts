import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthState } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(body: AuthState) {
    try {
      const hash = await argon.hash(body.password);
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          hash,
        },
      });
      return this.signInToken(user.email, user.id);
    } catch (error) {
      if (error.constructor.name === PrismaClientKnownRequestError.name) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
        return 'Something went wrong';
      }
      throw error;
    }
  }

  async signIn(body: AuthState) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) throw new ForbiddenException('Invalid credentials');

    const valid = await argon.verify(user.hash, body.password);
    if (!valid) throw new ForbiddenException('Invalid credentials');

    return this.signInToken(user.email, user.id);
  }

  async signInToken(email: string, id: number) {
    const payload = {
      sub: id,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('ACCESS_TOKEN_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
