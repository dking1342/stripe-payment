import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';
import { apiError } from '../../../../utils/apiError';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const GET = async () => {
  try {
    const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price'],
    });

    let filteredProducts: Stripe.Product[] = [];

    if (products.data.length) {
      filteredProducts = products.data.filter((product) => {
        const def_price = product.default_price as Stripe.Price;
        return def_price.recurring;
      });
    }

    return NextResponse.json({
      success: true,
      message: 'get subscriptions',
      count: products.data.length,
      payload: filteredProducts,
    });
  } catch (error) {
    console.log({ error });
    apiError(error);
  }
};
