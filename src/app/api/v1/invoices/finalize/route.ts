import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
  } catch (error) {}
};
