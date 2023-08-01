import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';
import { apiError } from '@/app/utils/apiError';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const GET = async () => {
  try {
    return NextResponse.json(
      {
        success: true,
        message: 'get',
        payload: [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return apiError(error);
  }
};

// export const POST = async (req: Request) => {
//   try {
//     // get product id
//     const { id } = await req.json();
//     // fetch product by id and retrieve price, currency
//     const product: Stripe.Product = await stripe.products.retrieve(id, {
//       expand: ['default_price'],
//     });

//     // populate payment intent with product info
//     const default_price: Stripe.Price | null = product.default_price
//       ? (product.default_price! as Stripe.Price)
//       : null;

//     const details = default_price
//       ? { price: default_price.unit_amount, currency: default_price.currency }
//       : null;

//     if (details && Object.values(details) && details.price) {
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: details.price,
//         currency: details.currency,
//         automatic_payment_methods: { enabled: true },
//       });
//       return NextResponse.json({
//         success: true,
//         message: 'post payment intent',
//         payload: paymentIntent.client_secret,
//       });
//     } else {
//       const error: Error = { message: 'invalid product', name: 'error' };
//       apiError(error);
//     }
//   } catch (error) {
//     apiError(error);
//   }
// };

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: body.currency,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      success: true,
      message: 'post payment intent',
      payload: paymentIntent.client_secret,
    });
  } catch (error) {
    apiError(error);
  }
};
