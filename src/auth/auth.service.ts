import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';

import { RegisterDto, LoginDto } from './dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private stripe: StripeService
  ) {}

  async register({ email, password, username }: RegisterDto) {
    const hash = await argon.hash(password);
    try {
      const customer = await this.stripe.createCustomer(email, username);
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
          username,
          stripeCustomerId: customer.id
        }
      });

      return await this.signJWT(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User credentials already taken');
        }
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) throw new ForbiddenException('Invalid user credentials');

    const isPasswordValid = await argon.verify(user.hash, dto.password);

    if (!isPasswordValid) throw new ForbiddenException('Invalid user credentials');

    return await this.signJWT(user.id, user.email);
  }

  async signJWT(userId: number, email: string): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: this.config.get('JWT_SECRET')
    });

    return {
      accessToken: token
    };
  }
}
