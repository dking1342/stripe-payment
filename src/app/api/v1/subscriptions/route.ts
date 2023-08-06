import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../constants';
import { apiError } from '../../../utils/apiError';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const GET = async () => {
  try {
    return NextResponse.json({
      success: true,
      message: 'get subs',
      payload: null,
    });
  } catch (error) {
    apiError(error);
  }
};

export const POST = async (req: Request) => {
  try {
    const { customerId, priceId } = await req.json();

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'post sub',
        payload: subscription,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    apiError(error);
  }
};
