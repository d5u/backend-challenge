import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { PaymentsService } from './payments.service';
import { ChargeDonationDto } from './dto/payments.dto';

import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @HttpCode(HttpStatus.OK)
  @Get('list')
  async fetchPaymentsList(@GetUser('email') email: string) {
    return await this.payments.fetchPaymentsList(email);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('charge')
  async chargeDonation(@GetUser() user: User, @Body() dto: ChargeDonationDto) {
    return await this.payments.chargeDonation(user, dto);
  }
}
