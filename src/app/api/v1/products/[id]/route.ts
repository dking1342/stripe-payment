import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';
import { apiError } from '../../../../utils/apiError';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const GET = async (req: Request) => {
  try {
    const body = await req.json();
    const product = await stripe.products.retrieve(body.id);

    return NextResponse.json(
      {
        success: true,
        message: 'get product',
        payload: product,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    apiError(error);
  }
};
