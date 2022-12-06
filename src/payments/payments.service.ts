import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { ChargeDonationDto } from './dto/payments.dto';

import { StripeService } from 'src/stripe/stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private stripe: StripeService, private prisma: PrismaService) {}

  async fetchPaymentsList(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email
      },
      select: {
        payments: {
          select: {
            amount: true,
            createdAt: true,
            paymentId: true
          }
        }
      }
    });

    return {
      donations: user.payments
    };
  }

  async chargeDonation(
    { id, stripeCustomerId }: User,
    { amount, cardNumber, expMonth, expYear, cvc }: ChargeDonationDto
  ) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: expMonth,
          exp_year: expYear,
          cvc
        }
      });

      const paymentIntent = await this.stripe.paymentIntents.create({
        payment_method: paymentMethod.id,
        amount: amount * 100,
        currency: 'usd',
        confirm: true,
        payment_method_types: ['card'],
        customer: stripeCustomerId
      });

      await this.prisma.payment.create({
        data: {
          paymentId: paymentIntent.id,
          amount,
          userId: id
        }
      });

      return { paymentId: paymentIntent.id };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
