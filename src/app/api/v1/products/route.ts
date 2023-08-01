import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../constants';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const GET = async () => {
  try {
    const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price'],
    });
    return NextResponse.json(
      {
        success: true,
        message: 'get product list',
        payload: products.data,
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
        payload: null,
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
    const { name, description, images, unit_amount, currency } =
      await req.json();

    const product = await stripe.products.create({
      name,
      description,
      images,
      default_price_data: {
        unit_amount,
        currency,
      },
      expand: ['default_price'],
    });
    return NextResponse.json(
      {
        success: true,
        message: 'created product',
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
        statusText: err.message,
      }
    );
  }
};
