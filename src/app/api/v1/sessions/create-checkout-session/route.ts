import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const GET = async () => {
  try {
    return NextResponse.json(
      { success: true, message: 'get', payload: [] },
      { status: 200 }
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

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const session = await stripe.checkout.sessions.create({
      success_url: `${CONSTANT.domain}/success`,
      cancel_url: `${CONSTANT.domain}/cancel`,
      line_items: [
        {
          price: body.productSelect.price_id,
          quantity: body.productSelect.quantity,
        },
      ],
      mode: 'payment',
    });

    return NextResponse.json(
      { success: true, message: 'post', payload: session },
      { status: 201 }
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
        statusText: err.message,
      }
    );
  }
};
