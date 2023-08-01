import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const SECRET = process.env.SECRET_KEY!;
const stripe = new Stripe(SECRET, {
  apiVersion: '2022-11-15',
});

export const GET = async () => {
  try {
    const customers = (await stripe.customers.list()).data;
    return NextResponse.json(
      {
        success: true,
        message: 'retrieved all customers',
        customers: customers.length,
        payload: customers,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: err.message,
        payload: ['not', 'working'],
      },
      {
        status: 400,
        statusText: err.message,
      }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const params: Stripe.CustomerCreateParams = await req.json();
    const customer = await stripe.customers.create(params);
    return NextResponse.json(
      {
        success: true,
        message: 'created customer',
        payload: customer,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message, payload: null },
      { status: 400, statusText: err.message }
    );
  }
};
