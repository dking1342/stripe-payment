import Stripe from 'stripe';

export const customer1: Stripe.CustomerCreateParams = {
  description: 'new customer',
  email: 'customer1@example.com',
};
