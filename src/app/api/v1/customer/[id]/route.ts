import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const GET = async (req: Request) => {
  try {
    const id = req.url.split('/').slice(-1)[0];
    const customer = await stripe.customers.retrieve(id);

    return NextResponse.json(
      { success: true, message: 'retrieved customer', payload: customer },
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
        status: 404,
        statusText: err.message,
      }
    );
  }
};

export const PUT = async (req: Request) => {
  try {
    const id = req.url.split('/').slice(-1)[0];
    const body: Stripe.CustomerCreateParams = await req.json();
    const updatedCustomer = await stripe.customers.update(id, body);

    if (updatedCustomer) {
      const customer = await stripe.customers.retrieve(id);

      return NextResponse.json(
        {
          success: true,
          message: 'updated customer',
          payload: customer,
        },
        {
          status: 201,
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'unable to update customer',
          payload: null,
        },
        {
          status: 400,
        }
      );
    }
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

export const DELETE = async (req: Request) => {
  try {
    const id = req.url.split('/').slice(-1)[0];
    const deletedCustomer = await stripe.customers.del(id);

    if (deletedCustomer.deleted) {
      return NextResponse.json(
        {
          success: true,
          message: 'customer removed',
          payload: deletedCustomer,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'unable to remove customer',
          payload: null,
        },
        {
          status: 400,
        }
      );
    }
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
