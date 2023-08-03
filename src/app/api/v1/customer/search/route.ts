import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';
import { ApiError } from 'next/dist/server/api-utils';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const POST = async (req: Request) => {
  try {
    const { name, email } = await req.json();
    let customer: Stripe.Customer;

    const customerSearch = await stripe.customers.search({
      query: `name:\'${name}\' AND email:\'${email}\'`,
    });

    if (!customerSearch.data.length) {
      const newCustomer = await stripe.customers.create({
        name,
        email,
        description: 'new customer',
      });
      customer = newCustomer;
    } else {
      customer = customerSearch.data[0];
    }

    return NextResponse.json(
      {
        success: true,
        message: 'search customer successful',
        payload: customer,
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
      }
    );
  }
};
