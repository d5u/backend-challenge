import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService extends Stripe {
  constructor(config: ConfigService) {
    super(config.get('STRIPE_SECRET_KEY'), { apiVersion: '2022-11-15' });
  }

  async createCustomer(email: string, username: string): Promise<Stripe.Response<Stripe.Customer>> {
    return await this.customers.create({
      email,
      metadata: { username }
    });
  }
}
