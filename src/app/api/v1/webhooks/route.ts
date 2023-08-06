// import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../constants';
import { apiError } from '../../../utils/apiError';
import { NextResponse } from 'next/server';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const POST = async (req: Request) => {
  try {
    const body = await req.text();
    const sig: string = req.headers.get('stripe-signature') as string;
    const whsec: string = process.env.WEBHOOK_SECRET_LOCAL as string;

    let event: Stripe.Event;
    event = stripe.webhooks.constructEvent(body, sig, whsec);
    // console.log(event);

    switch (event.type) {
      case 'invoice.created':
        console.log('invoice was created');
        break;
      case 'invoice.updated':
        console.log('invoice was updated');
        break;
      case 'invoiceitem.created':
        console.log('invoice item created');
        break;
      case 'invoice.updated':
        console.log('invoice updated');
        break;
      case 'payment_intent.created':
        console.log('payment intent created');
        break;
      case 'payment_intent.succeeded':
        console.log('payment intent succeeded');
        break;
      case 'invoice.finalized':
        console.log('invoice finalized');
        break;
      case 'invoice.sent':
        console.log('invoice has been sent');
        break;
      case 'charge.succeeded':
        console.log('charge succeeded');
        break;

      default:
        console.log(`unknown event: ${event.type}`);
        break;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'successful webhook post',
        payload: event,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    apiError(error);
  }
};
