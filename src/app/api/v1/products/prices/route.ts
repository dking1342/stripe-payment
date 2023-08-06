import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const POST = async (req: Request) => {
  try {
    const {
      name,
      description,
      unit_amount,
      currency,
      images,
      recurring: sub,
    } = await req.json();

    const product = await stripe.products.create({
      name,
      description,
      images: [`${images}`],
      default_price_data: {
        currency,
        unit_amount,
        recurring: { interval: sub.interval },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'price set',
        payload: product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: err.message,
        payload: null,
      },
      {
        status: 400,
      }
    );
  }
};
